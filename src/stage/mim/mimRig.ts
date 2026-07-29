import type { RefObject } from 'react';
import type { Group } from 'three';

export interface MimRig {
  readonly root: Group;
  readonly torso: Group;
  readonly head: Group;
  readonly leftArm: Group;
  readonly rightArm: Group;
  readonly leftLeg: Group;
  readonly rightLeg: Group;
  readonly scarf: Group;
  readonly cursor: Group;
  readonly banana: Group;
  readonly chair: Group;
  readonly snap: Group;
}

export type MimRigRefs = {
  readonly [Key in keyof MimRig]: RefObject<Group | null>;
};

export function readMimRig(refs: MimRigRefs): MimRig | null {
  const entries = Object.entries(refs) as Array<
    [keyof MimRig, RefObject<Group | null>]
  >;
  const values = {} as Record<keyof MimRig, Group>;
  for (const [key, ref] of entries) {
    if (ref.current === null) return null;
    values[key] = ref.current;
  }
  return values;
}

export function resetMimRig(rig: MimRig, time: number): void {
  const breath = Math.sin(time * 2.2) * 0.018;
  setPosition(rig.root, 0, breath, 0);
  setRotation(rig.root, 0, 0, Math.sin(time * 1.2) * 0.012);
  setPosition(rig.torso, 0, 1.4, 0);
  setPosition(rig.head, 0, 2.25, 0);
  setPosition(rig.leftArm, -0.39, 1.72, 0);
  setPosition(rig.rightArm, 0.39, 1.72, 0);
  setPosition(rig.leftLeg, -0.19, 0.78, 0);
  setPosition(rig.rightLeg, 0.19, 0.78, 0);
  setPosition(rig.scarf, 0, 2.04, -0.08);
  setRotation(rig.torso, 0, 0, 0);
  setRotation(rig.head, 0, 0, 0);
  setRotation(rig.leftArm, 0.03, 0, 0.24);
  setRotation(rig.rightArm, -0.03, 0, -0.24);
  setRotation(rig.leftLeg, -0.05, 0, 0.1);
  setRotation(rig.rightLeg, 0.05, 0, -0.1);
  setRotation(rig.scarf, 0, 0, 0);
  rig.scarf.scale.set(1, 1, 1);
  hideProps(rig);
}

function hideProps(rig: MimRig): void {
  for (const prop of [rig.cursor, rig.banana, rig.chair, rig.snap]) {
    prop.visible = false;
    prop.position.set(0, 0, 0);
    prop.rotation.set(0, 0, 0);
    prop.scale.set(1, 1, 1);
  }
}

function setPosition(
  group: Group,
  x: number,
  y: number,
  z: number,
): void {
  group.position.set(x, y, z);
}

function setRotation(
  group: Group,
  x: number,
  y: number,
  z: number,
): void {
  group.rotation.set(x, y, z);
}
