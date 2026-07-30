// Removes the hitbox diagram painted over a sheet's attack panels.
//
// The attack columns on these sheets are documentation, not art: every pose has
// blue hurtbox, red hitbox and green collision rectangles drawn on top of it, each
// a saturated outline around a translucent fill. That does two kinds of damage.
//
//   1. The fills lift the costume's value, so a background flood-fill keyed on
//      brightness walks in from the paper *through a box* and eats the figure. That
//      is where the missing thighs and the detached boots came from — not from the
//      crop, from the key tunnelling along a box.
//   2. What survives is tinted lavender in rectangles, with dashed outlines across
//      it.
//
// Both are reversible, because a translucent rectangle is an affine map. Over a box
// the sheet shows `obs = m·art + c`, with `m = 1 − alpha` and `c = alpha·colour`,
// constant inside the rectangle. Recover the rectangles, measure `m` and `c` from
// the bare paper, and the original drawing comes back out.
//
// Nothing here is character-specific: the box palette is fixed by the sheets, and
// everything else is measured per panel.

/**
 * How far to grow the outlines before sealing.
 *
 * The outlines are dashed, and where one crosses dark hair its blue stops reading
 * as blue at all, so the traced boundary has gaps. Growing it bridges those: a gap
 * up to twice this closes. Too small and the fill leaks out and the box goes
 * uncorrected; too large and thin costume detail between two nearby boxes gets
 * swallowed into the mask and repainted.
 */
const SEAL = 4;

/** Local gradient below which a pixel is flat enough to be bare paper. */
const FLAT_LIMIT = 6;

/**
 * Fraction of the panel a single sealed region may claim before it is disbelieved.
 *
 * A leak makes the flood spill outward and the "inside" become most of the image.
 * Rejecting that keeps a broken trace from tinting the whole drawing, which is a
 * far worse failure than leaving one box uncleaned.
 */
const LEAK_LIMIT = 0.55;

/**
 * Minimum length of an axis-aligned run before a coloured pixel counts as a box
 * edge.
 *
 * This gate, not the colour test, is what makes the pass safe. Colour alone cannot
 * separate the diagram from these characters: a hurtbox's blue sits right beside the
 * blue-violet these sheets shade their whites with, and a hitbox's red sits right
 * beside IDOL's magenta. The first attempt used colour alone and repainted a fifth
 * of the drawing — her jacket read as hitbox red and her shadows as hurtbox blue.
 *
 * Geometry separates them cleanly instead. A box edge is a straight line tens of
 * pixels long; costume linework, however saturated, never runs straight and
 * axis-aligned for twenty pixels.
 */
const MIN_RUN = 20;

/**
 * The three box palettes, as hue windows.
 *
 * Read off a hue histogram of a panel, where the diagram and the costume land in
 * clearly separate bands: collision green at 110–130° with nothing of IDOL's in a
 * hundred degrees of it, hurtbox blue at 200–245° against her violet shading from
 * 255° up, and hitbox red at 0–12° against her magenta piled up at 330–350°.
 */
const FAMILIES = [
  { name: 'blue', from: 196, to: 248, minimumSaturation: 0.16 },
  { name: 'green', from: 96, to: 152, minimumSaturation: 0.13 },
  { name: 'red', from: 352, to: 372, minimumSaturation: 0.3 },
];

