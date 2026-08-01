/**
 * GLITCH — the reality breaker.
 *
 * Slim mobile silhouette on the same bone lengths as MIM, but read completely
 * differently: a hard tech helmet with a cyan visor instead of a soft mask,
 * swept white hair instead of braids, one heavy asymmetric shoulder plate, and
 * an energy scarf that trails violet into cyan.
 *
 * The visor is the identity anchor. It is the brightest cluster on the head and
 * it always points the way GLITCH is facing, so even at a sixteen-pixel figure
 * height the direction of an attack is never ambiguous.
 */

/**
 * The suit has to sit well clear of the arena background in value.
 *
 * GLITCH is a dark character on a dark sheet, and the first pass drew a navy
 * body on a navy panel — technically correct, unreadable in practice. The ramp
 * below keeps the black-and-blue identity but starts it several steps lighter,
 * so the silhouette holds without the palette drifting away from the reference.
 */
export const PALETTE = {
  ink: [5, 7, 16, 255],
  suitDeep: [30, 38, 66, 255],
  suit: [52, 64, 104, 255],
  suitLit: [86, 104, 152, 255],
  plateDeep: [44, 52, 86, 255],
  plate: [84, 100, 146, 255],
  plateLit: [146, 166, 210, 255],
  hairLit: [244, 246, 255, 255],
  hair: [214, 220, 244, 255],
  hairShade: [158, 168, 206, 255],
  cyanGlow: [162, 246, 255, 255],
  cyan: [58, 208, 246, 255],
  cyanDeep: [20, 126, 182, 255],
  violetGlow: [198, 172, 255, 255],
  violet: [148, 118, 238, 255],
  violetDeep: [88, 66, 172, 255],
  skin: [188, 152, 134, 255],
  skinShade: [134, 104, 92, 255],
};

export const BONES = {
  origin: [88, 112],
  crownToFloor: 96,
  hipHeight: 50,
  waistRise: 4,
  torso: 26,
  neckToHead: 8,
  shoulderOffset: 3.5,
  hipOffset: 4,
  upperArm: 14,
  forearm: 13,
  thigh: 22,
  shin: 19,
  foot: 5,
  handReach: 3,
  thickness: {
    upperArm: 2.8,
    forearm: 2.3,
    hand: 2.4,
    thigh: 4.4,
    shin: 3.2,
    torso: 7,
  },
};

const P = PALETTE;

function folded(pose) {
  const limit = pose.floor ?? Number.POSITIVE_INFINITY;
  return (x, y) => [x, Math.min(y, limit)];
}

export function drawPose(canvas, pose) {
  drawHair(canvas, pose);
  drawScarf(canvas, pose);
  drawArm(canvas, pose.back, 'back');
  drawLeg(canvas, pose.back, 'back');
  drawHips(canvas, pose);
  drawTorso(canvas, pose);
  drawHead(canvas, pose);
  drawLeg(canvas, pose.front, 'front');
  drawArm(canvas, pose.front, 'front');
  // Cold key light from the front and above, then the contour.
  canvas.rim(0, -1, P.cyanDeep, P.cyanGlow);
  canvas.rim(1, 0, P.cyan, P.cyanGlow);
}

/**
 * Swept hair: four stiff spikes rather than MIM's soft braids.
 *
 * The strands fan by a fixed angle each. Swinging them all through one angle
 * collapses them into a single slab exactly when the pose is most extreme, and
 * the swept hair is half of what separates GLITCH from MIM in silhouette.
 */
function drawHair(canvas, pose) {
  const [hx, hy] = pose.head;
  const fold = folded(pose);
  for (const [index, spec] of [
    { drop: -4, reach: 20, sag: 3 },
    { drop: -1, reach: 24, sag: 5 },
    { drop: 3, reach: 19, sag: 8 },
    { drop: 6, reach: 13, sag: 10 },
  ].entries()) {
    const sweep = pose.braidSweep + index * 0.17 - 0.26;
    let previous = fold(hx - 3, hy + spec.drop);
    for (let step = 1; step <= 6; step += 1) {
      const t = step / 6;
      const point = fold(
        hx - 3 - spec.reach * t * Math.cos(sweep),
        hy + spec.drop + spec.sag * t * t - spec.reach * t * Math.sin(sweep),
      );
      canvas.capsule(
        previous[0], previous[1], point[0], point[1],
        1.7 - t * 0.9,
        step % 2 === 0 ? P.hair : P.hairShade,
      );
      previous = point;
    }
    canvas.set(previous[0], previous[1], index % 2 === 0 ? P.hairLit : P.violet);
  }
}

