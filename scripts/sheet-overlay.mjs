// Removes the hitbox diagram painted over a sheet's attack panels.
//
// The attack columns on these sheets are documentation, not art: every pose has blue
// hurtbox, red hitbox and green collision rectangles drawn on top of it, each a
// saturated outline around a translucent fill. That does two kinds of damage.
//
//   1. The fills lift the costume's value, so a background flood-fill keyed on
//      brightness walks in from the page *through a box* and eats the figure. That is
//      where the missing thighs and detached boots came from — not the crop, the key
//      tunnelling along a box.
//   2. What survives is washed lavender and green in rectangles, with dashed outlines
//      drawn across it.
//
// ## Why this does not reconstruct the rectangles
//
// It looks like it should: a translucent rectangle is an affine map, so with the
// rectangles known the drawing inverts exactly. Three attempts at recovering them all
// failed on the same facts. The outlines are dashed. Their corners are rounded past
// any pairing tolerance. Each one disappears wherever it crosses dark hair, because a
// blue line over near-black is not blue. And they are clipped by the panel crop,
// nested, and overlapping. Pairing edge runs found nothing; sealing the outlines and
// flooding inward leaked out of every box through the gaps; projecting edges onto each
// axis found eleven boxes where there were two, because every left pairs with every
// right.
//
// So this works per pixel instead, on a fact about the subjects rather than about the
// geometry: **none of these five characters has any blue or green in their palette.**
// IDOL is pink, white, gold and skin; her only cool note is violet, and violet is a
// different hue from hurtbox blue. So any blue or green cast *is* the diagram, wherever
// it is, and the amount to remove can be measured from the page the boxes also cover.
// No rectangle needs to be found for that.
//
// Red is left alone on purpose. It is the one family that collides with a costume —
// IDOL's and GLITCH's magenta — and a wrong guess there bleaches the character.

/**
 * Minimum length of an axis-aligned run before a coloured pixel counts as a box
 * outline.
 *
 * This gate, not the colour test, is what makes outline removal safe. Colour alone
 * cannot separate the diagram from these characters: hurtbox blue sits right beside
 * the blue-violet these sheets shade whites with. The first attempt used colour alone
 * and repainted a fifth of the drawing — her jacket read as hitbox red and her shadows
 * as hurtbox blue. Geometry separates them cleanly: a box outline runs straight and
 * axis-aligned for tens of pixels, and costume linework never does.
 */
const MIN_RUN = 20;

/** Local gradient below which a pixel is flat enough to be bare page. */
const FLAT_LIMIT = 6;

/**
 * The box palettes, as hue windows, read off a hue histogram of a panel.
 *
 * The diagram and the costume land in clearly separate bands: collision green at
 * 110–130° with nothing of IDOL's within a hundred degrees, hurtbox blue at 200–245°
 * against her violet shading from 255° up. The blue window deliberately stops short of
 * violet so her purple shorts survive untouched.
 */
const FAMILIES = [
  { name: 'blue', from: 196, to: 248 },
  { name: 'green', from: 96, to: 152 },
];

/**
 * The hitbox family, handled separately and by geometry.
 *
 * Red cannot join the two above. The argument that licenses them — that a blue or green
 * pixel can only be the diagram — does not hold for red: IDOL's magenta sits at 339°
 * and her red-brown linework crosses 352°, and measuring says the wash and the paint
 * overlap in chroma so completely that no threshold separates them. Correcting by hue
 * alone bleached her jacket; capping the correction to protect the jacket let most of
 * the actual wash through.
 *
 * What red does have is a reliable *shape*. There is exactly one hitbox per panel, so
 * its outline forms one connected run of unmistakably red pixels, and the bounding box
 * of that run is the rectangle — no pairing, no ambiguity. Inside a known rectangle the
 * wash inverts exactly and the costume is safe.
 */
const HITBOX = { name: 'red', from: 350, to: 374 };

/** Smallest bounding box that is believed to be a hitbox rather than a stray mark. */
const MIN_HITBOX = 16;