function luminance(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hueOf(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const chroma = max - min;
  if (chroma === 0) return { hue: 0, saturation: 0, value: max };
  let hue;
  if (max === r) hue = 60 * (((g - b) / chroma) % 6);
  else if (max === g) hue = 60 * ((b - r) / chroma + 2);
  else hue = 60 * ((r - g) / chroma + 4);
  if (hue < 0) hue += 360;
  return { hue, saturation: chroma / max, value: max };
}

function inFamily(family, r, g, b) {
  const { hue, saturation, value } = hueOf(r, g, b);
  if (saturation < family.minimumSaturation || value < 40) return false;
  // `to` may run past 360 so a window can straddle red.
  const wrapped = hue < family.from ? hue + 360 : hue;
  return wrapped >= family.from && wrapped <= family.to;
}

/**
 * Keep only the pixels of a mask that sit in a long straight run of it.
 *
 * Both axes, so a box's horizontal and vertical edges both survive while an isolated
 * saturated speck in the artwork does not.
 */
function straightRunsOnly(mask, width, height) {
  const kept = new Uint8Array(mask.length);
  const sweep = (length, stride, count) => {
    for (let line = 0; line < count; line += 1) {
      let run = 0;
      for (let step = 0; step <= length; step += 1) {
        const index = step < length ? line * stride.line + step * stride.step : -1;
        const on = index >= 0 && mask[index] === 1;
        if (on) {
          run += 1;
          continue;
        }
        if (run >= MIN_RUN) {
          for (let back = 1; back <= run; back += 1) {
            kept[line * stride.line + (step - back) * stride.step] = 1;
          }
        }
        run = 0;
      }
    }
  };
  sweep(width, { line: width, step: 1 }, height);
  sweep(height, { line: 1, step: width }, width);
  return kept;
}

function grow(mask, width, height, radius) {
  let current = mask;
  for (let pass = 0; pass < radius; pass += 1) {
    const next = new Uint8Array(current);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (current[y * width + x] === 0) continue;
        if (x > 0) next[y * width + x - 1] = 1;
        if (x + 1 < width) next[y * width + x + 1] = 1;
        if (y > 0) next[(y - 1) * width + x] = 1;
        if (y + 1 < height) next[(y + 1) * width + x] = 1;
      }
    }
    current = next;
  }
  return current;
}

/**
 * Recover the box rectangles from where their edges project onto each axis.
 *
 * Two earlier attempts failed on the same fact: these outlines are not continuous.
 * They are dashed, their corners are rounded, and each one vanishes wherever it
 * crosses dark hair, because a blue line over near-black is not blue. Pairing edge
 * runs directly found nothing. Growing the outlines and flooding inward leaked out
 * of every box through those gaps and cleaned one region out of twenty.
 *
 * Projection is tolerant of all of it. A box side contributes to one column of the
 * projection along its whole length, so gaps only lower a spike rather than break it.
 * Candidate sides are the spikes; a candidate rectangle is accepted when all four of
 * its sides can still be found in the mask along enough of their extent, which is
 * what keeps the combinatorial pairing from inventing boxes.
 */
function findRectangles(edges, width, height) {
  const columns = new Int32Array(width);
  const rows = new Int32Array(height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (edges[y * width + x] === 0) continue;
      columns[x] += 1;
      rows[y] += 1;
    }
  }

  const xs = peaks(columns, MIN_RUN);
  const ys = peaks(rows, MIN_RUN);
  const rectangles = [];
  for (let left = 0; left < xs.length; left += 1) {
    for (let right = left + 1; right < xs.length; right += 1) {
      if (xs[right] - xs[left] < MIN_RUN) continue;
      for (let top = 0; top < ys.length; top += 1) {
        for (let bottom = top + 1; bottom < ys.length; bottom += 1) {
          if (ys[bottom] - ys[top] < MIN_RUN) continue;
          const box = {
            left: xs[left], right: xs[right], top: ys[top], bottom: ys[bottom],
          };
          if (!sidesPresent(edges, width, height, box)) continue;
          rectangles.push(box);
        }
      }
    }
  }
  return rectangles;
}

/** Positions where a projection rises above a threshold, one per local cluster. */
function peaks(profile, threshold) {
  const found = [];
  let best = -1;
  for (let index = 0; index <= profile.length; index += 1) {
    const value = index < profile.length ? profile[index] : 0;
    if (value >= threshold) {
      if (best === -1 || value > profile[best]) best = index;
      continue;
    }
    if (best !== -1) found.push(best);
    best = -1;
  }
  return found;
}

