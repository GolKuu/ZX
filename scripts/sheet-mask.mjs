// Polygon cutting for the sprite slicer.
//
// A rectangle cannot separate a limb from the body it is drawn over. In a profile
// view the near arm lies across the torso and its hand across the skirt, so any
// torso rectangle contains the sleeve and any hips rectangle contains the glove.
// Cutting the arm as a *second* rectangle then puts the same sleeve on screen
// twice, and the two copies rotate independently — a limb that visibly splits in
// half.
//
// So a part may instead declare a polygon. Its pixels are cut along that outline,
// and the same outline is erased from the rest of the drawing, leaving a hole that
// gets filled from the surrounding costume. Every pixel then belongs to exactly
// one part.

/**
 * Scanline rasteriser, even-odd rule. Returns one byte per pixel.
 *
 * Sampled at pixel centres so a polygon edge lands between pixels rather than on
 * one, which keeps two abutting polygons from both claiming the boundary row.
 */
export function rasterisePolygon(polygon, width, height) {
  const mask = new Uint8Array(width * height);
  const crossings = [];
  for (let y = 0; y < height; y += 1) {
    const scan = y + 0.5;
    crossings.length = 0;
    for (let index = 0; index < polygon.length; index += 1) {
      const [ax, ay] = polygon[index];
      const [bx, by] = polygon[(index + 1) % polygon.length];
      if ((ay <= scan && by > scan) || (by <= scan && ay > scan)) {
        crossings.push(ax + ((scan - ay) / (by - ay)) * (bx - ax));
      }
    }
    crossings.sort((left, right) => left - right);
    for (let pair = 0; pair + 1 < crossings.length; pair += 2) {
      const from = Math.max(0, Math.ceil(crossings[pair] - 0.5));
      const to = Math.min(width - 1, Math.floor(crossings[pair + 1] - 0.5));
      for (let x = from; x <= to; x += 1) mask[y * width + x] = 1;
    }
  }
  return mask;
}

export function unionMasks(masks, width, height) {
  const union = new Uint8Array(width * height);
  for (const mask of masks) {
    for (let index = 0; index < union.length; index += 1) {
      if (mask[index] === 1) union[index] = 1;
    }
  }
  return union;
}

/** Clears everything *outside* the mask, leaving only the part's own pixels. */
export function keepInside(data, mask) {
  for (let index = 0; index < mask.length; index += 1) {
    if (mask[index] === 0) data[index * 4 + 3] = 0;
  }
}

/**
 * Clears everything inside the mask and reports which pixels were actually
 * emptied — the ones that held costume, not the transparent margin. Only those
 * get refilled; growing into the original background would inflate the
 * silhouette.
 */
export function clearInside(data, mask) {
  const holes = new Uint8Array(mask.length);
  for (let index = 0; index < mask.length; index += 1) {
    if (mask[index] === 0) continue;
    if (data[index * 4 + 3] > 0) holes[index] = 1;
    data[index * 4 + 3] = 0;
  }
  return holes;
}

/** How far past a hole's edge to look for the colour to fill it with. */
const EDGE_SKIP = 2;
/** How far to keep looking for an opaque source before giving up on a row. */
const SEARCH = 6;

/**
 * Fills the holes the carve left, row by row, from the costume beside them.
 *
 * Row-wise and not by averaging neighbours: cel art is flat, and a torso cut open
 * down its side has jacket on one edge of every hole and nothing on the other, so
 * extending that one colour across reproduces the garment exactly. Averaging the
 * eight neighbours instead drags the black contour and the gold star trim into the
 * mix and fills the hole with grey streaks.
 *
 * The source is sampled a couple of pixels back from the hole's edge, because the
 * edge itself is the outline the polygon was cut along — antialiased ink, the one
 * colour that must not be smeared across a garment.
 */
export function inpaint(data, width, height, holes) {
  for (let y = 0; y < height; y += 1) {
    const reference = rowAverage(data, width, y, holes);
    let x = 0;
    while (x < width) {
      const index = y * width + x;
      if (holes[index] === 0 || data[index * 4 + 3] > 0) {
        x += 1;
        continue;
      }
      let end = x;
      while (end + 1 < width) {
        const next = y * width + end + 1;
        if (holes[next] === 0 || data[next * 4 + 3] > 0) break;
        end += 1;
      }
      const left = sampleRow(data, width, y, x - 1 - EDGE_SKIP, -1);
      const right = sampleRow(data, width, y, end + 1 + EDGE_SKIP, 1);
      paintRun(data, width, y, x, end, pickSource(left, right, reference));
      x = end + 1;
    }
  }
  // Rows with no costume either side — a hole that spans the whole figure at that
  // height — fall back to growing down from whatever has been filled above.
  growVertically(data, width, height, holes);
  // Where the hole's edge runs along piping or a collar's braid, consecutive rows
  // extend different colours and the fill comes out banded. Blurring vertically
  // *within the fill only* turns those bands into a gradient nobody reads as an
  // edge. Real art is never a source or a target here, so nothing drawn can soften.
  softenFill(data, width, height, holes);
}

