import type { RefObject } from 'react';
import type { Group } from 'three';
import { IDOL_MOVE_IDS } from '@/src/data/idol-combat-moves';
import type { FighterSnapshot } from '@/src/sim';
import { combatAnimationProgress } from '../combatAnimationProgress';

export interface IdolRigRefs {
  readonly root: RefObject<Group | null>;
  readonly torso: RefObject<Group | null>;
  readonly head: RefObject<Group | null>;
  readonly leftArm: RefObject<Group | null>;
  readonly rightArm: RefObject<Group | null>;
  readonly leftLeg: RefObject<Group | null>;
  readonly rightLeg: RefObject<Group | null>;
  readonly microphone: RefObject<Group | null>;
  readonly starEffect: RefObject<Group | null>;
}

export type IdolRig = {
  readonly [Key in keyof IdolRigRefs]: Group;
};

export function readIdolRig(refs: IdolRigRefs): IdolRig | null {
  const entries = Object.entries(refs);
  if (entries.some(([, ref]) => ref.current === null)) return null;
  return Object.fromEntries(
    entries.map(([name, ref]) => [name, ref.current]),
  ) as IdolRig;
}

export function resetIdolRig(rig: IdolRig, time: number): void {
  rig.root.position.set(0, Math.sin(time * 2.8) * 0.02, 0);
  rig.root.rotation.set(0, 0, Math.sin(time * 1.45) * 0.014);
  rig.torso.position.set(0, 1.08, 0);
  rig.head.position.set(0, 1.78, 0);
  rig.leftArm.position.set(-0.32, 1.39, 0);
  rig.rightArm.position.set(0.32, 1.39, 0);
  rig.leftLeg.position.set(-0.14, 0.66, 0);
  rig.rightLeg.position.set(0.14, 0.66, 0);
  rig.microphone.position.set(0.08, -0.72, 0.04);
  rig.starEffect.position.set(0.62, 1.22, 0.18);
  rig.torso.rotation.set(0, 0, 0);
  rig.head.rotation.set(0, 0, 0);
  rig.leftArm.rotation.set(0, 0, 0.22);
  rig.rightArm.rotation.set(0, 0, -0.22);
  rig.leftLeg.rotation.set(0, 0, 0.04);
  rig.rightLeg.rotation.set(0, 0, -0.04);
  rig.microphone.rotation.set(0, 0, 0.1);
  rig.microphone.scale.set(1, 1, 1);
  rig.starEffect.rotation.set(0, 0, 0);
  rig.starEffect.scale.setScalar(0.2);
  rig.starEffect.visible = false;
}

export function applyIdolCombatAnimation(
  rig: IdolRig,
  fighter: FighterSnapshot,
): void {
  if (fighter.guarding) {
    rig.leftArm.rotation.z = 1.02;
    rig.rightArm.rotation.z = -1.08;
    rig.microphone.rotation.z = -0.45;
    return;
  }
  if (fighter.hitstun > 0) {
    const recoil = Math.min(1, fighter.hitstun / 12);
    rig.torso.rotation.z = fighter.facing * recoil * 0.42;
    rig.head.rotation.z = fighter.facing * recoil * 0.24;
    return;
  }
  const action = fighter.action;
  if (action === null) return;

  const progress = combatAnimationProgress(action.moveId, action.frame);
  const strike = Math.sin(progress * Math.PI);
  const facing = fighter.facing;

  if (action.moveId === IDOL_MOVE_IDS.lp) {
    microphoneJab(rig, facing, strike);
  } else if (action.moveId === IDOL_MOVE_IDS.hp) {
    starSwing(rig, facing, strike, progress);
  } else if (action.moveId === IDOL_MOVE_IDS.lk) {
    lowSlide(rig, facing, strike);
  } else if (action.moveId === IDOL_MOVE_IDS.hk) {
    performanceSpin(rig, facing, strike, progress);
  }
}

function microphoneJab(rig: IdolRig, facing: -1 | 1, strike: number): void {
  rig.root.position.x += facing * strike * 0.2;
  rig.rightArm.position.x += facing * strike * 0.4;
  rig.rightArm.position.y += strike * 0.1;
  rig.rightArm.rotation.z -= facing * strike * 1.36;
  rig.microphone.rotation.z -= facing * strike * 0.55;
  rig.torso.rotation.y += facing * strike * 0.28;
}

function starSwing(
  rig: IdolRig,
  facing: -1 | 1,
  strike: number,
  progress: number,
): void {
  rig.root.position.x += facing * strike * 0.28;
  rig.rightArm.rotation.z -= facing * strike * 2.25;
  rig.leftArm.rotation.z += facing * strike * 0.58;
  rig.microphone.scale.y = 1 + strike * 1.25;
  rig.microphone.rotation.z -= facing * strike * 1.4;
  rig.torso.rotation.y += facing * strike * 0.6;
  showStar(rig, facing, strike, progress, 1.5);
}

function lowSlide(rig: IdolRig, facing: -1 | 1, strike: number): void {
  const leg = facing === 1 ? rig.rightLeg : rig.leftLeg;
  const support = facing === 1 ? rig.leftLeg : rig.rightLeg;
  rig.root.position.x += facing * strike * 0.42;
  rig.root.position.y -= strike * 0.26;
  leg.position.x += facing * strike * 0.48;
  leg.position.y -= strike * 0.12;
  leg.rotation.z -= facing * strike * 1.5;
  support.rotation.z += facing * strike * 0.2;
  rig.torso.rotation.z -= facing * strike * 0.22;
}

function performanceSpin(
  rig: IdolRig,
  facing: -1 | 1,
  strike: number,
  progress: number,
): void {
  const leg = facing === 1 ? rig.rightLeg : rig.leftLeg;
  rig.root.rotation.y += facing * progress * Math.PI * 2;
  rig.root.position.x += facing * strike * 0.28;
  leg.position.x += facing * strike * 0.54;
  leg.position.y += strike * 0.34;
  leg.rotation.z -= facing * strike * 1.72;
  rig.leftArm.rotation.z += facing * strike * 0.72;
  rig.rightArm.rotation.z -= facing * strike * 0.82;
  showStar(rig, facing, strike, progress, 1.15);
}

function showStar(
  rig: IdolRig,
  facing: -1 | 1,
  strike: number,
  progress: number,
  scale: number,
): void {
  rig.starEffect.visible = true;
  rig.starEffect.position.x = facing * (0.55 + strike * 0.35);
  rig.starEffect.scale.setScalar(Math.max(0.08, strike * scale));
  rig.starEffect.rotation.z = facing * progress * Math.PI * 2;
}
