import type { RefObject } from 'react';
import type { FighterSnapshot } from '@/src/sim';
import type { Group } from 'three';
import { CHRONO_MOVE_IDS } from '@/src/data/chrono-combat-moves';
import { combatAnimationProgress } from '../combatAnimationProgress';

export interface ChronoRigRefs {
  readonly root: RefObject<Group | null>;
  readonly torso: RefObject<Group | null>;
  readonly head: RefObject<Group | null>;
  readonly leftArm: RefObject<Group | null>;
  readonly rightArm: RefObject<Group | null>;
  readonly leftLeg: RefObject<Group | null>;
  readonly rightLeg: RefObject<Group | null>;
  readonly coat: RefObject<Group | null>;
  readonly fragments: RefObject<Group | null>;
  readonly effect: RefObject<Group | null>;
}

export type ChronoRig = { readonly [Key in keyof ChronoRigRefs]: Group };

export function readChronoRig(refs: ChronoRigRefs): ChronoRig | null {
  const entries = Object.entries(refs);
  if (entries.some(([, ref]) => ref.current === null)) return null;
  return Object.fromEntries(
    entries.map(([name, ref]) => [name, ref.current]),
  ) as ChronoRig;
}

export function resetChronoRig(rig: ChronoRig, time: number): void {
  const breath = Math.sin(time * 2.15) * 0.022;
  rig.root.position.set(0, breath, 0);
  rig.root.rotation.set(0, 0, Math.sin(time * 1.1) * 0.012);
  rig.torso.position.set(0, 1.12, 0);
  rig.head.position.set(0, 1.86, 0);
  rig.leftArm.position.set(-0.37, 1.48, 0);
  rig.rightArm.position.set(0.37, 1.48, 0);
  rig.leftLeg.position.set(-0.17, 0.68, 0);
  rig.rightLeg.position.set(0.17, 0.68, 0);
  rig.coat.position.set(0, 0.92, -0.04);
  rig.fragments.position.set(0, 1.42 + breath, 0.04);
  rig.effect.position.set(0.8, 1.14, 0.16);
  rig.effect.scale.setScalar(0.1);

  rig.torso.rotation.set(0, 0, 0);
  rig.head.rotation.set(0, 0, 0);
  rig.leftArm.rotation.set(0, 0, 0.28);
  rig.rightArm.rotation.set(0, 0, -0.28);
  rig.leftLeg.rotation.set(0, 0, 0.05);
  rig.rightLeg.rotation.set(0, 0, -0.05);
  rig.coat.rotation.set(0, 0, Math.sin(time * 1.6) * 0.02);
  rig.fragments.rotation.set(0, 0, time * 0.42);
  rig.effect.rotation.set(0, 0, 0);
  rig.effect.visible = false;
}

export function applyChronoCombatAnimation(
  rig: ChronoRig,
  fighter: FighterSnapshot,
): void {
  if (fighter.health <= 0) {
    applyChronoKnockdown(rig, fighter.facing);
    return;
  }

  if (fighter.guarding) {
    rig.leftArm.rotation.z = 1.05;
    rig.rightArm.rotation.z = -1.05;
    return;
  }
  if (fighter.hitstun > 0) {
    const recoil = Math.min(1, fighter.hitstun / 12);
    rig.torso.rotation.z = fighter.facing * recoil * 0.44;
    rig.head.rotation.z = fighter.facing * recoil * 0.24;
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

  if (action.moveId === CHRONO_MOVE_IDS.lp) {
    arm.position.x += facing * strike * 0.48;
    arm.position.y += strike * 0.1;
    arm.rotation.z -= facing * strike * 1.48;
    supportArm.rotation.z += facing * strike * 0.34;
    rig.root.position.x += facing * strike * 0.18;
    rig.torso.rotation.y += facing * strike * 0.26;
    showClockEffect(rig, facing, strike, 0.76, 1.18, 0.34);
  } else if (action.moveId === CHRONO_MOVE_IDS.hp) {
    arm.position.x += facing * strike * 0.42;
    arm.rotation.z -= facing * strike * 1.24;
    supportArm.rotation.z += facing * strike * 0.7;
    rig.root.position.x += facing * strike * 0.3;
    rig.torso.rotation.y += facing * strike * 0.52;
    rig.coat.rotation.z -= facing * strike * 0.16;
    showClockEffect(rig, facing, strike, 1.16, 1.18, 0.82);
  } else if (action.moveId === CHRONO_MOVE_IDS.lk) {
    rig.root.position.y -= strike * 0.3;
    leg.position.x += facing * strike * 0.5;
    leg.position.y -= strike * 0.12;
    leg.rotation.z -= facing * strike * 1.48;
    supportLeg.rotation.z += facing * strike * 0.18;
    rig.torso.rotation.z += facing * strike * 0.18;
    rig.coat.rotation.z += facing * strike * 0.22;
    showClockEffect(rig, facing, strike, 0.9, 0.34, 0.5);
  } else if (action.moveId === CHRONO_MOVE_IDS.hk) {
    leg.position.x += facing * strike * 0.54;
    leg.position.y += strike * 0.58;
    leg.rotation.z -= facing * strike * 2.28;
    supportLeg.rotation.z += facing * strike * 0.24;
    rig.torso.rotation.z -= facing * strike * 0.34;
    rig.root.rotation.y += facing * strike * 0.76;
    rig.coat.rotation.z -= facing * strike * 0.28;
    showClockEffect(rig, facing, strike, 1.02, 1.32, 0.68);
  }
}

function applyChronoKnockdown(rig: ChronoRig, facing: -1 | 1): void {
  rig.root.rotation.z = 0;
  rig.root.position.y = -0.1;
  rig.torso.rotation.z = facing * 0.34;
  rig.head.rotation.z = facing * 0.42;
  rig.leftArm.rotation.z = -0.92;
  rig.rightArm.rotation.z = 0.92;
  rig.leftLeg.rotation.z = 0.56;
  rig.rightLeg.rotation.z = -0.74;
  rig.coat.rotation.z = facing * 0.18;
  rig.effect.visible = false;
  rig.effect.scale.setScalar(0.08);
  rig.fragments.rotation.z = -facing * 0.08;
}

function showClockEffect(
  rig: ChronoRig,
  facing: -1 | 1,
  strike: number,
  x: number,
  y: number,
  size: number,
): void {
  rig.effect.visible = strike > 0.08;
  rig.effect.position.set(facing * x, y, 0.18);
  rig.effect.rotation.z = facing * strike * Math.PI * 1.3;
  rig.effect.scale.setScalar(size * (0.35 + strike * 0.65));
}
