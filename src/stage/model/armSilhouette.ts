import { Euler, Quaternion, type Bone } from 'three';
import { mirrorDepthDelta, rotateInCharacterSpace } from './boneSpace';
import {
  type HumanoidJointName,
  type HumanoidJoints,
} from './humanoidBones';

const ARM_JOINTS: readonly HumanoidJointName[] = [
  'shoulderL',
  'upperArmL',
  'forearmL',
  'handL',
  'shoulderR',
  'upperArmR',
  'forearmR',
  'handR',
];

const SHOULDERS: readonly HumanoidJointName[] = ['shoulderL', 'shoulderR'];
const CAMERA_BIAS = 0.14;

const scratchEuler = new Euler();
const scratchBias = new Quaternion();

/**
 * Keeps both arm chains on the camera side of the torso.
 *
 * The second fighter is turned 180° as one group. Without this correction the
 * same local arm pose also flips behind the body. Mirroring only the arm
 * rotation deltas preserves the attack silhouette while the small shoulder
 * bias gives elbows and hands enough depth separation to remain readable.
 */
export function applyArmSilhouette(
  joints: HumanoidJoints,
  restRotations: ReadonlyMap<Bone, Quaternion>,
  facing: -1 | 1,
): void {
  if (facing === -1) {
    for (const name of ARM_JOINTS) {
      const bone = joints[name];
      if (bone === null) continue;
      const rest = restRotations.get(bone);
      if (rest === undefined) continue;
      mirrorDepthDelta(bone, rest);
    }
  }

  scratchEuler.set(-CAMERA_BIAS * facing, 0, 0);
  scratchBias.setFromEuler(scratchEuler);
  for (const name of SHOULDERS) {
    const bone = joints[name];
    if (bone !== null) rotateInCharacterSpace(bone, scratchBias);
  }
}
