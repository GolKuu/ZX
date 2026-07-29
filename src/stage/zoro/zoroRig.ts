import type { Group } from 'three';
import type { ZoroStance } from './zoroActions';

export interface ZoroRig {
  readonly root: Group;
  readonly torso: Group;
  readonly head: Group;
  readonly leftArm: Group;
  readonly rightArm: Group;
  readonly leftLeg: Group;
  readonly rightLeg: Group;
  readonly leftSword: Group;
  readonly rightSword: Group;
  readonly mouthSword: Group;
  readonly slash: Group;
  readonly projectile: Group;
  readonly aura: Group;
  readonly echoes: Group;
}

export function resetZoroRig(
  rig: ZoroRig,
  stance: ZoroStance,
  time: number,
): void {
  const breath = Math.sin(time * 2.4) * 0.025;
  setPosition(rig.root, 0, breath, 0);
  setRotation(rig.root, 0, 0, Math.sin(time * 1.35) * 0.012);
  setRotation(rig.torso, 0, 0, 0);
  setRotation(rig.head, 0, 0, 0);
  setRotation(rig.leftLeg, 0, 0, 0.08);
  setRotation(rig.rightLeg, 0, 0, -0.08);
  setRotation(rig.leftArm, 0, 0, stance === 'one' ? -0.76 : 0.2);
  setRotation(rig.rightArm, 0, 0, stance === 'one' ? 0.76 : -0.2);
  setRotation(rig.leftSword, 0, 0, stance === 'one' ? -0.82 : -0.16);
  setRotation(rig.rightSword, 0, 0, stance === 'one' ? 0.82 : 0.16);
  setRotation(rig.mouthSword, 0, 0, Math.PI / 2);
  rig.leftSword.visible = stance === 'three';
  rig.mouthSword.visible = stance === 'three';
  rig.rightSword.visible = true;
  hideEffects(rig);
}

export function hideEffects(rig: ZoroRig): void {
  rig.slash.visible = false;
  rig.projectile.visible = false;
  rig.aura.visible = false;
  rig.echoes.visible = false;
}

export function setRotation(
  group: Group,
  x: number,
  y: number,
  z: number,
): void {
  group.rotation.set(x, y, z);
}

export function setPosition(
  group: Group,
  x: number,
  y: number,
  z: number,
): void {
  group.position.set(x, y, z);
}

export function pulse(value: number, peak = 0.5): number {
  return Math.sin(Math.min(1, value / peak) * Math.PI);
}

export function smooth(value: number): number {
  return value * value * (3 - 2 * value);
}
