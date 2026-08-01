/**
 * A whole-body pose, solved forward from the hips, for any fighter.
 *
 * This is MIM's rig generalised: the bone table is now an argument rather than a
 * module constant, so a slim acrobat and a two-tonne siege engine can share one
 * solver and one move-sheet renderer while keeping their own proportions.
 *
 * Angles are degrees, clockwise, with 0 pointing down the screen — so a limb at
 * 0 hangs straight, 90 points forward (right, the way every fighter attacks),
 * 180 points straight up and a negative angle points back. `lean` tilts the
 * torso backwards for positive values; `head` is negative when the face turns
 * towards the opponent.
 *
 * Solving from a bone table rather than drawing limbs by hand is what keeps a
 * limb the same length in every panel of the sheet.
 */

/** Distance measured down from the crown, in source pixels. */
export function fromCrown(bones, distance) {
  return bones.origin[1] - bones.crownToFloor + distance;
}

export function solve(pose, bones) {
  const hipX = bones.origin[0] + (pose.hipX ?? 0);
  const hipY = fromCrown(bones, bones.hipHeight) + (pose.hipY ?? 0);
  const lean = pose.lean ?? 0;

  const waist = [hipX, hipY - bones.waistRise];
  const neck = project(waist, lean + 180, bones.torso);
  const head = project(neck, lean + 180 + (pose.head ?? 0), bones.neckToHead);

  const limbs = {};
  for (const side of ['back', 'front']) {
    const forward = side === 'front';
    const shoulder = project(neck, lean + (forward ? 82 : 98), bones.shoulderOffset);
    const elbow = project(shoulder, pose[`${side}Arm`] ?? 8, bones.upperArm);
    const wrist = project(elbow, pose[`${side}Forearm`] ?? 12, bones.forearm);
    const hip = project(waist, lean + (forward ? 70 : 110), bones.hipOffset);
    const knee = project(hip, pose[`${side}Thigh`] ?? 0, bones.thigh);
    const ankle = project(knee, pose[`${side}Shin`] ?? 0, bones.shin);
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

/** Every joint of a solved pose, for measuring one pose against another. */
export function jointList(solved) {
  return [
    solved.head, solved.neck, solved.waist,
    solved.front.shoulder, solved.front.elbow, solved.front.wrist,
    solved.front.hip, solved.front.knee, solved.front.ankle,
    solved.back.shoulder, solved.back.elbow, solved.back.wrist,
    solved.back.hip, solved.back.knee, solved.back.ankle,
  ];
}

/** The lengths a solved pose actually produced, to check against the table. */
export function limbLengths(solved) {
  const span = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  return {
    frontUpperArm: span(solved.front.shoulder, solved.front.elbow),
    frontForearm: span(solved.front.elbow, solved.front.wrist),
    backUpperArm: span(solved.back.shoulder, solved.back.elbow),
    backForearm: span(solved.back.elbow, solved.back.wrist),
    frontThigh: span(solved.front.hip, solved.front.knee),
    frontShin: span(solved.front.knee, solved.front.ankle),
    backThigh: span(solved.back.hip, solved.back.knee),
    backShin: span(solved.back.knee, solved.back.ankle),
  };
}
