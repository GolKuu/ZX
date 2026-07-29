/**
 * Skeleton resolution for purchased / downloaded rigged characters.
 *
 * We author no skeletons. The mesh and its rig come from an asset source
 * (Mixamo, Quaternius, a marketplace character); every one of them names bones
 * differently, so the animation layer is written against a *canonical* joint
 * set and this module maps whatever the file happens to contain onto it.
 *
 * That indirection is the whole point: swap the GLB, change nothing else. If a
 * model arrives with a rig this cannot resolve, the fix is one alias entry
 * here, never a change in the animation code.
 */

import type { Bone, Object3D } from 'three';

export const HUMANOID_JOINTS = [
  'hips',
  'spine',
  'chest',
  'neck',
  'head',
  'shoulderL',
  'upperArmL',
  'forearmL',
  'handL',
  'shoulderR',
  'upperArmR',
  'forearmR',
  'handR',
  'thighL',
  'shinL',
  'footL',
  'thighR',
  'shinR',
  'footR',
] as const;

export type HumanoidJointName = (typeof HUMANOID_JOINTS)[number];

export type HumanoidJoints = {
  readonly [Key in HumanoidJointName]: Bone | null;
};

/**
 * Alias lists, most specific first. Names are compared after normalisation, so
 * `mixamorig:LeftUpLeg`, `mixamorigLeftUpLeg` and `Left_Up_Leg` all collapse to
 * `leftupleg` and match the same entry.
 */
const ALIASES: Readonly<Record<HumanoidJointName, readonly string[]>> = {
  hips: ['hips', 'pelvis', 'root', 'bip01pelvis', 'cchips', 'jbipchips'],
  spine: ['spine', 'spine01', 'spine1', 'abdomen', 'waist', 'jbipcspine'],
  chest: ['chest', 'spine2', 'spine02', 'spine03', 'upperchest', 'torso', 'jbipcchest', 'jbipcupperchest'],
  neck: ['neck', 'neck01', 'neck1', 'jbipcneck', 'defneck'],
  head: ['head', 'jbipchead', 'defhead'],

  shoulderL: ['leftshoulder', 'shoulderl', 'lshoulder', 'leftclavicle', 'claviclel', 'jbiplshoulder', 'bip01lclavicle'],
  upperArmL: ['leftarm', 'upperarml', 'larm', 'leftupperarm', 'upperarmleft', 'jbiplupperarm', 'defupperarml', 'bip01lupperarm'],
  forearmL: ['leftforearm', 'forearml', 'lforearm', 'leftlowerarm', 'lowerarml', 'jbipllowerarm', 'defforearml', 'bip01lforearm'],
  handL: ['lefthand', 'handl', 'lhand', 'jbiplhand', 'defhandl', 'bip01lhand'],

  shoulderR: ['rightshoulder', 'shoulderr', 'rshoulder', 'rightclavicle', 'clavicler', 'jbiprshoulder', 'bip01rclavicle'],
  upperArmR: ['rightarm', 'upperarmr', 'rarm', 'rightupperarm', 'upperarmright', 'jbiprupperarm', 'defupperarmr', 'bip01rupperarm'],
  forearmR: ['rightforearm', 'forearmr', 'rforearm', 'rightlowerarm', 'lowerarmr', 'jbiprlowerarm', 'defforearmr', 'bip01rforearm'],
  handR: ['righthand', 'handr', 'rhand', 'jbiprhand', 'defhandr', 'bip01rhand'],

  thighL: ['leftupleg', 'thighl', 'lefthip', 'leftthigh', 'upperlegl', 'lupleg', 'jbiplupperleg', 'defthighl', 'bip01lthigh'],
  shinL: ['leftleg', 'shinl', 'leftknee', 'leftcalf', 'lowerlegl', 'calfl', 'jbipllowerleg', 'defshinl', 'bip01lcalf'],
  footL: ['leftfoot', 'footl', 'lfoot', 'leftankle', 'jbiplfoot', 'deffootl', 'bip01lfoot'],

  thighR: ['rightupleg', 'thighr', 'righthip', 'rightthigh', 'upperlegr', 'rupleg', 'jbiprupperleg', 'defthighr', 'bip01rthigh'],
  shinR: ['rightleg', 'shinr', 'rightknee', 'rightcalf', 'lowerlegr', 'calfr', 'jbiprlowerleg', 'defshinr', 'bip01rcalf'],
  footR: ['rightfoot', 'footr', 'rfoot', 'rightankle', 'jbiprfoot', 'deffootr', 'bip01rfoot'],
};

/**
 * Lowercase, drop the rig prefix and every separator. `mixamorig:LeftUpLeg`
 * becomes `leftupleg`.
 */
function normalise(name: string): string {
  return name
    .toLowerCase()
    .replace(/mixamorig/g, '')
    .replace(/[\s:_.\-|]/g, '');
}

/**
 * Every joint name in the file, normalised. Used by the model checker to print
 * what a rig actually contains when a required joint fails to resolve — the
 * fastest route from "the character does not move" to the one alias that fixes
 * it.
 */
export function listJointNames(root: Object3D): readonly string[] {
  const names: string[] = [];
  root.traverse((object) => {
    if (isBone(object)) names.push(object.name);
  });
  return names;
}

function isBone(object: Object3D): object is Bone {
  return (object as { isBone?: boolean }).isBone === true;
}

/**
 * Walk the loaded scene and bind every canonical joint it can find.
 *
 * Unresolved joints come back as `null` rather than throwing: a model with no
 * separate clavicle bone is perfectly usable, and the animation layer already
 * skips joints it was not given.
 */
export function resolveHumanoidJoints(root: Object3D): HumanoidJoints {
  const bones = new Map<string, Bone>();

  root.traverse((object) => {
    if (!isBone(object)) return;
    const key = normalise(object.name);
    // First match wins. Rigs list bones parent-first, so this prefers
    // `Spine` over a later `Spine1` when both normalise into the same lookup.
    if (!bones.has(key)) bones.set(key, object);
  });

  const resolved: Partial<Record<HumanoidJointName, Bone | null>> = {};

  for (const joint of HUMANOID_JOINTS) {
    let found: Bone | null = null;
    for (const alias of ALIASES[joint]) {
      const bone = bones.get(alias);
      if (bone !== undefined) {
        found = bone;
        break;
      }
    }
    resolved[joint] = found;
  }

  return resolved as HumanoidJoints;
}

/** Joints that must resolve for the model to be animatable at all. */
const REQUIRED: readonly HumanoidJointName[] = [
  'hips',
  'spine',
  'head',
  'upperArmL',
  'upperArmR',
  'thighL',
  'thighR',
];

export interface JointReport {
  readonly usable: boolean;
  readonly missing: readonly HumanoidJointName[];
}

export function reportJoints(joints: HumanoidJoints): JointReport {
  const missing = HUMANOID_JOINTS.filter((joint) => joints[joint] === null);
  const blocking = REQUIRED.filter((joint) => joints[joint] === null);
  return { usable: blocking.length === 0, missing };
}