/** The energy scarf: violet at the shoulder, drifting to cyan at the tip. */
function drawScarf(canvas, pose) {
  const [nx, ny] = pose.neck;
  const sweep = pose.sashSweep;
  const fold = folded(pose);
  let previous = fold(nx - 3, ny + 3);
  for (let step = 1; step <= 9; step += 1) {
    const t = step / 9;
    const point = fold(
      nx - 3 - 30 * t * Math.cos(sweep),
      ny + 3 + 16 * t * t - 30 * t * Math.sin(sweep),
    );
    canvas.capsule(
      previous[0], previous[1], point[0], point[1],
      2.8 - t * 1.8,
      t > 0.66 ? P.cyanDeep : P.violetDeep,
    );
    if (step === 3 || step === 6) canvas.set(point[0], point[1] - 1, P.violetGlow);
    previous = point;
  }
  canvas.set(previous[0], previous[1], P.cyanGlow);
}

function drawArm(canvas, limb, side) {
  const front = side === 'front';
  const suit = front ? P.suit : P.suitDeep;
  const plate = front ? P.plate : P.plateDeep;
  const { thickness } = BONES;

  canvas.capsule(
    limb.shoulder[0], limb.shoulder[1], limb.elbow[0], limb.elbow[1],
    thickness.upperArm, suit,
  );
  // Asymmetric shoulder: the lead side carries the heavy plate.
  canvas.disc(limb.shoulder[0], limb.shoulder[1], front ? 4.2 : 3, plate);
  if (front) {
    canvas.disc(limb.shoulder[0] + 1, limb.shoulder[1] - 1, 2.6, P.plateLit);
    canvas.set(limb.shoulder[0] + 2, limb.shoulder[1] + 1, P.cyan);
  }
  canvas.capsule(
    limb.elbow[0], limb.elbow[1], limb.wrist[0], limb.wrist[1],
    thickness.forearm, suit,
  );
  // Forearm plate and the glove, oriented along the bone.
  const dx = limb.wrist[0] - limb.elbow[0];
  const dy = limb.wrist[1] - limb.elbow[1];
  const length = Math.hypot(dx, dy) || 1;
  canvas.capsule(
    limb.elbow[0] + (dx / length) * 3, limb.elbow[1] + (dy / length) * 3,
    limb.elbow[0] + (dx / length) * 9, limb.elbow[1] + (dy / length) * 9,
    2.6, plate,
  );
  canvas.disc(limb.wrist[0], limb.wrist[1], thickness.hand, front ? P.suitDeep : P.ink);
  canvas.disc(
    limb.wrist[0] + (dx / length) * 2, limb.wrist[1] + (dy / length) * 2,
    1.2, front ? P.cyan : P.cyanDeep,
  );
}

function drawLeg(canvas, limb, side) {
  const front = side === 'front';
  const suit = front ? P.suit : P.suitDeep;
  const plate = front ? P.plate : P.plateDeep;
  const { thickness } = BONES;

  canvas.capsule(
    limb.hip[0], limb.hip[1], limb.knee[0], limb.knee[1],
    thickness.thigh, suit,
  );
  canvas.capsule(
    limb.knee[0], limb.knee[1], limb.ankle[0], limb.ankle[1],
    thickness.shin, suit,
  );
  canvas.disc(limb.knee[0], limb.knee[1], 3.2, plate);
  canvas.set(limb.knee[0] + 1, limb.knee[1], front ? P.cyan : P.cyanDeep);

  // Boot, built along the shin so the foot never detaches from the leg.
  const dx = limb.ankle[0] - limb.knee[0];
  const dy = limb.ankle[1] - limb.knee[1];
  const length = Math.hypot(dx, dy) || 1;
  const toe = [
    limb.ankle[0] - (dy / length) * BONES.foot,
    limb.ankle[1] + (dx / length) * BONES.foot,
  ];
  canvas.capsule(limb.ankle[0], limb.ankle[1], toe[0], toe[1], 3, plate);
  canvas.capsule(
    limb.ankle[0], limb.ankle[1] + 1, toe[0], toe[1] + 1,
    1.2, front ? P.cyan : P.cyanDeep,
  );
}

