// Background removal for character sheets.
//
// Shared by the slicer and the calibration grid, because part rectangles have to
// be read off the *keyed* cutout — the transparency is what makes the joints
// legible, and measuring against the paper instead is how the first pass ended
// up with rectangles that missed the limbs entirely.

/**
 * Anything at least this bright is a candidate for background.
 *
 * Sits above pale skin (~217) and below the paper and its grid (~235+). The fill
 * is contained by the character's ink regardless, so this only matters where the
 * outline is thin.
 */
export const LIGHT = 226;

function luminance(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Flood-fill transparency inward from every border pixel, in place.
 *
 * Deliberately not a global brightness threshold: these characters wear white.
 * IDOL's skirt and boots are the same value as the paper, so "light pixels are
 * background" deletes half the costume. Filling from the edge stops at the
 * character's own ink, so enclosed whites survive.
 *
 * Iterative with an explicit stack — a 165×490 crop is 80k pixels and a
 * recursive fill overflows.
 *
 * @returns fraction of the image cleared, for leak detection.
 */
export function keyBackground(data, width, height, options = {}) {
  const stack = [];
  const seen = new Uint8Array(width * height);
  const light = options.light ?? LIGHT;

  // ECHO wears near-white armour at the same *value* as the paper it is drawn
  // on, so no luminance floor can separate them — one ate the shoulder ring and
  // speckled the coat. `tolerance` switches to matching the sampled paper colour
  // instead, which the armour's faint blue shading falls outside of.
  const tolerance = options.tolerance;
  const sample = tolerance === undefined ? null : [data[0], data[1], data[2]];

  // These sheets carry an annotation layer as well as a diagram: pale salmon motion
  // arcs and impact circles drawn over the page, and they touch the figure, so no
  // component filter separates them. Lowering the luminance floor far enough to reach
  // them instead reaches the shaded side of IDOL's white boots, which is *darker* than
  // the arcs are.
  //
  // `maximumChroma` is what distinguishes them: an arc is bright and nearly grey, while
  // every saturated thing on the page is costume. Paired with a floor that her ink
  // contour is far below, the fill eats the annotations and still cannot get inside her,
  // because getting inside means crossing that contour.
  const maximumChroma = options.maximumChroma;

  const isBackground = (offset) => {
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    if (sample !== null) {
      const dr = r - sample[0];
      const dg = g - sample[1];
      const db = b - sample[2];
      return dr * dr + dg * dg + db * db <= tolerance * tolerance;
    }
    if (luminance(r, g, b) < light) return false;
    if (maximumChroma === undefined) return true;
    return Math.max(r, g, b) - Math.min(r, g, b) <= maximumChroma;
  };

  const consider = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const index = y * width + x;
    if (seen[index] === 1) return;
    if (!isBackground(index * 4)) return;
    seen[index] = 1;
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

  let cleared = 0;
  const drain = (accept) => {
    while (stack.length > 0) {
      const index = stack.pop();
      if (data[index * 4 + 3] !== 0) {
        data[index * 4 + 3] = 0;
        cleared += 1;
      }
      const x = index % width;
      const y = (index - x) / width;
      accept(x + 1, y);
      accept(x - 1, y);
      accept(x, y + 1);
      accept(x, y - 1);
    }
  };
  drain(consider);

  // Second pass: grow into leftovers.
  //
  // A tolerance match protects near-white costume but leaves the paper's grid
  // lines and compression noise behind as opaque flecks, which then land inside
  // a part rectangle as grey confetti. This pass starts from what the first pass
  // already cleared and eats anything bright touching it, so it can only ever
  // reach background — it cannot tunnel through the character's ink.
  const cleanup = options.cleanup;
  if (cleanup !== undefined) {
    const grow = (x, y) => {
      if (x < 0 || y < 0 || x >= width || y >= height) return;
      const index = y * width + x;
      if (seen[index] === 1) return;
      const offset = index * 4;
      if (data[offset + 3] === 0) return;
      if (luminance(data[offset], data[offset + 1], data[offset + 2]) < cleanup) {
        return;
      }
      seen[index] = 1;
      stack.push(index);
    };
    for (let index = 0; index < width * height; index += 1) {
      if (data[index * 4 + 3] !== 0) continue;
      const x = index % width;
      const y = (index - x) / width;
      grow(x + 1, y);
      grow(x - 1, y);
      grow(x, y + 1);
      grow(x, y - 1);
    }
    drain(grow);
  }

  return cleared / (width * height);
}
