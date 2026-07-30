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
 * The three box palettes, as hue tests rather than colours.
 *
 * Tests, because the strokes are antialiased and the fills are washed out, so no
 * fixed colour matches either reliably. Blue and green cannot occur in any of these
 * costumes. Red is the one that needs care: IDOL and GLITCH are full of magenta, so
 * the red test demands that green *and* blue both collapse, which magenta never
 * does.
 */
const FAMILIES = [
  {
    name: 'blue',
    is: (r, g, b) => b > r + 30 && b > g + 20,
    isStroke: (r, g, b) => b > r + 60 && b > g + 45 && b > 90,
  },
  {
    name: 'green',
    is: (r, g, b) => g > r + 12 && g > b + 12,
    isStroke: (r, g, b) => g > r + 45 && g > b + 45,
  },
  {
    name: 'red',
    is: (r, g, b) => r > g + 45 && r > b + 35 && g < 150 && b < 165,
    isStroke: (r, g, b) => r > g + 90 && r > b + 75 && g < 110,
  },
];

function luminance(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
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
 * Find what the boxes enclose, by sealing their outlines and flooding around them.
 *
 * Pairing edges into rectangles was the first attempt and it found nothing: these
 * outlines are dashed, their corners are rounded by more than the tolerance any
 * pairing rule can afford, and each one breaks wherever it crosses dark hair. So
 * instead of reconstructing the rectangles, grow the outlines until they are
 * continuous and flood inward from the border. The character's own ink is not in
 * the mask — it is brown, not blue — so the flood passes straight through her and
 * only the boxes stop it. Whatever it cannot reach is inside a box.
 *
 * Every family's outlines seal together, so a blue box crossing a green one still
 * divides both.
 *
 * @returns a 0/1 mask of covered pixels, or null if the flood leaked.
 */
function sealedRegions(barrier, width, height) {
  const reached = new Uint8Array(width * height);
  const stack = [];
  const consider = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const index = y * width + x;
    if (reached[index] === 1 || barrier[index] === 1) return;
    reached[index] = 1;
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

  const covered = new Uint8Array(width * height);
  let inside = 0;
  for (let index = 0; index < covered.length; index += 1) {
    if (reached[index] === 1 || barrier[index] === 1) continue;
    covered[index] = 1;
    inside += 1;
  }
  if (inside > covered.length * LEAK_LIMIT) return null;
  return covered;
}

/** Pixels flat enough, and bright enough, to be bare paper under the overlay. */
function paperSamples(data, width, height, layers, wanted, paperFloor) {
  const samples = [];
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x;
      if (layers[index] !== wanted) continue;
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

/**
 * Measure `m` and `c` for one family from paper seen through nothing, one box and
 * two boxes.
 *
 * Two overlapping boxes are what makes this solvable. One box over paper gives
 * three equations for four unknowns — the alpha and the fill's three channels — and
 * the alpha stays free. A second layer applies the same map again, so
 * `m = (two − one) / (one − none)` falls straight out, per channel, and the three
 * estimates cross-check each other.
 */
function calibrate(data, width, height, layers, paperFloor) {
  const none = median(paperSamples(data, width, height, layers, 0, paperFloor));
  const one = median(paperSamples(data, width, height, layers, 1, paperFloor));
  const two = median(paperSamples(data, width, height, layers, 2, paperFloor));
  if (none === null || one === null) return null;

  let m = null;
  if (two !== null) {
    const estimates = [];
    for (let channel = 0; channel < 3; channel += 1) {
      const lower = one[channel] - none[channel];
      if (Math.abs(lower) < 3) continue;
      const ratio = (two[channel] - one[channel]) / lower;
      if (ratio > 0.3 && ratio < 0.995) estimates.push(ratio);
    }
    if (estimates.length > 0) {
      m = estimates.reduce((total, value) => total + value, 0) / estimates.length;
    }
  }
  // No overlap to measure from. These fills are light washes; assume a typical one
  // rather than refusing to clean the panel at all.
  if (m === null) m = 0.86;

  const c = [0, 1, 2].map(
    (channel) => one[channel] - m * none[channel],
  );
  return { m, c, none, one, two };
}

/**
 * Strip the diagram from one RGBA panel, in place.
 *
 * Returns what it did, so the slicer can report it and a bad calibration shows up
 * as a number rather than as a mysteriously grey character.
 */
export function removeDiagramOverlay(data, width, height, options = {}) {
  const paperFloor = options.paperFloor ?? 200;
  const report = [];

  for (const family of FAMILIES) {
    const stroke = new Uint8Array(width * height);
    let strokeCount = 0;
    for (let index = 0; index < width * height; index += 1) {
      const offset = index * 4;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      if (family.isStroke(r, g, b)) {
        stroke[index] = 1;
        strokeCount += 1;
      }
    }
    if (strokeCount < MIN_EDGE) continue;

    const rectangles = findRectangles(stroke, width, height);
    if (rectangles.length === 0) {
      report.push(`${family.name}: ${String(strokeCount)}px stroke, no boxes resolved`);
      continue;
    }
    const layers = layerCounts(rectangles, width, height);
    const fit = calibrate(data, width, height, layers, paperFloor);
    if (fit === null) {
      report.push(`${family.name}: ${String(rectangles.length)} boxes, no paper to calibrate against`);
      continue;
    }

    // Undo k applications of `obs = m·art + c`.
    const powers = [1];
    const sums = [0];
    for (let k = 1; k <= 8; k += 1) {
      powers[k] = powers[k - 1] * fit.m;
      sums[k] = sums[k - 1] + powers[k - 1];
    }
    for (let index = 0; index < width * height; index += 1) {
      const k = layers[index];
      if (k === 0) continue;
      const depth = Math.min(k, 8);
      const offset = index * 4;
      for (let channel = 0; channel < 3; channel += 1) {
        const restored = (
          data[offset + channel] - fit.c[channel] * sums[depth]
        ) / powers[depth];
        data[offset + channel] = Math.max(0, Math.min(255, Math.round(restored)));
      }
    }

    report.push(
      `${family.name}: ${String(rectangles.length)} boxes, m=${fit.m.toFixed(3)}, `
      + `c=[${fit.c.map((value) => value.toFixed(1)).join(',')}]`,
    );
  }

  // The strokes are unrecoverable — they replaced the art rather than tinting it —
  // so they are masked and filled from their neighbours afterwards. Re-detected
  // here because un-blending the fills shifts their colours.
  const scars = strokeMask(data, width, height);
  const healed = healScars(data, width, height, scars);
  report.push(`strokes: ${String(healed)}px repainted`);
  return report;
}

/** Every remaining pixel that still belongs to a box outline, dilated by one. */
function strokeMask(data, width, height) {
  const raw = new Uint8Array(width * height);
  for (let index = 0; index < width * height; index += 1) {
    const offset = index * 4;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    if (FAMILIES.some((family) => family.is(r, g, b))) raw[index] = 1;
  }
  // Grow by one so the antialiased shoulder of a stroke goes with it; a leftover
  // halo reads as a coloured line just as clearly as the line did.
  const grown = new Uint8Array(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (raw[y * width + x] === 0) continue;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          grown[ny * width + nx] = 1;
        }
      }
    }
  }
  return grown;
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