function drawHips(canvas, pose) {
  const [wx, wy] = pose.waist;
  const fold = folded(pose);
  canvas.polygon([
    fold(wx - 7, wy + 1), fold(wx + 8, wy + 1),
    fold(wx + 7, wy + 10), fold(wx - 6, wy + 10),
  ], P.suitDeep);
  canvas.polygon([
    fold(wx + 3, wy + 2), fold(wx + 8, wy + 2),
    fold(wx + 7, wy + 11), fold(wx + 3, wy + 9),
  ], P.plate);
  canvas.line(wx - 6, wy + 3, wx + 6, wy + 3, P.cyanDeep);
}

function drawTorso(canvas, pose) {
  const [wx, wy] = pose.waist;
  const [nx, ny] = pose.neck;
  canvas.capsule(wx, wy, nx, ny, BONES.thickness.torso, P.suitDeep);
  const dx = (nx - wx) / 4;
  // Chest plate, cut back over the rear shoulder so the armour reads asymmetric.
  canvas.polygon([
    [nx - 6 + dx, ny + 1], [nx + 8, ny],
    [wx + 7, wy - 1], [wx - 3, wy], [wx - 6, wy - 8],
  ], P.suit);
  canvas.polygon([
    [nx + 2, ny], [nx + 8, ny], [wx + 7, wy - 2], [wx + 3, wy - 1],
  ], P.plate);
  canvas.polygon([
    [nx - 6 + dx, ny + 2], [nx - 2, ny + 3], [wx - 4, wy - 1], [wx - 6, wy - 7],
  ], P.plateDeep);
  // The core: a cyan diamond, the brightest thing on the body.
  const cx = nx + 1;
  const cy = ny + 9;
  canvas.set(cx, cy - 2, P.cyan);
  canvas.set(cx - 1, cy - 1, P.cyan);
  canvas.set(cx, cy - 1, P.cyanGlow);
  canvas.set(cx + 1, cy - 1, P.cyan);
  canvas.set(cx - 1, cy, P.cyanGlow);
  canvas.set(cx, cy, [255, 255, 255, 255]);
  canvas.set(cx + 1, cy, P.cyanGlow);
  canvas.set(cx, cy + 1, P.cyan);
  canvas.rect(wx - 6, wy - 3, 13, 3, P.ink);
  canvas.set(wx + 1, wy - 2, P.violet);
}

function drawHead(canvas, pose) {
  const [hx, hy] = pose.head;
  const [nx, ny] = pose.neck;
  canvas.capsule(nx, ny, hx, hy, 2, P.skinShade);
  // Hard helmet rather than a soft mask: flat back, angled brow.
  canvas.polygon([
    [hx - 6, hy - 5], [hx + 3, hy - 7], [hx + 6, hy - 2],
    [hx + 5, hy + 6], [hx - 2, hy + 8], [hx - 7, hy + 3],
  ], P.plateDeep);
  canvas.polygon([
    [hx - 4, hy - 5], [hx + 3, hy - 6], [hx + 6, hy - 2], [hx - 2, hy - 1],
  ], P.plate);
  // Visor: the identity anchor, and the one element that states the facing.
  canvas.polygon([
    [hx - 1, hy - 2], [hx + 6, hy - 1], [hx + 5, hy + 3], [hx - 1, hy + 2],
  ], P.cyanDeep);
  canvas.polygon([
    [hx, hy - 1], [hx + 5, hy], [hx + 4, hy + 2], [hx, hy + 1],
  ], P.cyan);
  canvas.set(hx + 4, hy, P.cyanGlow);
  canvas.set(hx + 3, hy + 1, P.cyanGlow);
  // Jaw guard.
  canvas.polygon([
    [hx - 2, hy + 4], [hx + 4, hy + 4], [hx + 3, hy + 7], [hx - 1, hy + 7],
  ], P.suitDeep);
}