/** How much of a candidate rectangle's perimeter is actually drawn. */
function sidesPresent(edges, width, height, box) {
  const near = (x, y) => {
    for (let dy = -2; dy <= 2; dy += 1) {
      for (let dx = -2; dx <= 2; dx += 1) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        if (edges[ny * width + nx] === 1) return true;
      }
    }
    return false;
  };
  const coverage = (from, to, at) => {
    let hits = 0;
    let total = 0;
    for (let step = from; step <= to; step += 1) {
      total += 1;
      if (near(...at(step))) hits += 1;
    }
    return total === 0 ? 0 : hits / total;
  };
  // Rounded corners mean the last few pixels of every side are missing by design,
  // so the ends are excluded before measuring.
  const insetX = Math.min(8, Math.floor((box.right - box.left) / 4));
  const insetY = Math.min(8, Math.floor((box.bottom - box.top) / 4));
  const sides = [
    coverage(box.left + insetX, box.right - insetX, (x) => [x, box.top]),
    coverage(box.left + insetX, box.right - insetX, (x) => [x, box.bottom]),
    coverage(box.top + insetY, box.bottom - insetY, (y) => [box.left, y]),
    coverage(box.top + insetY, box.bottom - insetY, (y) => [box.right, y]),
  ];
  return sides.every((value) => value >= 0.45);
}

/** How many rectangles cover each pixel. */
function layerCounts(rectangles, width, height) {
  const layers = new Uint8Array(width * height);
  for (const box of rectangles) {
    for (let y = Math.max(0, box.top); y <= Math.min(height - 1, box.bottom); y += 1) {
      for (let x = Math.max(0, box.left); x <= Math.min(width - 1, box.right); x += 1) {
        layers[y * width + x] += 1;
      }
    }
  }
  return layers;
}

/**
 * How much of the drawing survives under a box fill.
 *
 * `1 − alpha`, and it only sets how far the recovered region's *contrast* is
 * stretched back. The tint itself comes out exactly, whatever this is, because the
 * correction is anchored on bare paper seen through the same box — see
 * `restoreRegion`. Measured on IDOL's collision boxes, whose fill works out to a
 * green of about [60,180,60] at alpha 0.12; the hurtbox and hitbox washes match it
 * closely enough that one number serves all three.
 */
const SURVIVES = 0.88;

/**
 * Which pixels are the page rather than the character.
 *
 * Flooding in from the border through anything still bright. The distinction that
 * matters is not brightness — these costumes are full of white, and IDOL's skirt
 * under a hurtbox is the same value as the page under one — it is enclosure. Page
 * stays connected to the border straight through a box edge; her skirt is fenced in
 * by her own ink, which is far too dark to cross.
 *
 * Without this the anchors were measured partly off her costume, and the correction
 * came out reading her white skirt as the colour of paper.
 */
function pageMask(data, width, height, floor) {
  const page = new Uint8Array(width * height);
  const stack = [];
  const consider = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const index = y * width + x;
    if (page[index] === 1) return;
    const offset = index * 4;
    if (data[offset + 3] === 0) return;
    if (luminance(data[offset], data[offset + 1], data[offset + 2]) < floor) return;
    page[index] = 1;
    stack.push(index);
  };
  for (let x = 0; x < width; x += 1) {
    consider(x, 0);
    consider(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    consider(0, y);
    consider(width - 1, y);
  }
  while (stack.length > 0) {
    const index = stack.pop();
    const x = index % width;
    const y = (index - x) / width;
    consider(x + 1, y);
    consider(x - 1, y);
    consider(x, y + 1);
    consider(x, y - 1);
  }
  return page;
}

