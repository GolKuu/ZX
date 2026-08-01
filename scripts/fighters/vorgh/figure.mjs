/**
 * VORGH — the rage-driven predator.
 *
 * Heavier through the chest and shoulders than MIM or GLITCH and longer in the
 * arm, so the stance reads as a hunter leaning over its target rather than an
 * acrobat. Black-red battered armour, clawed gauntlets, a dark mane, a red
 * scarf, and rage cracks glowing through the breaks in the plate.
 *
 * The rage cracks are the one element that changes between the base and the
 * High Rage pass. They are drawn strictly inside the armour that is already
 * there, so they can brighten without moving a single silhouette pixel: the
 * limb, the trajectory, the proportions and the facing are the same solve in
 * both passes, and `verify.mjs` asserts it rather than trusting it.
 */

/**
 * Black-red, but not black on a dark page.
 *
 * VORGH's identity colour is nearly the value of the sheet background, so the
 * ramp starts several steps up from true black and leans warm. That keeps the
 * silhouette separated from the panel by hue as well as by value, which is what
 * survives being shrunk to fighting-game size.
 */
export const PALETTE = {
  ink: [6, 5, 10, 255],
  armourDeep: [48, 25, 31, 255],
  armour: [84, 45, 51, 255],
  armourLit: [132, 79, 82, 255],
  steelDeep: [46, 46, 57, 255],
  steel: [96, 96, 110, 255],
  steelLit: [156, 158, 174, 255],
  hairLit: [112, 102, 120, 255],
  hair: [68, 61, 78, 255],
  hairShade: [40, 36, 50, 255],
  clothLit: [236, 92, 78, 255],
  cloth: [190, 44, 44, 255],
  clothDeep: [108, 22, 30, 255],
  rageCore: [255, 240, 214, 255],
  rageHot: [255, 146, 84, 255],
  rage: [238, 66, 50, 255],
  rageDeep: [152, 30, 32, 255],
  skin: [200, 152, 128, 255],
  skinShade: [136, 94, 82, 255],
};

/**
 * Broader and longer in the arm than the two acrobats, on the same 96px height.
 *
 * The reach is the point: PREDATOR RAKE and HUNTING SWEEP both want to arrive
 * from further out than MIM can, and a wide shoulder line is most of what makes
 * a silhouette read as heavy without changing how tall the character is.
 */
export const BONES = {
  origin: [88, 112],
  crownToFloor: 96,
  hipHeight: 51,
  waistRise: 4,
  torso: 27,
  neckToHead: 8,
  shoulderOffset: 4.5,
  hipOffset: 4.5,
  upperArm: 15,
  forearm: 14,
  thigh: 21,
  shin: 18,
  foot: 6,
  // The claws land before the fist does, so the contact point sits past the
  // knuckles rather than on the wrist joint.
  handReach: 5,
  thickness: {
    upperArm: 3.6,
    forearm: 3,
    hand: 3,
    thigh: 5.4,
    shin: 4,
    torso: 8.4,
  },
};

const P = PALETTE;
const T = BONES.thickness;

function folded(pose) {
  const limit = pose.floor ?? Number.POSITIVE_INFINITY;
  return (x, y) => [x, Math.min(y, limit)];
}

function unit(from, to) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.hypot(dx, dy) || 1;
  return [dx / length, dy / length, length];
}

export function drawPose(canvas, pose) {
  drawMane(canvas, pose);
  drawScarf(canvas, pose);
  drawArm(canvas, pose.back, 'back', pose);
  drawLeg(canvas, pose.back, 'back');
  drawHips(canvas, pose);
  drawTorso(canvas, pose);
  drawHead(canvas, pose);
  drawLeg(canvas, pose.front, 'front');
  drawArm(canvas, pose.front, 'front', pose);
  // Warm key from the front and above, then the contour, so the rim reads as
  // firelight off battered plate rather than as the cold tech light on GLITCH.
  canvas.rim(0, -1, P.rageDeep, P.rageHot);
  canvas.rim(1, 0, P.rage, P.rageCore);
}

/**
 * The mane: four heavy locks rather than MIM's braids or GLITCH's stiff spikes.
 *
 * Each lock is fanned by a fixed angle. Swinging them all through one angle
 * collapses them into a single slab exactly when the pose is most extreme, and
 * the mane carries half of what separates VORGH's head from the other two.
 */
