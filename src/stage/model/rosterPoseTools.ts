import { Euler, Quaternion } from 'three';
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

const scratchEuler = new Euler();
const scratchQuaternion = new Quaternion();

/** Add an animation rotation in the joint's parent space. */
export function turnJoint(
  joints: HumanoidJoints,
  name: HumanoidJointName,
  x: number,
  y: number,
  z: number,
): void {
  const bone = joints[name];
  if (bone === null || (x === 0 && y === 0 && z === 0)) return;
  scratchEuler.set(x, y, z);
  scratchQuaternion.setFromEuler(scratchEuler);
  bone.quaternion.premultiply(scratchQuaternion);
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