/** Flat, bright pixels: bare paper, seen through however many box layers. */
function flatBrightSamples(data, width, height, accept, paperFloor) {
  const samples = [];
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x;
      if (!accept(index)) continue;
      const offset = index * 4;
      const here = luminance(data[offset], data[offset + 1], data[offset + 2]);
      if (here < paperFloor) continue;
      let roughest = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const near = ((y + dy) * width + x + dx) * 4;
        roughest = Math.max(
          roughest,
          Math.abs(luminance(data[near], data[near + 1], data[near + 2]) - here),
        );
      }
      if (roughest > FLAT_LIMIT) continue;
      samples.push([data[offset], data[offset + 1], data[offset + 2]]);
    }
  }
  return samples;
}

function median(samples) {
  if (samples.length === 0) return null;
  return [0, 1, 2].map((channel) => {
    const sorted = samples.map((sample) => sample[channel]).sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  });
}

/** Connected components of a mask, as arrays of pixel indices. */
function components(mask, width, height) {
  const seen = new Uint8Array(mask.length);
  const found = [];
  for (let start = 0; start < mask.length; start += 1) {
    if (mask[start] === 0 || seen[start] === 1) continue;
    const region = [];
    const stack = [start];
    seen[start] = 1;
    while (stack.length > 0) {
      const index = stack.pop();
      region.push(index);
      const x = index % width;
      const y = (index - x) / width;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const next = ny * width + nx;
        if (mask[next] === 0 || seen[next] === 1) continue;
        seen[next] = 1;
        stack.push(next);
      }
    }
    found.push(region);
  }
  return found;
}

/**
 * Undo one region's tint.
 *
 * `obs = m·art + c` inside a box, so given bare paper `P` and what that paper looks
 * like through this region's boxes, `c = obsPaper − m·P` and the whole map collapses
 * to `art = P + (obs − obsPaper) / m`. Every unknown fill colour and every question
 * of how many layers are stacked here disappears into `obsPaper`, which is measured.
 * Only `m` is assumed, and it merely scales contrast.
 */
function restorePixel(data, index, paper, observedPaper, depth) {
  const offset = index * 4;
  const survives = SURVIVES ** depth;
  for (let channel = 0; channel < 3; channel += 1) {
    const restored = paper[channel]
      + (data[offset + channel] - observedPaper[channel]) / survives;
    data[offset + channel] = Math.max(0, Math.min(255, Math.round(restored)));
  }
}

/**
 * Strip the diagram from one RGBA panel, in place.
 *
 * Returns what it did, so the slicer can report it and a bad calibration shows up
 * as a number rather than as a mysteriously grey character.
 */