/**
 * Bounds on the hitbox path, because unlike the hue-window pass it rewrites costume.
 *
 * A hitbox frames a fist or a foot; it is never a quarter of the panel. When the
 * outline trace joins two boxes, or joins a box to a stray red mark on the drawing, the
 * bounding box balloons and the affine correction is then measured on the wrong pixels
 * and applied to the character — on IDOL's heavy punch that bleached her head to lilac
 * across twenty thousand pixels. A box that is too big, or whose correction is larger
 * than any translucent wash could account for, is not believed.
 */
const MAX_HITBOX_AREA = 0.12;
const MAX_WASH_SHIFT = 45;

/** Plausible range for the value a wash costs per unit of colour it adds. */
const MAX_VALUE_PER_CHROMA = 0.8;

/**
 * How much of the drawing survives under one box fill: `1 − alpha`.
 *
 * Only sets how far a recovered rectangle's contrast is stretched back. The tint itself
 * comes out exactly whatever this is, because the correction is anchored on page seen
 * through the same box. Measured at about 0.88 on IDOL's collision boxes.
 */
const SURVIVES = 0.88;

/**
 * Chroma a pixel needs before its hue is believed, in 0–255 units.
 *
 * Absolute chroma, not saturation: a wash over bright page is only about 20 units of
 * chroma on a value of 250, which is a saturation of 0.08 — well under any threshold a
 * saturated outline would want, and setting one floor for both found no fills at all.
 * Below roughly 6 units the hue angle is just sensor noise, so that is the floor for a
 * fill; an outline has to be far more definite than that.
 */
const FILL_CHROMA = 7;
const OUTLINE_CHROMA = 30;

function luminance(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hueOf(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const chroma = max - min;
  if (chroma === 0) return { hue: 0, chroma: 0, value: max };
  let hue;
  if (max === r) hue = 60 * (((g - b) / chroma) % 6);
  else if (max === g) hue = 60 * ((b - r) / chroma + 2);
  else hue = 60 * ((r - g) / chroma + 4);
  if (hue < 0) hue += 360;
  return { hue, chroma, value: max };
}

function inFamily(family, r, g, b, minimumChroma) {
  const { hue, chroma, value } = hueOf(r, g, b);
  if (chroma < minimumChroma || value < 40) return false;
  // `to` may run past 360 so a window can straddle red.
  const wrapped = hue < family.from ? hue + 360 : hue;
  return wrapped >= family.from && wrapped <= family.to;
}

/** How strongly a pixel leans towards one family's hue, as a signed amount. */
function chromaOf(family, r, g, b) {
  if (family.name === 'blue') return b - (r + g) / 2;
  if (family.name === 'green') return g - (r + b) / 2;
  return r - (g + b) / 2;
}

/**
 * Which pixels are the page rather than the character.
 *
 * Flooding in from the border through anything still bright. The distinction that
 * matters is not brightness — these costumes are full of white, and IDOL's skirt under
 * a hurtbox is the same value as the page under one — it is enclosure. Page stays
 * connected to the border straight through a box outline; her skirt is fenced in by her
 * own ink, which is far too dark to cross.
 *
 * This is what the wash is calibrated on, so getting it wrong is how an earlier pass
 * came to treat her white skirt as the colour of paper.
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

/** Flat pixels only, so a sample is a wash over the page and not an edge crossing it. */
function isFlat(data, width, height, x, y) {
  const offset = (y * width + x) * 4;
  const here = luminance(data[offset], data[offset + 1], data[offset + 2]);
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= width || ny >= height) return false;
    const near = (ny * width + nx) * 4;
    const there = luminance(data[near], data[near + 1], data[near + 2]);
    if (Math.abs(there - here) > FLAT_LIMIT) return false;
  }
  return true;
}

function median(values) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

/**
 * Measure one family's wash off the page it also covers.
 *
 * A wash both tints and darkens, and the two are locked together — it is one
 * translucent layer — so the page shows the exchange rate directly: how much luminance
 * a box costs per unit of colour it adds. On IDOL's collision boxes that comes out
 * around 0.6, which is why removing only the colour leaves a faintly grey rectangle
 * behind and removing both leaves nothing.
 *
 * @returns `{ base, perChroma }`, or null when the page is never seen through a box.
 */
