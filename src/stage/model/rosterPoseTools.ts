import { turnJointInCharacterSpace } from './boneSpace.js';
import type { HumanoidJointName, HumanoidJoints } from './humanoidBones.js';

export interface PoseRest {
  readonly hipsHeight: number;
}

export type RosterAttackPose = (
  joints: HumanoidJoints,
  rest: PoseRest,
  windup: number,
  strike: number,
  settle: number,
) => void;

/** Add an animation rotation in character space. See `boneSpace.ts`. */
export function turnJoint(
  joints: HumanoidJoints,
  name: HumanoidJointName,
  x: number,
  y: number,
  z: number,
): void {
  turnJointInCharacterSpace(joints, name, x, y, z);
}

export function liftHips(
  joints: HumanoidJoints,
  rest: PoseRest,
  offset: number,
): void {
  const hips = joints.hips;
  if (hips !== null) hips.position.y = rest.hipsHeight + offset;
}

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function smooth01(value: number): number {
  const clamped = clamp01(value);
  return clamped * clamped * (3 - 2 * clamped);
}