function drawMane(canvas, pose) {
  const [hx, hy] = pose.head;
  const fold = folded(pose);
  // High Rage lifts the hair further off the shoulders. It is secondary motion
  // only: it never reaches forward past the body, so the striking side of the
  // silhouette is identical in both passes.
  const swell = pose.rage === true ? 1.18 : 1;
  for (const [index, spec] of [
    { drop: -3, reach: 17, sag: 6 },
    { drop: 0, reach: 22, sag: 9 },
    { drop: 4, reach: 20, sag: 12 },
    { drop: 7, reach: 14, sag: 14 },
  ].entries()) {
    const sweep = pose.braidSweep + index * 0.16 - 0.24;
    const reach = spec.reach * swell;
    let previous = fold(hx - 3, hy + spec.drop);
    for (let step = 1; step <= 6; step += 1) {
      const t = step / 6;
      const point = fold(
        hx - 3 - reach * t * Math.cos(sweep),
        hy + spec.drop + spec.sag * t * t - reach * t * Math.sin(sweep),
      );
      canvas.capsule(
        previous[0], previous[1], point[0], point[1],
        2.1 - t * 0.9,
        step % 2 === 0 ? P.hair : P.hairShade,
      );
      previous = point;
    }
    canvas.set(previous[0], previous[1], index % 2 === 0 ? P.hairLit : P.hair);
  }
}

/**
 * The torn red scarf, with a lag pass.
 *
 * Length is driven by how hard the pose is swinging, not only by its angle.
 * Parented rigidly to the waist the cloth only rotates, so it sits at its
 * shortest on the frames it should be longest — trailing cloth reaches full
 * extension at contact and through the follow-through.
 */
function drawScarf(canvas, pose) {
  const [nx, ny] = pose.neck;
  const sweep = pose.sashSweep;
  const fold = folded(pose);
  const swell = pose.rage === true ? 1.16 : 1;
  const reach = (28 + Math.abs(sweep) * 22) * swell;
  let previous = fold(nx - 3, ny + 4);
  for (let step = 1; step <= 9; step += 1) {
    const t = step / 9;
    const point = fold(
      nx - 3 - reach * t * Math.cos(sweep),
      ny + 4 + 17 * t * t - reach * t * Math.sin(sweep),
    );
    canvas.capsule(
      previous[0], previous[1], point[0], point[1],
      3 - t * 1.9,
      step % 3 === 0 ? P.clothDeep : P.cloth,
    );
    // The lit edge runs along the top of the cloth, the way the body is lit.
    if (step % 2 === 1) canvas.set(point[0], point[1] - 1, P.clothLit);
    previous = point;
  }
  canvas.set(previous[0], previous[1], P.clothLit);
}

/**
 * A rage crack: a short jagged glow inside a plate.
 *
 * It is drawn over armour that has already been laid down, never past its edge,
 * so High Rage can brighten the character without altering one silhouette pixel.
 */
function crack(canvas, x, y, dx, dy, steps, rageOn) {
  const core = rageOn ? P.rageCore : P.rageHot;
  const body = rageOn ? P.rageHot : P.rage;
  for (let step = 0; step < steps; step += 1) {
    const wobble = step % 2 === 0 ? 0 : 1;
    canvas.set(x + dx * step + wobble, y + dy * step, step % 3 === 0 ? core : body);
  }
}

function drawArm(canvas, limb, side, pose) {
  const front = side === 'front';
  const plate = front ? P.armour : P.armourDeep;
  const trim = front ? P.steel : P.steelDeep;

  canvas.capsule(
    limb.shoulder[0], limb.shoulder[1], limb.elbow[0], limb.elbow[1],
    T.upperArm, plate,
  );
  // Heavy pauldron. The lead side carries the bigger, broken one.
  canvas.disc(limb.shoulder[0], limb.shoulder[1], front ? 5.4 : 4, plate);
  canvas.disc(limb.shoulder[0] - 1, limb.shoulder[1] - 1, front ? 4 : 2.8, trim);
  if (front) {
    canvas.set(limb.shoulder[0] + 2, limb.shoulder[1] - 3, P.armourLit);
    crack(canvas, limb.shoulder[0] - 2, limb.shoulder[1] - 2, 0, 1, 4, pose.rage === true);
  }

  canvas.capsule(
    limb.elbow[0], limb.elbow[1], limb.wrist[0], limb.wrist[1],
    T.forearm, plate,
  );
  const [ux, uy] = unit(limb.elbow, limb.wrist);
  // Vambrace, built along the bone so it can never detach from the forearm.
  canvas.capsule(
    limb.elbow[0] + ux * 4, limb.elbow[1] + uy * 4,
    limb.elbow[0] + ux * 10, limb.elbow[1] + uy * 10,
    2.8, trim,
  );
  drawClaw(canvas, limb, front, ux, uy);
}

