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
  const breath = Math.sin(time * 1.7) * 0.014;
  rig.root.position.set(0, breath, 0);
  rig.root.rotation.set(0, 0, Math.sin(time * 0.82) * 0.006);
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

  const facing = fighter.facing;
  const arm = facing === 1 ? rig.rightArm : rig.leftArm;
  const supportArm = facing === 1 ? rig.leftArm : rig.rightArm;
  const leg = facing === 1 ? rig.rightLeg : rig.leftLeg;
  const supportLeg = facing === 1 ? rig.leftLeg : rig.rightLeg;
  applyChronoStance(rig, arm, supportArm, facing);

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
  const { anticipation, strike, impact } = attackBeats(progress);

  if (action.moveId === CHRONO_MOVE_IDS.lp) {
    arm.position.x += facing * (-anticipation * 0.12 + strike * 0.46);
    arm.position.y += anticipation * 0.04 + strike * 0.12;
    arm.rotation.z += facing * (anticipation * 0.4 - strike * 0.78);
    rig.root.position.x += facing * (-anticipation * 0.035 + strike * 0.16);
    rig.torso.rotation.y += facing * (-anticipation * 0.12 + strike * 0.2);
    rig.head.rotation.y -= facing * strike * 0.08;
    showClockEffect(rig, facing, impact, 0.8, 1.2, 0.34);
  } else if (action.moveId === CHRONO_MOVE_IDS.hp) {
    arm.position.x += facing * (-anticipation * 0.16 + strike * 0.62);
    arm.position.y += anticipation * 0.08 + strike * 0.13;
    arm.rotation.z += facing * (anticipation * 0.58 - strike * 0.86);
    supportArm.rotation.z += facing * (anticipation * 0.22 + strike * 0.12);
    rig.root.position.x += facing * (-anticipation * 0.08 + strike * 0.31);
    rig.torso.rotation.y += facing * (-anticipation * 0.28 + strike * 0.46);
    rig.head.rotation.y -= facing * strike * 0.18;
    rig.coat.rotation.z -= facing * strike * 0.15;
    showClockEffect(rig, facing, impact, 1.18, 1.2, 0.82);
  } else if (action.moveId === CHRONO_MOVE_IDS.lk) {
    const crouch = Math.max(anticipation * 0.92, strike);
    rig.root.position.x -= facing * anticipation * 0.1;
    rig.root.position.y -= crouch * 0.3;
    leg.position.x += facing * (-anticipation * 0.1 + strike * 0.67);
    leg.position.y -= strike * 0.2;
    leg.rotation.z += facing * (anticipation * 0.34 - strike * 1.54);
    supportLeg.rotation.z += facing * crouch * 0.22;
    supportArm.position.y -= crouch * 0.16;
    supportArm.rotation.z += facing * crouch * 0.42;
    rig.torso.rotation.z += facing * crouch * 0.17;
    rig.coat.rotation.z += facing * strike * 0.2;
    showClockEffect(rig, facing, impact, 0.94, 0.32, 0.5);
  } else if (action.moveId === CHRONO_MOVE_IDS.hk) {
    leg.position.x += facing * (-anticipation * 0.13 + strike * 0.66);
    leg.position.y += anticipation * 0.24 + strike * 0.62;
    leg.rotation.z += facing * (anticipation * 0.56 - strike * 1.52);
    supportLeg.rotation.z += facing * strike * 0.13;
    arm.rotation.z -= facing * (anticipation * 0.18 + strike * 0.22);
    supportArm.rotation.z += facing * strike * 0.24;
    rig.torso.rotation.z -= facing * strike * 0.28;
    rig.root.rotation.y += facing * (anticipation * 0.16 + strike * 0.28);
    rig.coat.rotation.z -= facing * strike * 0.24;
    showClockEffect(rig, facing, impact, 1.08, 1.34, 0.68);
  }
}

function applyChronoStance(
  rig: ChronoRig,
  leadArm: Group,
  rearArm: Group,
  facing: -1 | 1,
): void {
  leadArm.position.x += facing * 0.08;
  leadArm.position.y -= 0.035;
  leadArm.position.z = 0.08;
  leadArm.rotation.y = -facing * 0.12;
  leadArm.rotation.z = -facing * 0.72;

  rearArm.position.x += facing * 0.12;
  rearArm.position.y -= 0.055;
  rearArm.position.z = -0.2;
  rearArm.rotation.y = facing * 0.56;
  rearArm.rotation.z = facing * 0.5;

  rig.torso.rotation.y = facing * 0.055;
  rig.head.rotation.y = -facing * 0.035;
}

function attackBeats(progress: number): {
  readonly anticipation: number;
  readonly strike: number;
  readonly impact: number;
} {
  if (progress < 0.34) {
    return {
      anticipation: smooth(progress / 0.34),
      strike: 0,
      impact: 0,
    };
  }
  if (progress < 0.58) {
    return { anticipation: 0, strike: 1, impact: 1 };
  }
  const recovery = smooth((progress - 0.58) / 0.42);
  return {
    anticipation: 0,
    strike: 1 - recovery,
    impact: Math.max(0, 1 - recovery * 4),
  };
}

function smooth(value: number): number {
  const clamped = Math.max(0, Math.min(1, value));
  return clamped * clamped * (3 - 2 * clamped);
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
  rig.effect.visible = strike > 0.02;
  rig.effect.position.set(facing * x, y, 0.18);
  rig.effect.rotation.z = facing * (1 - strike) * Math.PI * 0.7;
  rig.effect.scale.setScalar(size * (0.52 + (1 - strike) * 0.72));
}