function measureWash(data, width, height, page, family) {
  const clean = [];
  const tinted = [];
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x;
      if (page[index] === 0) continue;
      if (!isFlat(data, width, height, x, y)) continue;
      const offset = index * 4;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      const sample = {
        chroma: chromaOf(family, r, g, b),
        luminance: luminance(r, g, b),
      };
      if (inFamily(family, r, g, b, FILL_CHROMA)) tinted.push(sample);
      else clean.push(sample);
    }
  }
  if (clean.length < 40 || tinted.length < 40) return null;

  const base = median(clean.map((sample) => sample.chroma));
  const pageLuminance = median(clean.map((sample) => sample.luminance));
  const chromaAdded = median(tinted.map((sample) => sample.chroma)) - base;
  const luminanceLost = pageLuminance - median(
    tinted.map((sample) => sample.luminance),
  );
  if (chromaAdded < 3) return null;
  return {
    base,
    added: chromaAdded,
    // Clamped: on a panel where the page is barely visible through a box the estimate
    // comes from a handful of samples and can run away, and this term is what puts
    // value back, so an inflated one over-brightens whatever it touches.
    perChroma: Math.min(
      MAX_VALUE_PER_CHROMA,
      Math.max(0, luminanceLost / chromaAdded),
    ),
  };
}

/**
 * Take one family's wash back out, pixel by pixel.
 *
 * Reducing the family's chroma to what bare page shows, then returning the luminance
 * that much colour cost. Adding the same amount to all three channels restores value
 * without touching hue, so nothing that was not washed moves.
 */
function unwash(data, width, height, family, wash) {
  let touched = 0;
  for (let index = 0; index < width * height; index += 1) {
    const offset = index * 4;
    if (data[offset + 3] === 0) continue;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    if (!inFamily(family, r, g, b, FILL_CHROMA)) continue;
    const excess = chromaOf(family, r, g, b) - wash.base;
    if (excess <= 1) continue;

    const channel = family.name === 'blue' ? 2 : 1;
    const lift = excess * (wash.perChroma + 0.5);
    const next = [r, g, b];
    next[channel] -= excess;
    for (let index_ = 0; index_ < 3; index_ += 1) {
      data[offset + index_] = Math.max(0, Math.min(255, Math.round(next[index_] + lift)));
    }
    touched += 1;
  }
  return touched;
}

/** Bounding boxes of a mask's connected components, above a minimum size. */
function componentBoxes(mask, width, height, minimum) {
  const seen = new Uint8Array(mask.length);
  const boxes = [];
  for (let start = 0; start < mask.length; start += 1) {
    if (mask[start] === 0 || seen[start] === 1) continue;
    const stack = [start];
    seen[start] = 1;
    let left = width;
    let right = 0;
    let top = height;
    let bottom = 0;
    while (stack.length > 0) {
      const index = stack.pop();
      const x = index % width;
      const y = (index - x) / width;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
      // Eight-connected, so a dashed outline's corner still joins its two sides.
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const next = ny * width + nx;
          if (mask[next] === 0 || seen[next] === 1) continue;
          seen[next] = 1;
          stack.push(next);
        }
      }
    }
    if (right - left < minimum || bottom - top < minimum) continue;
    boxes.push({ left, right, top, bottom });
  }
  return boxes;
}

/**
 * Invert the wash inside a known rectangle.
 *
 * `obs = m·art + c` inside a box, so given bare page `P` and what that page looks like
 * through this box, `c = obsPage − m·P` and the whole map collapses to
 * `art = P + (obs − obsPage) / m`. The fill's colour and its alpha both disappear into
 * `obsPage`, which is measured — so unlike the hue-window pass this is exact, and safe
 * to apply to costume as well as to page.
 */
