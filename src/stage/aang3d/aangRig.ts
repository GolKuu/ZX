import type { RefObject } from 'react';
import type { FighterSnapshot } from '@/src/sim';
import type { Group } from 'three';
import { combatAnimationProgress } from '../combatAnimationProgress';
import { elementFromMove } from '@/src/aang/combat/elements';

export interface AangRigRefs {
  readonly root: RefObject<Group | null>;
  readonly torso: RefObject<Group | null>;
  readonly head: RefObject<Group | null>;
  readonly leftArm: RefObject<Group | null>;
  readonly rightArm: RefObject<Group | null>;
  readonly leftLeg: RefObject<Group | null>;
  readonly rightLeg: RefObject<Group | null>;
  readonly staff: RefObject<Group | null>;
  readonly effect: RefObject<Group | null>;
}

export type AangRig = {
  readonly [Key in keyof AangRigRefs]: Group;
};

export function readAangRig(refs: AangRigRefs): AangRig | null {
  const entries = Object.entries(refs);
  if (entries.some(([, ref]) => ref.current === null)) return null;
  return Object.fromEntries(
    entries.map(([name, ref]) => [name, ref.current]),
  ) as AangRig;
}

export function resetAangRig(rig: AangRig, time: number): void {
  rig.root.position.set(0, Math.sin(time * 2.3) * 0.022, 0);
  rig.root.rotation.set(0, 0, Math.sin(time * 1.25) * 0.012);
  rig.torso.position.set(0, 1.08, 0);
  rig.head.position.set(0, 1.78, 0);
  rig.leftArm.position.set(-0.32, 1.39, 0);
  rig.rightArm.position.set(0.32, 1.39, 0);
  rig.leftLeg.position.set(-0.15, 0.66, 0);
  rig.rightLeg.position.set(0.15, 0.66, 0);
  rig.staff.position.set(-0.43, 1.14, -0.14);
  rig.effect.position.set(0.64, 1.22, 0.12);
  rig.effect.scale.setScalar(0.12);
  rig.torso.rotation.set(0, 0, 0);
  rig.head.rotation.set(0, 0, 0);
  rig.leftArm.rotation.set(0, 0, 0.24);
  rig.rightArm.rotation.set(0, 0, -0.24);
  rig.leftLeg.rotation.set(0, 0, 0.04);
  rig.rightLeg.rotation.set(0, 0, -0.04);
  rig.staff.rotation.set(0.05, 0, 0.28);
  rig.effect.rotation.set(0, 0, 0);
  rig.effect.visible = false;
}

export function applyAangCombatAnimation(
  rig: AangRig,
  fighter: FighterSnapshot,
): void {
  if (fighter.guarding) {
    rig.leftArm.rotation.z = 1.05;
    rig.rightArm.rotation.z = -1.05;
    return;
  }
  if (fighter.hitstun > 0) {
    const recoil = Math.min(1, fighter.hitstun / 12);
    rig.torso.rotation.z = fighter.facing * recoil * 0.44;
    rig.head.rotation.z = fighter.facing * recoil * 0.22;
    return;
  }
  const action = fighter.action;
  if (action === null) return;
  const progress = combatAnimationProgress(action.moveId, action.frame);
  const strike = Math.sin(progress * Math.PI);
  const facing = fighter.facing;
  const arm = facing === 1 ? rig.rightArm : rig.leftArm;
  const supportArm = facing === 1 ? rig.leftArm : rig.rightArm;
  const leg = facing === 1 ? rig.rightLeg : rig.leftLeg;
  const supportLeg = facing === 1 ? rig.leftLeg : rig.rightLeg;

  const element = elementFromMove(action.moveId);
  const attack = element === null ? null : action.moveId.slice(element.length + 1);

  if (action.moveId === '5L' || attack === 'lp') {
    arm.position.x += facing * strike * 0.4;
    arm.position.y += strike * 0.12;
    arm.rotation.z -= facing * strike * 1.42;
    supportArm.rotation.z += facing * strike * 0.3;
    rig.torso.rotation.y += facing * strike * 0.28;
    rig.root.position.x += facing * strike * 0.2;
  } else if (action.moveId === '5M' || attack === 'lk') {
    leg.position.x += facing * strike * 0.44;
    leg.position.y += strike * 0.3;
    leg.rotation.z -= facing * strike * 1.72;
    supportLeg.rotation.z += facing * strike * 0.18;
    rig.torso.rotation.z -= facing * strike * 0.2;
    rig.root.position.x += facing * strike * 0.24;
  } else if (action.moveId === '5H' || attack === 'hp') {
    rig.staff.rotation.z -= facing * strike * 2.35;
    arm.rotation.z -= facing * strike * 1.2;
    supportArm.rotation.z += facing * strike * 0.72;
    rig.torso.rotation.y += facing * strike * 0.4;
    rig.root.position.x += facing * strike * 0.32;
  } else if (action.moveId === '2L') {
    rig.root.position.y -= strike * 0.18;
    rig.root.position.x += facing * strike * 0.18;
    arm.position.x += facing * strike * 0.38;
    arm.position.y -= strike * 0.2;
    arm.rotation.z -= facing * strike * 1.15;
  } else if (action.moveId === '2M' || attack === 'hk') {
    rig.root.position.y -= strike * 0.12;
    leg.position.x += facing * strike * 0.46;
    leg.position.y -= strike * 0.08;
    leg.rotation.z -= facing * strike * 1.4;
    supportLeg.rotation.z += facing * strike * 0.2;
    rig.torso.rotation.z -= facing * strike * 0.16;
  } else {
    rig.root.position.x += facing * strike * 0.52;
    arm.position.x += facing * strike * 0.46;
    arm.rotation.z -= facing * strike * 1.55;
    supportArm.rotation.z += facing * strike * 0.7;
    rig.staff.rotation.z -= facing * strike * 1.35;
    rig.torso.rotation.y += facing * strike * 0.48;
  }
}
