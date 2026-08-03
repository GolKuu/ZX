/**
 * Lucky's sprite art, authored as pixel art.
 *
 * Everything is drawn from axis-aligned integer rectangles — solid blocks for
 * the rig parts, and stepped runs along a line for the angled limbs in the
 * attack poses. That is deliberate: the previous version used gradients, a
 * drop-shadow blur and lanczos resampling, which produced soft vector art that
 * sat next to MIM and Glitch looking like a different game. Whole-pixel
 * rectangles survive the nearest-neighbour upscale in
 * `generate-lucky-sprites.mjs` with hard edges, which is what makes a sprite
 * read as pixel art rather than as a smoothly scaled drawing.
 *
 * The attack poses are built from a named skeleton rather than from stacked
 * boxes. A fighting-game pose has to read as a body at a glance, and limbs at
 * angles are what carry that read; a figure assembled from upright rectangles
 * reads as a diagram of a person instead of a person.
 *
 * Design brief: white hair, a technological visor, black and dark-green
 * clothing with an asymmetric long jacket, gold detailing, probability motifs,
 * and a slim rushdown silhouette. Confident and dangerous — not a clown, not a
 * casino dealer.
 */

/** Flat palette. No gradients, no blur, no partial alpha. */
export const LUCKY_PALETTE = {
  ink: '#0b100e',
  black: '#161d1a',
  blackLit: '#212b26',
  green: '#0f4d38',
  greenLit: '#17714f',
  greenTop: '#2a9c72',
  gold: '#d9a52a',
  goldLit: '#f6dd8a',
  goldDim: '#8d6212',
  hair: '#f3f6f4',
  hairShade: '#bfcbc6',
  skin: '#d79a72',
  skinShade: '#a96c4d',
  visor: '#35dfd0',
  visorLit: '#a5fff5',
};

const C = LUCKY_PALETTE;

/** A flat rectangle on whole pixels. */
function r(x, y, w, h, fill) {
  if (w <= 0 || h <= 0) return '';
  const rx = Math.round(x);
  const ry = Math.round(y);
  return `<rect x="${rx}" y="${ry}" width="${Math.round(w)}" `
    + `height="${Math.round(h)}" fill="${fill}"/>`;
}

/**
 * A filled block with a one-pixel dark border.
 *
 * The border is what separates limbs from each other and from the background
 * once the sprite is small; without it a dark-green arm crossing a dark-green
 * torso disappears.
 */
function blob(x, y, w, h, fill) {
  return r(x - 1, y - 1, w + 2, h + 2, C.ink) + r(x, y, w, h, fill);
}

/**
 * A thick line between two joints, rasterised as stepped pixel runs.
 *
 * Stepping along the major axis and emitting one rect per step is the standard
 * way to draw a pixel-art limb at an angle: it stays on whole pixels, so the
 * nearest-neighbour upscale keeps the staircase crisp instead of blurring it
 * into a smooth diagonal.
 */
function bone(from, to, thickness, fill) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const steps = Math.max(1, Math.round(Math.max(Math.abs(dx), Math.abs(dy))));
  const half = thickness / 2;
  let out = '';
  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps;
    const x = x1 + dx * t;
    const y = y1 + dy * t;
    out += Math.abs(dx) >= Math.abs(dy)
      ? r(Math.round(x), Math.round(y - half), 1, thickness, fill)
      : r(Math.round(x - half), Math.round(y), thickness, 1, fill);
  }
  return out;
}

/** A joint cap, so elbows and knees are not square corners. */
function joint(at, size, fill) {
  return blob(Math.round(at[0] - size / 2), Math.round(at[1] - size / 2), size, size, fill);
}

/** The recurring probability motif: a small gold diamond. */
function pip(x, y, size, fill = C.gold) {
  let out = '';
  for (let row = 0; row < size; row += 1) {
    const spread = row <= (size - 1) / 2 ? row : size - 1 - row;
    out += r(x + (size - 1) / 2 - spread, y + row, spread * 2 + 1, 1, fill);
  }
  return out;
}

/**
 * A limb that changes thickness along its length.
 *
 * Shoulders wider than the waist, thighs wider than ankles. A constant-width
 * torso is the single biggest reason a pixel figure reads as a stack of boxes
 * rather than as a body.
 */