function unwashRectangle(data, width, height, page, box) {
  const inside = [];
  const outsideBand = [];
  const band = 6;
  for (let y = Math.max(0, box.top - band); y <= Math.min(height - 1, box.bottom + band); y += 1) {
    for (let x = Math.max(0, box.left - band); x <= Math.min(width - 1, box.right + band); x += 1) {
      if (page[y * width + x] === 0) continue;
      if (!isFlat(data, width, height, x, y)) continue;
      const offset = (y * width + x) * 4;
      const sample = [data[offset], data[offset + 1], data[offset + 2]];
      const within = x >= box.left && x <= box.right
        && y >= box.top && y <= box.bottom;
      (within ? inside : outsideBand).push(sample);
    }
  }
  if (inside.length < 20 || outsideBand.length < 20) return 0;

  const paper = [0, 1, 2].map(
    (channel) => median(outsideBand.map((sample) => sample[channel])),
  );
  const observed = [0, 1, 2].map(
    (channel) => median(inside.map((sample) => sample[channel])),
  );
  const shift = Math.max(
    ...[0, 1, 2].map((channel) => Math.abs(paper[channel] - observed[channel])),
  );
  if (shift < 4 || shift > MAX_WASH_SHIFT) return 0;

  let touched = 0;
  for (let y = box.top; y <= box.bottom; y += 1) {
    for (let x = box.left; x <= box.right; x += 1) {
      const offset = (y * width + x) * 4;
      if (data[offset + 3] === 0) continue;
      for (let channel = 0; channel < 3; channel += 1) {
        const restored = paper[channel]
          + (data[offset + channel] - observed[channel]) / SURVIVES;
        data[offset + channel] = Math.max(0, Math.min(255, Math.round(restored)));
      }
      touched += 1;
    }
  }
  return touched;
}