/**
 * The clawed gauntlet.
 *
 * Three blades fanned off the knuckles and built along the forearm, so the
 * claws always point where the arm is travelling. This is the shape that has to
 * survive being shrunk: the fist alone would read as any character's punch.
 */
function drawClaw(canvas, limb, front, ux, uy) {
  const bright = front ? P.steelLit : P.steel;
  canvas.disc(limb.wrist[0], limb.wrist[1], T.hand, front ? P.steel : P.steelDeep);
  for (const spread of [-0.44, 0, 0.44]) {
    const cos = Math.cos(spread);
    const sin = Math.sin(spread);
    const rx = ux * cos - uy * sin;
    const ry = ux * sin + uy * cos;
    canvas.capsule(
      limb.wrist[0] + rx * 1.6, limb.wrist[1] + ry * 1.6,
      limb.wrist[0] + rx * 5.4, limb.wrist[1] + ry * 5.4,
      1.1, bright,
    );
    canvas.set(limb.wrist[0] + rx * 6, limb.wrist[1] + ry * 6, front ? P.rageCore : P.rage);
  }
}

function drawLeg(canvas, limb, side) {
  const front = side === 'front';
  const plate = front ? P.armour : P.armourDeep;
  const trim = front ? P.steel : P.steelDeep;

  canvas.capsule(limb.hip[0], limb.hip[1], limb.knee[0], limb.knee[1], T.thigh, plate);
  canvas.capsule(limb.knee[0], limb.knee[1], limb.ankle[0], limb.ankle[1], T.shin, plate);

  // The knee break.
  //
  // An extended leg puts thigh and shin in line and the two capsules render as
  // one uniform tube — a plank, which reads longer and slower than the leg is.
  // A hard joint mark restores the two-segment read exactly when the leg is
  // straightest, which on this character is the contact frame of DEVOURING HEEL.
  const [kx, ky] = unit(limb.knee, limb.ankle);
  canvas.line(
    limb.knee[0] + ky * 4.2, limb.knee[1] - kx * 4.2,
    limb.knee[0] - ky * 4.2, limb.knee[1] + kx * 4.2,
    P.ink,
  );
  canvas.disc(limb.knee[0], limb.knee[1], 3.4, trim);
  canvas.set(limb.knee[0] + 1, limb.knee[1] - 1, front ? P.armourLit : P.armour);

  // Sabaton, built along the shin. The heel is deliberately as long as the toe:
  // DEVOURING HEEL strikes with the back of the foot and that surface has to
  // exist in the drawing, not only in the contact marker.
  const toe = [limb.ankle[0] - ky * BONES.foot, limb.ankle[1] + kx * BONES.foot];
  const heel = [limb.ankle[0] + ky * 4, limb.ankle[1] - kx * 4];
  canvas.capsule(heel[0], heel[1], toe[0], toe[1], 3.4, plate);
  canvas.capsule(limb.ankle[0], limb.ankle[1], toe[0], toe[1], 2, trim);
  canvas.set(heel[0], heel[1], front ? P.steelLit : P.steel);
}

function drawHips(canvas, pose) {
  const [wx, wy] = pose.waist;
  const fold = folded(pose);
  canvas.polygon([
    fold(wx - 8, wy + 1), fold(wx + 9, wy + 1),
    fold(wx + 8, wy + 11), fold(wx - 7, wy + 11),
  ], P.armourDeep);
  canvas.polygon([
    fold(wx + 3, wy + 2), fold(wx + 9, wy + 2),
    fold(wx + 8, wy + 12), fold(wx + 3, wy + 10),
  ], P.armour);
  canvas.line(wx - 7, wy + 4, wx + 7, wy + 4, P.steelDeep);
}