function taperedBone(from, to, fromThickness, toThickness, fill) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const steps = Math.max(1, Math.round(Math.max(Math.abs(dx), Math.abs(dy))));
  let out = '';
  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps;
    const thickness = Math.max(
      1,
      Math.round(fromThickness + (toThickness - fromThickness) * t),
    );
    const x = x1 + dx * t;
    const y = y1 + dy * t;
    const half = thickness / 2;
    out += Math.abs(dx) >= Math.abs(dy)
      ? r(Math.round(x), Math.round(y - half), 1, thickness, fill)
      : r(Math.round(x - half), Math.round(y), thickness, 1, fill);
  }
  return out;
}

function taperedLimb(from, to, fromThickness, toThickness, fill) {
  return taperedBone(from, to, fromThickness + 2, toThickness + 2, C.ink)
    + taperedBone(from, to, fromThickness, toThickness, fill);
}

/**
 * A gold band across a limb, used for cuffs and shin guards.
 *
 * Drawn along the limb's perpendicular so it reads as a ring around the limb
 * rather than a stripe lying on top of it.
 */
function band(from, to, position, thickness, fill = C.gold) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.hypot(dx, dy) || 1;
  const px = -dy / length;
  const py = dx / length;
  const cx = from[0] + dx * position;
  const cy = from[1] + dy * position;
  const half = thickness / 2;
  return bone(
    [cx - px * half, cy - py * half],
    [cx + px * half, cy + py * half],
    3,
    fill,
  );
}

// --------------------------------------------------------------- rig parts
//
// These are single straight segments; the runtime rotates them at their joints,
// so they are drawn upright and only need shape, shading and trim.