/** Keep only the pixels of a mask that sit in a long straight run of it, either axis. */
function straightRunsOnly(mask, width, height) {
  const kept = new Uint8Array(mask.length);
  const sweep = (length, lineStride, stepStride, count) => {
    for (let line = 0; line < count; line += 1) {
      let run = 0;
      for (let step = 0; step <= length; step += 1) {
        const on = step < length
          && mask[line * lineStride + step * stepStride] === 1;
        if (on) {
          run += 1;
          continue;
        }
        if (run >= MIN_RUN) {
          for (let back = 1; back <= run; back += 1) {
            kept[line * lineStride + (step - back) * stepStride] = 1;
          }
        }
        run = 0;
      }
    }
  };
  sweep(width, width, 1, height);
  sweep(height, 1, width, width);
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
 * Paint over the outlines from whichever side of them the drawing continues.
 *
 * A box outline is one to three pixels wide, so the nearest unmasked pixel either side
 * is almost always the same garment and closing the gap between them is invisible. Both
 * axes, averaged, so a horizontal outline heals down a column and a vertical one across
 * a row without either having to know which it is.
 */
function healOutlines(data, width, height, scars) {
  const source = new Uint8Array(data);
  let healed = 0;
  const reach = 5;

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

/**
 * Strip the diagram from one RGBA panel, in place.
 *
 * Returns what it did, so the slicer can print it: every failure of this pass looks
 * identical from the outside — a panel that comes back still tinted — and the cause has
 * been different every time.
 */
export function removeDiagramOverlay(data, width, height, options = {}) {
  const report = [];
  // Kept so the whole pass can be abandoned. Every failure mode found while building
  // this made a panel *worse* than the diagram did — a bleached head, a grey character,
  // a fifth of the drawing repainted — and all of them announced themselves as a large
  // fraction of the image moving a long way. Cheaper to check that at the end than to
  // enumerate the causes.
  const original = new Uint8Array(data);
  const page = pageMask(data, width, height, options.pageFloor ?? 178);

  const outlineOf = (family) => {
    const tinted = new Uint8Array(width * height);
    for (let index = 0; index < width * height; index += 1) {
      const offset = index * 4;
      if (inFamily(
        family,
        data[offset],
        data[offset + 1],
        data[offset + 2],
        OUTLINE_CHROMA,
      )) {
        tinted[index] = 1;
      }
    }
    return straightRunsOnly(tinted, width, height);
  };

  // The hitbox is done first and by geometry, while its outline is still there to
  // locate it, and before any hue-window pass can touch the costume it sits on.
  const limit = width * height * MAX_HITBOX_AREA;
  const hitboxes = componentBoxes(outlineOf(HITBOX), width, height, MIN_HITBOX)
    .filter((box) => (box.right - box.left) * (box.bottom - box.top) <= limit);
  let hitboxPixels = 0;
  for (const box of hitboxes) {
    hitboxPixels += unwashRectangle(data, width, height, page, box);
  }
  report.push(
    `hitbox: ${String(hitboxes.length)} box(es), ${String(hitboxPixels)}px inverted`,
  );

  // Outlines next. They replaced the drawing rather than tinting it, so there is nothing
  // to recover — and taking them out before measuring the washes keeps a saturated line
  // from dragging the estimate with it.
  const outlines = new Uint8Array(width * height);
  for (const family of [...FAMILIES, HITBOX]) {
    const lines = outlineOf(family);
    for (let index = 0; index < lines.length; index += 1) {
      if (lines[index] === 1) outlines[index] = 1;
    }
  }
  // Grown by one so an antialiased shoulder goes with its line; a leftover halo reads
  // as a coloured line just as clearly as the line did.
  const healed = healOutlines(data, width, height, grow(outlines, width, height, 1));
  report.push(`outlines: ${String(healed)}px repainted`);

  for (const family of FAMILIES) {
    const wash = measureWash(data, width, height, page, family);
    if (wash === null) {
      report.push(`${family.name}: no page seen through a box, left alone`);
      continue;
    }
    const touched = unwash(data, width, height, family, wash);
    report.push(
      `${family.name}: ${String(touched)}px unwashed `
      + `(${wash.perChroma.toFixed(2)} value per unit chroma)`,
    );
  }

  const disturbed = fractionMoved(original, data, 40);
  if (disturbed > (options.maximumDisturbance ?? 0.3)) {
    data.set(original);
    return [
      `abandoned: ${(disturbed * 100).toFixed(0)}% of the panel moved a long way, `
      + 'which is a misread rather than a diagram; left as drawn',
    ];
  }
  report.push(`${(disturbed * 100).toFixed(1)}% of the panel changed materially`);
  return report;
}

/**
 * Drop everything the key left behind that has no ink in it.
 *
 * What survives keying, besides the character, is the sheet's annotation layer: pale
 * salmon motion arcs, impact circles, and whatever of a hitbox rectangle lay on the
 * page. No brightness threshold removes those — measured, a salmon arc is *lighter*
 * than the shaded side of IDOL's white boot, so every cleanup pass aggressive enough
 * to eat the arc ate the boot first.
 *
 * Ink separates them instead. Every piece of these characters is drawn with a dark
 * contour; not one annotation has a dark pixel anywhere in it. So each remaining island
 * is kept or dropped on whether it contains any ink at all, which cannot mistake a limb
 * for an arc however pale the limb is.
 */
export function dropInklessComponents(data, width, height, options = {}) {
  const inkBelow = options.inkBelow ?? 120;
  const minimumInk = options.minimumInk ?? 0.012;
  const seen = new Uint8Array(width * height);
  let dropped = 0;

  for (let start = 0; start < seen.length; start += 1) {
    if (seen[start] === 1 || data[start * 4 + 3] === 0) continue;
    const region = [];
    const stack = [start];
    seen[start] = 1;
    let ink = 0;
    while (stack.length > 0) {
      const index = stack.pop();
      region.push(index);
      const offset = index * 4;
      if (luminance(data[offset], data[offset + 1], data[offset + 2]) < inkBelow) {
        ink += 1;
      }
      const x = index % width;
      const y = (index - x) / width;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const next = ny * width + nx;
        if (seen[next] === 1 || data[next * 4 + 3] === 0) continue;
        seen[next] = 1;
        stack.push(next);
      }
    }
    if (ink / region.length >= minimumInk) continue;
    for (const index of region) data[index * 4 + 3] = 0;
    dropped += region.length;
  }
  return dropped;
}

/** Fraction of opaque pixels whose colour moved further than `threshold`. */
function fractionMoved(before, after, threshold) {
  let moved = 0;
  let counted = 0;
  for (let offset = 0; offset < before.length; offset += 4) {
    if (before[offset + 3] === 0) continue;
    counted += 1;
    const worst = Math.max(
      Math.abs(after[offset] - before[offset]),
      Math.abs(after[offset + 1] - before[offset + 1]),
      Math.abs(after[offset + 2] - before[offset + 2]),
    );
    if (worst > threshold) moved += 1;
  }
  return counted === 0 ? 0 : moved / counted;
}
