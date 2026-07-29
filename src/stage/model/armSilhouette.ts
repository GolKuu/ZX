import { Euler, Quaternion } from 'three';
import { rotateInCharacterSpace } from './boneSpace';
import {
  type HumanoidJointName,
  type HumanoidJoints,
} from './humanoidBones';

const SHOULDERS: readonly HumanoidJointName[] = ['shoulderL', 'shoulderR'];
const CAMERA_BIAS = 0.14;

const scratchEuler = new Euler();
const scratchBias = new Quaternion();

/**
 * Rolls both shoulders a few degrees toward the viewer.
 *
 * Fighters are posed side-on to each other but read to a camera in front of
 * them, so elbows and hands sit almost in the torso's own depth plane. The bias
 * buys the arm chain enough separation to stay legible without changing the
 * pose the frame data authored.
 *
 * This used to also mirror every arm delta, because the second fighter was spun
 * 180° and its arms ended up behind its back. Poses are mirrored properly now
 * (`boneSpace.setPoseMirror`), so only the depth bias is left — and it applies
 * to both fighters identically, since a left/right mirror leaves forward alone.
 */
export function applyArmSilhouette(joints: HumanoidJoints): void {
  scratchEuler.set(-CAMERA_BIAS, 0, 0);
  scratchBias.setFromEuler(scratchEuler);
  for (const name of SHOULDERS) {
    const bone = joints[name];
    if (bone !== null) rotateInCharacterSpace(bone, scratchBias);
  }
}