export const luckyParts = {
  // 40 x 52 — white hair, visor, high collar.
  head: {
    width: 40,
    height: 52,
    art: [
      // Hair mass, stepped at the crown so it is not a plain box.
      r(11, 2, 18, 1, C.ink),
      blob(9, 3, 22, 4, C.hair),
      blob(7, 6, 26, 30, C.hair),
      r(9, 26, 6, 10, C.hairShade),
      // Face inset into the hair.
      blob(12, 13, 17, 22, C.skin),
      r(12, 30, 17, 5, C.skinShade),
      // Visor: gold frame, cyan lens, one bright reflection run.
      r(9, 17, 24, 1, C.goldDim),
      r(9, 18, 24, 6, C.visor),
      r(12, 19, 7, 2, C.visorLit),
      r(9, 24, 24, 1, C.gold),
      // Neck and collar.
      r(16, 35, 9, 5, C.skinShade),
      blob(10, 39, 21, 9, C.black),
      r(10, 39, 21, 2, C.gold),
      pip(19, 42, 3, C.goldLit),
    ].join(''),
  },

  // 20 x 62 — the tied-back tail.
  ponytail: {
    width: 20,
    height: 62,
    art: [
      blob(5, 3, 11, 22, C.hair),
      r(4, 21, 13, 4, C.gold),
      r(4, 21, 13, 1, C.goldLit),
      blob(4, 25, 12, 20, C.hairShade),
      blob(5, 44, 10, 12, C.hair),
      blob(6, 55, 7, 4, C.hairShade),
    ].join(''),
  },

  // 46 x 68 — asymmetric jacket: black across one shoulder, green body.
  torso: {
    width: 46,
    height: 68,
    art: [
      blob(6, 3, 34, 62, C.green),
      r(6, 3, 15, 62, C.black),
      r(21, 3, 19, 62, C.greenLit),
      r(30, 9, 10, 42, C.greenTop),
      // Gold lapel running across the asymmetric closure.
      r(19, 3, 4, 62, C.gold),
      r(19, 3, 2, 62, C.goldLit),
      r(6, 3, 34, 2, C.ink),
      // Chest pip and belt line.
      pip(27, 26, 7, C.goldLit),
      r(6, 56, 34, 4, C.black),
      r(6, 56, 34, 1, C.gold),
    ].join(''),
  },

  // 38 x 34 — hips, gold belt.
  hips: {
    width: 38,
    height: 34,
    art: [
      blob(5, 3, 28, 28, C.black),
      r(19, 3, 14, 28, C.blackLit),
      r(5, 3, 28, 5, C.gold),
      r(5, 3, 28, 2, C.goldLit),
      pip(17, 12, 5),
    ].join(''),
  },

  // 20 x 82 — the long jacket tail, the silhouette's signature.
  sash: {
    width: 20,
    height: 82,
    art: [
      blob(4, 3, 12, 70, C.green),
      r(10, 3, 6, 70, C.greenLit),
      r(4, 3, 12, 3, C.gold),
      // Stepped, torn hem rather than a flat cut.
      blob(5, 73, 10, 3, C.green),
      blob(7, 76, 6, 3, C.green),
      r(4, 68, 12, 3, C.black),
      r(4, 68, 12, 1, C.gold),
      pip(7, 28, 5, C.goldLit),
    ].join(''),
  },

  // 22 x 54 — sleeve.
  upperArm: {
    width: 22,
    height: 54,
    art: [
      blob(5, 3, 12, 46, C.green),
      r(11, 3, 6, 46, C.greenLit),
      r(4, 8, 14, 4, C.gold),
      r(4, 8, 14, 1, C.goldLit),
      blob(6, 49, 10, 2, C.green),
    ].join(''),
  },

  // 20 x 50 — forearm and the bare striking hand.
  forearm: {
    width: 20,
    height: 50,
    art: [
      blob(5, 3, 11, 26, C.black),
      r(10, 3, 6, 26, C.blackLit),
      r(4, 25, 13, 3, C.gold),
      blob(5, 31, 11, 13, C.skin),
      r(5, 39, 11, 5, C.skinShade),
    ].join(''),
  },

  // 26 x 58 — thigh.
  thigh: {
    width: 26,
    height: 58,
    art: [
      blob(5, 3, 16, 50, C.black),
      r(13, 3, 8, 50, C.blackLit),
      r(5, 44, 16, 3, C.green),
      blob(7, 53, 12, 2, C.black),
    ].join(''),
  },

  // 24 x 56 — shin with a gold band.
  shin: {
    width: 24,
    height: 56,
    art: [
      blob(5, 3, 14, 48, C.black),
      r(12, 3, 7, 48, C.blackLit),
      r(4, 30, 16, 4, C.gold),
      r(4, 30, 16, 1, C.goldLit),
    ].join(''),
  },

  // 38 x 22 — boot.
  boot: {
    width: 38,
    height: 22,
    art: [
      blob(4, 3, 30, 13, C.black),
      r(4, 3, 16, 13, C.blackLit),
      r(4, 13, 30, 3, C.gold),
      r(4, 16, 30, 1, C.ink),
      blob(6, 17, 26, 2, C.black),
    ].join(''),
  },
};

// ------------------------------------------------------------ attack poses

const POSE_WIDTH = 180;
const POSE_HEIGHT = 320;

/**
 * Whole-body attack drawings, one per attack button.
 *
 * The limb rule is visual as well as mechanical: `lp` (J) and `lk` (K) extend
 * an arm, `hp` (I) and `hk` (L) extend a leg. A player who saw a kick after
 * pressing J would be looking at a bug, so the drawings are exactly what the
 * command table promises.
 *
 * Poses are laid out to stay inside the texture with a clear border. The drawn
 * grid is half the manifest size, so the rightmost usable column is about
 * x = 172; a limb reaching 178 would land on the final grid column and fail the
 * transparent-border check in `check-sprite-quality.mjs`.
 */

