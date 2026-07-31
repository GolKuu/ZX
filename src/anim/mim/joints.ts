import { MIM_POSES, type MimPoseAngles, type MimPoseName } from './poses.generated.js';

export const MIM_JOINT_NAMES = [
  'torso',
  'hips',
  'head',
  'braids',
  'sash',
  'armBackUpper',
  'armBackLower',
  'armFrontUpper',
  'armFrontLower',
  'legBackUpper',
  'legBackLower',
  'legFrontUpper',
  'legFrontLower',
] as const;

export type MimJointName = (typeof MIM_JOINT_NAMES)[number];

/** Local rotation per joint in radians, plus the root offset in source pixels. */
export interface MimJointPose {
  readonly rotations: Readonly<Record<MimJointName, number>>;
  readonly rootX: number;
  readonly rootY: number;
}

/**
 * Absolute angle each part is *drawn* at.
 *
 * The torso and head are drawn pointing up, the braids and sash trail behind.
 * Everything else hangs straight down. Subtracting the rest angle is what turns
 * an authored world angle into the rotation the cut-out actually needs.
 */
const REST: Readonly<Record<MimJointName, number>> = {
  torso: 180,
  hips: 0,
  head: 180,
  braids: 250,
  sash: 245,
  armBackUpper: 0,
  armBackLower: 0,
  armFrontUpper: 0,
  armFrontLower: 0,
  legBackUpper: 0,
  legBackLower: 0,
  legFrontUpper: 0,
  legFrontLower: 0,
};

const RADIANS = Math.PI / 180;

/**
 * Turn authored world angles into the parent-relative rotations the rig needs.
 *
 * Solving the whole chain in one place is what keeps a limb the same length in
 * every pose: nothing downstream is allowed to move a joint, only to turn it.
 */
export function resolveJoints(pose: MimPoseAngles): MimJointPose {
  const torsoWorld = pose.lean;
  const hipsWorld = pose.lean;
  const headWorld = pose.lean + pose.head;

  const rotations: Record<MimJointName, number> = {
    torso: torsoWorld,
    hips: hipsWorld - torsoWorld,
    head: headWorld - torsoWorld,
    braids: pose.braidSweep / RADIANS - headWorld,
    sash: pose.sashSweep / RADIANS - torsoWorld,
    armBackUpper: pose.backArm - torsoWorld,
    armBackLower: pose.backForearm - pose.backArm,
    armFrontUpper: pose.frontArm - torsoWorld,
    armFrontLower: pose.frontForearm - pose.frontArm,
    legBackUpper: pose.backThigh - hipsWorld,
    legBackLower: pose.backShin - pose.backThigh,
    legFrontUpper: pose.frontThigh - hipsWorld,
    legFrontLower: pose.frontShin - pose.frontThigh,
  };

  for (const name of MIM_JOINT_NAMES) {
    rotations[name] = (rotations[name] - restOffset(name)) * RADIANS;
  }
  return { rotations, rootX: pose.hipX, rootY: pose.hipY };
}

function restOffset(name: MimJointName): number {
  // `braids` and `sash` already had their world angle expressed as a sweep from
  // rest, so their rest offset is folded into the expression above.
  return name === 'braids' || name === 'sash' ? 0 : REST[name] - REST[name];
}

export function poseAngles(name: MimPoseName): MimPoseAngles {
  return MIM_POSES[name];
}

/** Linear blend between two authored poses. */
export function blendAngles(
  from: MimPoseAngles,
  to: MimPoseAngles,
  amount: number,
): MimPoseAngles {
  const mix = (a: number, b: number) => a + (b - a) * amount;
  return {
    lean: mix(from.lean, to.lean),
    head: mix(from.head, to.head),
    hipX: mix(from.hipX, to.hipX),
    hipY: mix(from.hipY, to.hipY),
    frontArm: mix(from.frontArm, to.frontArm),
    frontForearm: mix(from.frontForearm, to.frontForearm),
    backArm: mix(from.backArm, to.backArm),
    backForearm: mix(from.backForearm, to.backForearm),
    frontThigh: mix(from.frontThigh, to.frontThigh),
    frontShin: mix(from.frontShin, to.frontShin),
    backThigh: mix(from.backThigh, to.backThigh),
    backShin: mix(from.backShin, to.backShin),
    braidSweep: mix(from.braidSweep, to.braidSweep),
    sashSweep: mix(from.sashSweep, to.sashSweep),
  };
}