/** First opaque pixel from `from`, stepping by `step`, within `SEARCH`. */
function sampleRow(data, width, y, from, step) {
  for (let step_ = 0; step_ <= SEARCH; step_ += 1) {
    const x = from + step * step_;
    if (x < 0 || x >= width) return null;
    const index = (y * width + x) * 4;
    if (data[index + 3] > 0) {
      return [data[index], data[index + 1], data[index + 2]];
    }
  }
  return null;
}

/**
 * Mean colour of the row's *surviving* costume, used to decide which side of a
 * hole to fill it from.
 *
 * The two edges of a hole are often different garments — a hand cut out of a skirt
 * has white pleats on one side and the sash's magenta on the other. Blending
 * between them fills the skirt with a pink-grey wash that reads as a smudge the
 * moment the arm swings off it. Comparing each candidate against what the row is
 * mostly made of picks the garment instead of the accessory beside it, and is also
 * what stopped a collar's braid from being extended across a shoulder.
 */
function rowAverage(data, width, y, holes) {
  const totals = [0, 0, 0];
  let found = 0;
  for (let x = 0; x < width; x += 1) {
    const index = y * width + x;
    if (holes[index] === 1 || data[index * 4 + 3] === 0) continue;
    for (let channel = 0; channel < 3; channel += 1) {
      totals[channel] += data[index * 4 + channel];
    }
    found += 1;
  }
  if (found === 0) return null;
  return totals.map((total) => total / found);
}

function pickSource(left, right, reference) {
  if (left === null) return right;
  if (right === null) return left;
  if (reference === null) return left;
  return distance(left, reference) <= distance(right, reference) ? left : right;
}

function distance(colour, reference) {
  let total = 0;
  for (let channel = 0; channel < 3; channel += 1) {
    const delta = (colour[channel] ?? 0) - (reference[channel] ?? 0);
    total += delta * delta;
  }
  return total;
}

/** Flat fill: cel art has no gradients, so a gradient here is a visible seam. */
function paintRun(data, width, y, from, to, source) {
  if (source === null || source === undefined) return;
  for (let x = from; x <= to; x += 1) {
    const index = (y * width + x) * 4;
    for (let channel = 0; channel < 3; channel += 1) {
      data[index + channel] = source[channel] ?? 0;
    }
    data[index + 3] = 255;
  }
}

/** Vertical box blur, confined to pixels the fill created. */
function softenFill(data, width, height, holes, radius = 2, passes = 1) {
  const source = new Uint8Array(data.length);
  for (let pass = 0; pass < passes; pass += 1) {
    source.set(data);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = y * width + x;
        if (holes[index] === 0 || data[index * 4 + 3] === 0) continue;
        const totals = [0, 0, 0];
        let found = 0;
        for (let dy = -radius; dy <= radius; dy += 1) {
          const ny = y + dy;
          if (ny < 0 || ny >= height) continue;
          const neighbour = ny * width + x;
          if (holes[neighbour] === 0 || source[neighbour * 4 + 3] === 0) continue;
          for (let channel = 0; channel < 3; channel += 1) {
            totals[channel] += source[neighbour * 4 + channel];
          }
          found += 1;
        }
        if (found === 0) continue;
        for (let channel = 0; channel < 3; channel += 1) {
          data[index * 4 + channel] = Math.round(totals[channel] / found);
        }
      }
    }
  }
}

function growVertically(data, width, height, holes) {
  for (let y = 1; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      if (holes[index] === 0 || data[index * 4 + 3] > 0) continue;
      const above = ((y - 1) * width + x) * 4;
      if (data[above + 3] === 0) continue;
      const target = index * 4;
      data[target] = data[above];
      data[target + 1] = data[above + 1];
      data[target + 2] = data[above + 2];
      data[target + 3] = 255;
    }
  }
}