/** Draw a whole figure from a named skeleton. */
function figure(skeleton) {
  const {
    hip, neck, head,
    shoulderBack, elbowBack, handBack,
    shoulderFront, elbowFront, handFront,
    kneeBack, footBack,
    kneeFront, footFront,
    tail,
  } = skeleton;

  return [
    // Jacket tail: narrow, dark, and hanging behind the hip so it reads as
    // cloth rather than as a third leg.
    taperedLimb(hip, tail, 12, 7, C.green),
    r(Math.round(tail[0]) - 4, Math.round(tail[1]) - 1, 8, 3, C.gold),

    // Back limbs, drawn first and kept flat so they sit behind the body.
    taperedLimb(hip, kneeBack, 14, 11, C.black),
    taperedLimb(kneeBack, footBack, 11, 8, C.black),
    boot(footBack, kneeBack, C.black),
    taperedLimb(shoulderBack, elbowBack, 12, 10, C.green),
    taperedLimb(elbowBack, handBack, 10, 8, C.black),
    joint(handBack, 8, C.skinShade),

    // Torso: waist to shoulders, widening as it goes up.
    taperedLimb(hip, neck, 19, 27, C.green),
    // The asymmetric closure: black panel on the back half, gold seam.
    taperedBone(
      [hip[0] - 5, hip[1]], [neck[0] - 7, neck[1]], 9, 13, C.black,
    ),
    taperedBone(
      [hip[0] + 2, hip[1]], [neck[0] + 1, neck[1]], 3, 4, C.gold,
    ),
    pip(
      Math.round((hip[0] + neck[0]) / 2) + 3,
      Math.round((hip[1] + neck[1]) / 2) - 4,
      9,
      C.goldLit,
    ),
    // Belt.
    blob(Math.round(hip[0]) - 11, Math.round(hip[1]) - 4, 22, 10, C.black),
    r(Math.round(hip[0]) - 11, Math.round(hip[1]) - 4, 22, 3, C.gold),

    // Front leg.
    taperedLimb(hip, kneeFront, 16, 12, C.black),
    taperedBone(hip, kneeFront, 6, 5, C.blackLit),
    taperedLimb(kneeFront, footFront, 12, 9, C.black),
    band(kneeFront, footFront, 0.68, 12),
    boot(footFront, kneeFront, C.blackLit),

    // Head sits above the torso and below the front arm.
    headBlock(head, neck),

    // Front arm.
    taperedLimb(shoulderFront, elbowFront, 14, 11, C.green),
    taperedBone(shoulderFront, elbowFront, 6, 5, C.greenLit),
    band(shoulderFront, elbowFront, 0.22, 14),
    taperedLimb(elbowFront, handFront, 11, 9, C.black),
    blob(Math.round(handFront[0]) - 6, Math.round(handFront[1]) - 6, 12, 12, C.skin),
    r(Math.round(handFront[0]) - 6, Math.round(handFront[1]) + 1, 12, 5, C.skinShade),
  ].join('');
}

/**
 * A boot, oriented so the toe points away from the knee.
 *
 * The upper is lightened for the front leg so the two legs separate against a
 * dark stage; a boot drawn in the same near-black as the trouser disappears.
 */
function boot(foot, knee, upper) {
  const forward = foot[0] >= knee[0] ? 1 : -1;
  const x = Math.round(foot[0] - (forward > 0 ? 7 : 13));
  const y = Math.round(foot[1] - 4);
  return blob(x, y, 20, 9, upper)
    + r(x, y, 20, 2, C.blackLit)
    + r(x, y + 6, 20, 3, C.gold)
    + r(x, y + 9, 20, 1, C.ink);
}

/**
 * Head, visor and hair.
 *
 * The crown is stepped in three widths rather than being one rectangle — a
 * square head is the other half of why a blocky figure reads as a diagram.
 */
function headBlock(head, neck) {
  const x = Math.round(head[0]);
  const y = Math.round(head[1]);
  return [
    // Neck, drawn first so the collar overlaps it.
    bone([x + 1, y + 8], [neck[0], neck[1]], 9, C.skinShade),
    // Ponytail, thrown back and down from the tie.
    taperedLimb([x - 12, y - 8], [x - 26, y + 10], 9, 5, C.hair),
    r(x - 24, y + 2, 8, 6, C.hairShade),
    // Hair mass: stepped crown, then the bulk, then a side lock.
    r(x - 6, y - 20, 14, 2, C.ink),
    blob(x - 8, y - 18, 18, 3, C.hair),
    blob(x - 11, y - 15, 24, 4, C.hair),
    blob(x - 13, y - 11, 27, 22, C.hair),
    r(x - 13, y - 1, 6, 12, C.hairShade),
    r(x - 12, y - 14, 10, 3, C.hairShade),
    // Gold hair tie.
    r(x - 15, y - 6, 5, 5, C.gold),
    // Face inset into the hair.
    blob(x - 6, y - 8, 19, 20, C.skin),
    r(x - 6, y + 5, 19, 7, C.skinShade),
    // Visor.
    r(x - 11, y - 5, 25, 2, C.goldDim),
    r(x - 11, y - 3, 25, 7, C.visor),
    r(x - 7, y - 2, 7, 3, C.visorLit),
    r(x - 11, y + 4, 25, 2, C.gold),
    // Collar, bridging head to torso.
    blob(x - 9, y + 12, 20, 8, C.black),
    r(x - 9, y + 12, 20, 3, C.gold),
  ].join('');
}

