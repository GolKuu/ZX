import type { Group } from 'three';
import { MIM_MOVE_IDS } from '@/src/data/mim-moves';
import type { FighterSnapshot } from '@/src/sim';
import { combatAnimationProgress } from '../combatAnimationProgress';
import type { MimRig } from './mimRig';

type AttackAnimation = (
  rig: MimRig,
  progress: number,
  facing: -1 | 1,
) => void;

const ATTACKS: Readonly<Record<string, AttackAnimation>> = {
  [MIM_MOVE_IDS.snap]: animateSnap,
  [MIM_MOVE_IDS.cursor]: animateCursor,
  [MIM_MOVE_IDS.banana]: animateBanana,
  [MIM_MOVE_IDS.chair]: animateChair,
};

export function applyMimCombatAnimation(
  rig: MimRig,
  fighter: FighterSnapshot,
): void {
  rig.scarf.scale.x = fighter.facing;
  rig.scarf.rotation.z += fighter.facing * 0.08;
  if (fighter.action !== null) {
    const animation = ATTACKS[fighter.action.moveId];
    if (animation !== undefined) {
      animation(
        rig,
        combatAnimationProgress(
          fighter.action.moveId,
          fighter.action.frame,
        ),
        fighter.facing,
      );
      return;
    }
  }
  if (fighter.guarding) {
    rig.leftArm.rotation.z = 1.02;
    rig.rightArm.rotation.z = -1.02;
    rig.torso.rotation.x = 0.12;
  } else if (fighter.hitstun > 0) {
    const recoil = Math.min(1, fighter.hitstun / 12);
    rig.torso.rotation.z = fighter.facing * recoil * 0.38;
    rig.head.rotation.z = fighter.facing * recoil * 0.25;
  }
}

function animateSnap(rig: MimRig, progress: number, facing: -1 | 1): void {
  const strike = pulse(progress, 0.43);
  const windup = window(progress, 0, 0.25, 0.44);
  const arm = leadLimb(rig.leftArm, rig.rightArm, facing);
  arm.rotation.z += facing * (windup * 0.45 - strike * 1.25);
  arm.position.x += facing * strike * 0.26;
  rig.torso.rotation.y += facing * strike * 0.24;
  rig.snap.visible = strike > 0.72;
  rig.snap.position.set(facing * 0.78, 1.58, 0.18);
  rig.snap.scale.setScalar(0.6 + strike * 1.1);
}

function animateCursor(rig: MimRig, progress: number, facing: -1 | 1): void {
  const windup = window(progress, 0, 0.3, 0.48);
  const strike = pulse(progress, 0.48);
  const arm = leadLimb(rig.leftArm, rig.rightArm, facing);
  arm.rotation.z -= facing * windup * 1.3;
  rig.torso.rotation.z -= facing * windup * 0.18;
  rig.cursor.visible = progress > 0.17 && progress < 0.84;
  rig.cursor.position.set(
    facing * (0.42 + strike * 0.42),
    2.95 - strike * 1.55,
    0.22,
  );
  rig.cursor.rotation.z = -facing * (0.25 + strike * 0.2);
  rig.cursor.scale.setScalar(0.75 + strike * 0.55);
  rig.root.position.x -= facing * strike * 0.08;
}

function animateBanana(rig: MimRig, progress: number, facing: -1 | 1): void {
  const windup = window(progress, 0.04, 0.3, 0.46);
  const strike = pulse(progress, 0.47);
  const leg = leadLimb(rig.leftLeg, rig.rightLeg, facing);
  leg.rotation.z += facing * (windup * 0.34 - strike * 1.28);
  leg.position.x += facing * strike * 0.34;
  leg.position.y += strike * 0.08;
  rig.torso.rotation.z -= facing * strike * 0.18;
  rig.banana.visible = progress > 0.18 && progress < 0.82;
  rig.banana.position.set(
    facing * (0.5 + strike * 0.7),
    0.27 + strike * 0.05,
    0.18,
  );
  rig.banana.rotation.z = facing * (0.6 - strike * 1.6);
}

function animateChair(rig: MimRig, progress: number, facing: -1 | 1): void {
  const windup = window(progress, 0, 0.26, 0.43);
  const strike = pulse(progress, 0.52);
  const spin = smooth(Math.min(1, progress / 0.7));
  rig.root.rotation.y += facing * spin * Math.PI * 2;
  rig.torso.rotation.z += facing * (windup * 0.28 - strike * 0.18);
  rig.leftArm.rotation.z += windup * 0.8 - strike * 1.05;
  rig.rightArm.rotation.z -= windup * 0.8 - strike * 1.05;
  rig.chair.visible = progress > 0.12 && progress < 0.86;
  rig.chair.position.set(facing * (0.55 + strike * 0.42), 0.9, 0.22);
  rig.chair.rotation.z = -facing * (0.55 + spin * Math.PI * 2);
  rig.chair.scale.setScalar(0.85 + strike * 0.25);
  rig.root.position.x += facing * strike * 0.2;
}

function leadLimb(left: Group, right: Group, facing: -1 | 1): Group {
  return facing === 1 ? right : left;
}

function pulse(value: number, peak: number): number {
  if (value <= peak) return Math.sin((value / peak) * Math.PI * 0.5);
  return Math.cos(
    ((Math.min(1, value) - peak) / Math.max(0.001, 1 - peak))
      * Math.PI
      * 0.5,
  );
}

function window(value: number, start: number, peak: number, end: number) {
  return smoothRange(value, start, peak) * (1 - smoothRange(value, peak, end));
}

function smoothRange(value: number, start: number, end: number): number {
  return smooth(Math.max(0, Math.min(1, (value - start) / (end - start))));
}

function smooth(value: number): number {
  return value * value * (3 - 2 * value);
}
