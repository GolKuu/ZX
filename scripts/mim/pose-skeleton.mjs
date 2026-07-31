import { BONES, JOINTS, fromCrown } from './rig-spec.mjs';

/**
 * A whole-body pose, solved forward from the hips.
 *
 * Angles are degrees, clockwise, with 0 pointing down the screen — so a leg at
 * 0 hangs straight and a leg at 90 points forward. Solving from a bone table
 * rather than drawing limbs by hand is what keeps limb lengths identical in
 * every panel, which is the failure the brief calls out by name.
 */
export function solve(pose) {
  const hipX = JOINTS.waist[0] + (pose.hipX ?? 0);
  const hipY = fromCrown(50) + (pose.hipY ?? 0);
  const lean = pose.lean ?? 0;

  const waist = [hipX, hipY - 4];
  const neck = project(waist, lean + 180, 26);
  const head = project(neck, lean + 180 + (pose.head ?? 0), BONES.neckToHead);

  const limbs = {};
  for (const side of ['back', 'front']) {
    const shoulder = project(neck, lean + (side === 'front' ? 82 : 98), 3.5);
    const elbow = project(shoulder, pose[`${side}Arm`] ?? 8, BONES.upperArm);
    const wrist = project(elbow, pose[`${side}Forearm`] ?? 12, BONES.forearm);
    const hip = project(waist, lean + (side === 'front' ? 70 : 110), 4);
    const knee = project(hip, pose[`${side}Thigh`] ?? 0, BONES.thigh);
    const ankle = project(knee, pose[`${side}Shin`] ?? 0, BONES.shin);
    limbs[side] = { shoulder, elbow, wrist, hip, knee, ankle };
  }

  return {
    waist,
    neck,
    head,
    hip: [hipX, hipY],
    lean,
    back: limbs.back,
    front: limbs.front,
    braidSweep: pose.braidSweep ?? 0,
    sashSweep: pose.sashSweep ?? 0,
  };
}

function project([x, y], degrees, length) {
  const radians = (degrees * Math.PI) / 180;
  return [x + Math.sin(radians) * length, y + Math.cos(radians) * length];
}

/** Ground the solved pose so the lowest foot sits on the floor row. */
export function planted(solved) {
  const floor = fromCrown(96);
  const lowest = Math.max(solved.back.ankle[1], solved.front.ankle[1]);
  const shift = floor - 5 - lowest;
  if (Math.abs(shift) < 0.5) return solved;
  return shiftPose(solved, 0, shift);
}

export function shiftPose(solved, dx, dy) {
  const move = ([x, y]) => [x + dx, y + dy];
  const limb = (side) => ({
    shoulder: move(side.shoulder),
    elbow: move(side.elbow),
    wrist: move(side.wrist),
    hip: move(side.hip),
    knee: move(side.knee),
    ankle: move(side.ankle),
  });
  return {
    ...solved,
    waist: move(solved.waist),
    neck: move(solved.neck),
    head: move(solved.head),
    hip: move(solved.hip),
    back: limb(solved.back),
    front: limb(solved.front),
  };
}