function drawTorso(canvas, pose) {
  const [wx, wy] = pose.waist;
  const [nx, ny] = pose.neck;
  const rageOn = pose.rage === true;
  canvas.capsule(wx, wy, nx, ny, T.torso, P.armourDeep);
  const dx = (nx - wx) / 4;

  // Breastplate, cut back over the rear shoulder so the armour reads asymmetric
  // and the chest stays the widest thing in the silhouette.
  canvas.polygon([
    [nx - 7 + dx, ny + 1], [nx + 9, ny],
    [wx + 8, wy - 1], [wx - 4, wy], [wx - 7, wy - 9],
  ], P.armour);
  canvas.polygon([
    [nx + 2, ny], [nx + 9, ny], [wx + 8, wy - 2], [wx + 3, wy - 1],
  ], P.armourLit);
  canvas.polygon([
    [nx - 7 + dx, ny + 2], [nx - 2, ny + 3], [wx - 5, wy - 1], [wx - 7, wy - 8],
  ], P.armourDeep);

  // Battle damage: two notches bitten out of the plate edge, then the rage
  // cracks running through them. The notches are permanent; only the glow moves.
  canvas.set(nx + 8, ny + 4, P.ink);
  canvas.set(nx + 8, ny + 5, P.ink);
  canvas.set(wx + 7, wy - 5, P.ink);

  const cx = Math.round(nx + 1);
  const cy = Math.round(ny + 8);
  crack(canvas, cx - 3, cy - 4, 1, 1, 6, rageOn);
  crack(canvas, cx + 3, cy - 1, -1, 1, 5, rageOn);
  crack(canvas, cx - 1, cy + 4, 1, 1, 4, rageOn);
  canvas.set(cx, cy, rageOn ? P.rageCore : P.rageHot);

  canvas.rect(wx - 7, wy - 3, 15, 3, P.ink);
  canvas.set(wx + 1, wy - 2, rageOn ? P.rageHot : P.rageDeep);
}

/**
 * The head: a hard half-guard over the jaw, an open brow, one burning eye.
 *
 * Aggressive but not a formless demon — the face stays readable as a face. The
 * eye is the facing anchor: it is the hottest cluster on the head and it always
 * points the way VORGH is attacking, so even at sixteen pixels tall the
 * direction of a strike is never ambiguous.
 */
function drawHead(canvas, pose) {
  const [hx, hy] = pose.head;
  const [nx, ny] = pose.neck;
  const rageOn = pose.rage === true;

  // A dark neck shaft under the skull, so the head never fuses into the chest
  // plate in a leaned or near-horizontal pose — which is where every one of
  // this character's contact frames lives.
  canvas.capsule(nx, ny, hx, hy, 3.6, P.ink);
  canvas.capsule(nx, ny, hx, hy, 2.2, P.skinShade);

  canvas.ellipse(hx, hy, 7.4, 8.4, P.ink);
  canvas.ellipse(hx, hy, 6.2, 7.2, P.skin);
  canvas.polygon([
    [hx - 7, hy - 2], [hx - 1, hy + 6], [hx - 7, hy + 6],
  ], P.skinShade);

  // Brow and jaw guard: dark steel above and below, bare face between them.
  canvas.polygon([
    [hx - 7, hy - 4], [hx + 4, hy - 6], [hx + 6, hy - 2], [hx - 6, hy - 1],
  ], P.steelDeep);
  canvas.polygon([
    [hx - 5, hy - 4], [hx + 3, hy - 5], [hx + 5, hy - 3], [hx - 4, hy - 2],
  ], P.steel);
  canvas.polygon([
    [hx - 4, hy + 4], [hx + 5, hy + 3], [hx + 4, hy + 7], [hx - 3, hy + 7],
  ], P.steelDeep);
  canvas.line(hx - 3, hy + 5, hx + 4, hy + 4, P.steel);

  // The eye.
  canvas.set(hx + 3, hy, rageOn ? P.rageCore : P.rageHot);
  canvas.set(hx + 4, hy, rageOn ? P.rageHot : P.rage);
  canvas.set(hx + 3, hy + 1, rageOn ? P.rageHot : P.rageDeep);
  canvas.set(hx + 1, hy, P.ink);
}