export function attackPose(kind) {
  if (kind === 'lp') {
    // J — Quick Draw. The lead hand fires straight out from the waist; the
    // rear hand stays chambered low. Both hands, no leg.
    return figure({
      hip: [74, 196], neck: [76, 142], head: [78, 122],
      shoulderBack: [68, 148], elbowBack: [54, 170], handBack: [62, 192],
      shoulderFront: [84, 150], elbowFront: [114, 148], handFront: [146, 146],
      kneeBack: [56, 240], footBack: [42, 290],
      kneeFront: [96, 242], footFront: [110, 290],
      tail: [48, 254],
    }) + pip(156, 138, 11, C.goldLit) + pip(164, 152, 7, C.gold);
  }

  if (kind === 'lk') {
    // K — Loaded Shoulder. The body drives forward behind a raised forearm and
    // the shoulder is the contact point. An upper-body attack, never a kick.
    return figure({
      hip: [66, 200], neck: [84, 148], head: [92, 128],
      shoulderBack: [74, 154], elbowBack: [56, 176], handBack: [66, 196],
      shoulderFront: [94, 152], elbowFront: [110, 132], handFront: [100, 112],
      kneeBack: [48, 244], footBack: [30, 292],
      kneeFront: [96, 246], footFront: [116, 292],
      tail: [38, 256],
    })
      // The driving shoulder cap and its gold probability ring.
      + blob(98, 140, 20, 20, C.greenTop)
      + r(98, 140, 20, 4, C.gold)
      + pip(120, 138, 15, C.goldLit)
      + pip(134, 144, 11, C.gold)
      + pip(146, 150, 7, C.goldDim);
  }

  if (kind === 'hp') {
    // I — Sliding Bet. The body drops, the rear leg folds under and the lead
    // leg extends flat along the floor; the torso reclines to balance it.
    return figure({
      hip: [72, 262], neck: [56, 226], head: [48, 206],
      shoulderBack: [50, 232], elbowBack: [34, 250], handBack: [26, 274],
      shoulderFront: [62, 234], elbowFront: [80, 248], handFront: [94, 242],
      kneeBack: [56, 288], footBack: [36, 294],
      kneeFront: [116, 286], footFront: [152, 290],
      tail: [40, 282],
    })
      // Green-gold trail behind the sliding foot.
      + pip(150, 282, 11, C.goldLit)
      + pip(160, 288, 7, C.greenTop);
  }

  // L — Fortune Heel. Weight on the support leg, hips rotate, the rear heel
  // travels up and forward, and the torso leans away from it.
  return figure({
    hip: [70, 198], neck: [60, 144], head: [52, 124],
    shoulderBack: [52, 150], elbowBack: [38, 172], handBack: [48, 192],
    shoulderFront: [68, 150], elbowFront: [84, 172], handFront: [74, 192],
    kneeBack: [64, 246], footBack: [54, 292],
    kneeFront: [106, 178], footFront: [134, 118],
    tail: [40, 258],
  })
    // Gold arc following the heel.
    + pip(144, 104, 15, C.goldLit)
    + pip(154, 130, 11, C.gold)
    + pip(158, 154, 7, C.goldDim);
}

export const LUCKY_POSE_SIZE = { width: POSE_WIDTH, height: POSE_HEIGHT };

/** Kept for the renderer's `<defs>` slot; the pixel art needs no gradients. */
export const luckyDefs = '';