export function removeDiagramOverlay(data, width, height, options = {}) {
  const paperFloor = options.paperFloor ?? 195;
  const report = [];

  const allEdges = new Uint8Array(width * height);
  const found = [];

  for (const family of FAMILIES) {
    const tinted = new Uint8Array(width * height);
    for (let index = 0; index < width * height; index += 1) {
      const offset = index * 4;
      if (inFamily(family, data[offset], data[offset + 1], data[offset + 2])) {
        tinted[index] = 1;
      }
    }
    const edges = straightRunsOnly(tinted, width, height);
    let edgeCount = 0;
    for (let index = 0; index < edges.length; index += 1) {
      if (edges[index] === 0) continue;
      edgeCount += 1;
      allEdges[index] = 1;
    }
    if (edgeCount < MIN_RUN) continue;
    const rectangles = findRectangles(edges, width, height);
    if (rectangles.length === 0) {
      report.push(`${family.name}: ${String(edgeCount)}px of edge, no boxes resolved`);
      continue;
    }
    found.push({ family, rectangles });
  }

  if (found.length === 0 && allEdges.every((flag) => flag === 0)) {
    return ['no diagram found'];
  }

  // Bare paper, measured where nothing covers it.
  const anyLayer = new Uint8Array(width * height);
  for (const { rectangles } of found) {
    const layers = layerCounts(rectangles, width, height);
    for (let index = 0; index < anyLayer.length; index += 1) {
      if (layers[index] > 0) anyLayer[index] = 1;
    }
  }
  const paper = median(flatBrightSamples(
    data,
    width,
    height,
    (index) => anyLayer[index] === 0 && allEdges[index] === 0,
    paperFloor,
  ));

  for (const { family, rectangles } of found) {
    if (paper === null) {
      report.push(`${family.name}: ${String(rectangles.length)} boxes, no bare paper to anchor against`);
      continue;
    }
    const layers = layerCounts(rectangles, width, height);
    // One anchor per layer depth: paper under one box is a different colour from
    // paper under two, and correcting both with the same offset leaves the overlaps
    // visibly darker than everything around them.
    const anchors = new Map();
    for (let depth = 1; depth <= 6; depth += 1) {
      const sample = median(flatBrightSamples(
        data,
        width,
        height,
        (index) => layers[index] === depth && allEdges[index] === 0,
        paperFloor,
      ));
      if (sample !== null) anchors.set(depth, sample);
    }
    if (anchors.size === 0) {
      report.push(`${family.name}: ${String(rectangles.length)} boxes, no paper visible through them`);
      continue;
    }
    // Depths with no paper of their own extrapolate from the shallowest that has
    // some, compounding the same map for the extra layers.
    const shallowest = Math.min(...anchors.keys());
    const base = anchors.get(shallowest);
    for (let depth = 1; depth <= 6; depth += 1) {
      if (anchors.has(depth)) continue;
      let value = base;
      for (let extra = shallowest; extra < depth; extra += 1) {
        value = value.map(
          (channel, index) => channel * SURVIVES + (base[index] - paper[index] * SURVIVES),
        );
      }
      anchors.set(depth, value);
    }

    for (let index = 0; index < width * height; index += 1) {
      const depth = layers[index];
      if (depth === 0) continue;
      restorePixel(data, index, paper, anchors.get(Math.min(depth, 6)), depth);
    }
    report.push(
      `${family.name}: ${String(rectangles.length)} boxes cleared, `
      + `paper reads [${anchors.get(1).join(',')}] through one`,
    );
  }

  // The outlines replaced the drawing rather than tinting it, so there is nothing
  // to recover — they get masked and painted over from either side. Grown by one so
  // an antialiased shoulder goes with its line; a leftover halo reads as a coloured
  // line just as clearly as the line did.
  const healed = healScars(data, width, height, grow(allEdges, width, height, 1));
  report.push(`outlines: ${String(healed)}px repainted`);
  return report;
}

/**
 * Paint over the outlines from whichever side of them the drawing continues.
 *
 * A box edge is one to three pixels wide, so the nearest unmasked pixel on either
 * side is almost always the same garment, and closing the gap between them is
 * invisible. Done in both axes and averaged, so a horizontal edge is healed down a
 * column and a vertical one across a row without either having to know which it is.
 */
function healScars(data, width, height, scars) {
  const source = new Uint8Array(data);
  let healed = 0;
  const reach = 4;

  const look = (x, y, dx, dy) => {
    for (let step = 1; step <= reach; step += 1) {
      const nx = x + dx * step;
      const ny = y + dy * step;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) return null;
      const index = ny * width + nx;
      if (scars[index] === 1) continue;
      const offset = index * 4;
      if (source[offset + 3] === 0) return null;
      return [source[offset], source[offset + 1], source[offset + 2]];
    }
    return null;
  };

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      if (scars[index] === 0) continue;
      const candidates = [
        look(x, y, -1, 0), look(x, y, 1, 0),
        look(x, y, 0, -1), look(x, y, 0, 1),
      ].filter((sample) => sample !== null);
      if (candidates.length === 0) continue;
      const offset = index * 4;
      for (let channel = 0; channel < 3; channel += 1) {
        const total = candidates.reduce(
          (sum, sample) => sum + sample[channel],
          0,
        );
        data[offset + channel] = Math.round(total / candidates.length);
      }
      healed += 1;
    }
  }
  return healed;
}
