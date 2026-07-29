import type { RefObject } from 'react';
import type { FighterSnapshot } from '@/src/sim';
import type { Group } from 'three';
import { combatAnimationProgress } from '../combatAnimationProgress';

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
  rig.effect.visible = progress > 0.12 && progress < 0.74;
  rig.effect.scale.setScalar(0.35 + strike * 0.75);
  rig.effect.rotation.z = progress * Math.PI * 1.6;

  if (action.moveId === '5L') {
    rig.leftArm.rotation.z = 0.24 - strike * 1.5;
    rig.rightArm.rotation.z = -0.24 + strike * 1.5;
  } else if (action.moveId === '5M') {
    rig.torso.rotation.z = -strike * 0.18;
    rig.rightLeg.rotation.z = -0.04 + strike * 1.75;
    rig.effect.position.set(0.72, 0.72, 0.1);
  } else if (action.moveId === '5H') {
    rig.staff.rotation.z = 0.28 - strike * 2.4;
    rig.rightArm.rotation.z = -0.24 + strike * 1.15;
    rig.effect.position.set(0.72, 1.45, 0.1);
  } else if (action.moveId === '2L') {
    rig.root.position.y -= strike * 0.18;
    rig.leftLeg.rotation.z = 0.04 - strike * 1.2;
    rig.effect.position.set(0.62, 0.35, 0.08);
  } else if (action.moveId === '2M') {
    rig.root.position.y -= strike * 0.12;
    rig.rightLeg.rotation.z = -0.04 + strike * 1.38;
    rig.effect.position.set(0.72, 0.28, 0.08);
  } else {
    rig.leftArm.rotation.z = 0.24 - strike * 1.7;
    rig.rightArm.rotation.z = -0.24 + strike * 1.7;
    rig.staff.rotation.z = 0.28 + strike * 1.2;
    rig.effect.position.set(0.78, 1.12, 0.08);
  }
}

export function effectColor(moveId: string): string {
  if (moveId === '5M') return '#ff713f';
  if (moveId === '2L' || moveId === '2M') return '#8acb72';
  if (moveId === '5H') return '#5ecbff';
  if (moveId === 'overtake') return '#fff4c4';
  return '#9ceeff';
}
