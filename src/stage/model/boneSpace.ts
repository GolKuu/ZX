/**
 * Retargeting primitives: how an authored rotation reaches somebody else's rig.
 *
 * The pose tables in this folder are written as if X were forward/back swing,
 * Y twist and Z raise-to-the-side. That is only true in **character space**.
 * Applying the same numbers in a bone's *parent* space — which is what a plain
 * `premultiply` does — means something different in every file: Mixamo's
 * `LeftShoulder` is oriented down the arm, so a "raise" authored as Z rolls the
 * limb around its own length and the arm never moves. That is why a T-posed
 * asset stayed in its T-pose while an A-posed one looked roughly correct.
 *
 * Two things fix it, and both live here:
 *
 *   1. `captureBoneSpace` records each bone's parent orientation *relative to
 *      the model root*, once, from the rest pose. `rotateInCharacterSpace` then
 *      conjugates every authored rotation through it, so the numbers mean the
 *      same thing on every rig.
 *   2. `relaxArm` normalises the incoming rest pose. Vendors ship T-poses and
 *      A-poses interchangeably, and the pose tables are additive, so a rig that
 *      starts with its arms out stays that way. Both arms are dropped to one
 *      canonical hang before anything is captured.
 */

import { Euler, Quaternion, Vector3, type Bone, type Object3D } from 'three';
import type { HumanoidJointName, HumanoidJoints } from './humanoidBones';

/** Parent orientation in character space, captured from the rest pose. */
const PARENT_REST = new WeakMap<Bone, Quaternion>();

/** Canonical hang: how far the upper arm sits out from straight down. */
const ARM_DROP = 0.24;

const scratchEuler = new Euler();
const scratchRotation = new Quaternion();
const scratchBasis = new Quaternion();
const scratchParent = new Quaternion();
const scratchWhole = new Quaternion();
const measured = new Vector3();
const horizontal = new Vector3();
const target = new Vector3();
const chain: Object3D[] = [];

/**
 * Cumulative rotation from the top of the loaded model down to `node`.
 *
 * The walk terminates at whatever has no parent, which during load is the GLB
 * scene root — so "character space" is the model's own space, before the
 * fighter group applies facing.
 */
function characterSpaceRotation(
  node: Object3D | null,
  out: Quaternion,
): Quaternion {
  out.identity();
  if (node === null) return out;
  chain.length = 0;
  for (let step: Object3D | null = node; step !== null; step = step.parent) {
    chain.push(step);
  }
  for (let index = chain.length - 1; index >= 0; index -= 1) {
    const link = chain[index];
    if (link !== undefined) out.multiply(link.quaternion);
  }
  chain.length = 0;
  return out;
}

/**
 * Record the basis for one bone. Call after the rest pose is final — every
 * later lookup assumes the parent chain has not moved since.
 */
export function captureBoneSpace(bone: Bone): void {
  PARENT_REST.set(bone, characterSpaceRotation(bone.parent, new Quaternion()));
}

/**
 * Additive rotation, expressed in character space.
 *
 * `parentLocal = parentRest⁻¹ · rotation · parentRest`, which is the same
 * rotation seen from the bone's parent. Bones with no captured basis fall back
 * to the old parent-space behaviour rather than being skipped.
 */
export function rotateInCharacterSpace(
  bone: Bone,
  rotation: Quaternion,
): void {
  const parentRest = PARENT_REST.get(bone);
  if (parentRest === undefined) {
    bone.quaternion.premultiply(rotation);
    return;
  }
  scratchBasis
    .copy(parentRest)
    .invert()
    .multiply(rotation)
    .multiply(parentRest);
  bone.quaternion.premultiply(scratchBasis);
}

/**
 * Left/right mirror for the fighter facing the other way.
 *
 * The old approach spun the whole group 180°, which pointed the character's
 * back at the camera and then tried to rescue the arms with a second
 * correction. A fighting game mirrors instead: both fighters face the viewer
 * and turn *into* each other.
 *
 * With rotations already in character space the mirror is exact. Reflecting the
 * plane x = 0 maps an authored rotation (x, y, z) to (x, −y, −z), and the joint
 * it drives swaps sides.
 */
let mirrored = false;

const MIRROR_PAIRS: Readonly<Partial<Record<HumanoidJointName, HumanoidJointName>>> = {
  shoulderL: 'shoulderR', shoulderR: 'shoulderL',
  upperArmL: 'upperArmR', upperArmR: 'upperArmL',
  forearmL: 'forearmR', forearmR: 'forearmL',
  handL: 'handR', handR: 'handL',
  thighL: 'thighR', thighR: 'thighL',
  shinL: 'shinR', shinR: 'shinL',
  footL: 'footR', footR: 'footL',
};

export function setPoseMirror(enabled: boolean): void {
  mirrored = enabled;
}

/**
 * The one entry point every pose table goes through. Resolves the joint,
 * applies the mirror when the fighter is facing left, and conjugates the
 * rotation into the bone's parent space.
 */
export function turnJointInCharacterSpace(
  joints: HumanoidJoints,
  name: HumanoidJointName,
  x: number,
  y: number,
  z: number,
): void {
  if (x === 0 && y === 0 && z === 0) return;
  const bone = joints[mirrored ? MIRROR_PAIRS[name] ?? name : name];
  if (bone === null) return;
  scratchEuler.set(x, mirrored ? -y : y, mirrored ? -z : z);
  scratchRotation.setFromEuler(scratchEuler);
  rotateInCharacterSpace(bone, scratchRotation);
}

/**
 * Drop one arm to the canonical hang, in place.
 *
 * The elevation is forced; the azimuth the vendor shipped is kept, so a rig
 * whose arms rest slightly forward stays that way. An arm already hanging is
 * left alone — the correction collapses to identity.
 */
export function relaxArm(upper: Bone | null, child: Bone | null): void {
  if (upper === null || child === null) return;

  characterSpaceRotation(upper.parent, scratchParent);
  scratchWhole.copy(scratchParent).multiply(upper.quaternion);
  measured.copy(child.position).applyQuaternion(scratchWhole);
  if (measured.lengthSq() < 1e-8) return;
  measured.normalize();

  horizontal.set(measured.x, 0, measured.z);
  if (horizontal.lengthSq() < 1e-6) return;
  horizontal.normalize().multiplyScalar(Math.sin(ARM_DROP));
  target.set(horizontal.x, -Math.cos(ARM_DROP), horizontal.z);

  scratchRotation.setFromUnitVectors(measured, target);
  scratchBasis
    .copy(scratchParent)
    .invert()
    .multiply(scratchRotation)
    .multiply(scratchParent);
  upper.quaternion.premultiply(scratchBasis);
}
