import { ECHO_MOVE_IDS } from '@/src/data/echo-combat-moves';
import type { FighterSnapshot } from '@/src/sim';
import { combatAnimationProgress } from '../combatAnimationProgress';
import type { FighterRig } from '../fighterRig';
import { pulse, setRotation } from '../fighterRig';
import { heldMotion, motionWindow } from './echoMotion';
import { applyEchoSuperAnimation } from './echoSuperAnimation';
import { echoSuperBeat } from './echoSuperTimeline';

type EchoAnimation = (
  rig: FighterRig,
  progress: number,
  facing: -1 | 1,
) => void;

const ANIMATIONS: Readonly<Record<string, EchoAnimation>> = {
  [ECHO_MOVE_IDS.lp]: dataJab,
  [ECHO_MOVE_IDS.hp]: predictionStrike,
  [ECHO_MOVE_IDS.lk]: sweep,
  [ECHO_MOVE_IDS.hk]: forwardKick,
};

export function applyEchoCombatAnimation(
  rig: FighterRig,
  fighter: FighterSnapshot,
): void {
  if (fighter.health <= 0) {
    applyKnockdown(rig, fighter.facing);
    return;
  }

  const action = fighter.action;
  if (action !== null) {
    const beat = echoSuperBeat(action.moveId, action.frame);
    if (beat !== null) {
      applyEchoSuperAnimation(rig, beat, fighter.facing);
      return;
    }
    const animation = ANIMATIONS[action.moveId];
    if (animation !== undefined) {
      animation(
        rig,
        combatAnimationProgress(action.moveId, action.frame),
        fighter.facing,
      );
      return;
    }
  }
  if (fighter.guarding) {
    setRotation(rig.leftArm, 0, 0, 1.05);
    setRotation(rig.rightArm, 0, 0, -1.05);
  } else if (fighter.hitstun > 0) {
    const recoil = Math.min(1, fighter.hitstun / 12);
    setRotation(rig.torso, 0, 0, fighter.facing * recoil * 0.42);
    setRotation(rig.head, 0, 0, fighter.facing * recoil * 0.25);
  }
}

function applyKnockdown(rig: FighterRig, facing: -1 | 1): void {
  setRotation(rig.root, 0, 0, -facing * 0.52);
  setRotation(rig.torso, 0, 0, facing * 0.48);
  setRotation(rig.head, 0, 0, facing * -0.98);
  setRotation(rig.leftLeg, 0, 0, facing * 0.6);
  setRotation(rig.rightLeg, 0, 0, -facing * 0.84);
  setRotation(rig.leftArm, 0, 0, facing * -0.34);
  setRotation(rig.rightArm, 0, 0, facing * 1.08);
  rig.root.position.y = -0.84;
  rig.leftLeg.position.y = 0.4;
  rig.rightLeg.position.y = 0.46;
}

function dataJab(rig: FighterRig, progress: number, facing: -1 | 1): void {
  const load = motionWindow(progress, 0, 0.25, 0.42);
  const strike = pulse(progress, 0.45);
  const arm = facing === 1 ? rig.rightArm : rig.leftArm;
  const support = facing === 1 ? rig.leftArm : rig.rightArm;
  arm.position.x += facing * strike * 0.48;
  arm.position.y += strike * 0.1;
  arm.rotation.z += facing * (load * 0.45 - strike * 1.42);
  support.rotation.z -= facing * load * 0.28;
  rig.torso.rotation.y += facing * strike * 0.28;
  rig.root.position.x += facing * (strike * 0.24 - load * 0.04);
  ringPulse(rig, strike, facing * 0.18);
}

function predictionStrike(
  rig: FighterRig,
  progress: number,
  facing: -1 | 1,
): void {
  const load = motionWindow(progress, 0, 0.31, 0.5);
  const strike = heldMotion(progress, 0.3, 0.54, 0.7, 1);
  const arm = facing === 1 ? rig.rightArm : rig.leftArm;
  const support = facing === 1 ? rig.leftArm : rig.rightArm;
  rig.torso.rotation.y += facing * (load * -0.42 + strike * 0.72);
  rig.torso.rotation.z += facing * (load * -0.25 + strike * 0.16);
  arm.position.x += facing * strike * 0.62;
  arm.position.y += strike * 0.16;
  arm.rotation.z += facing * (load * 0.92 - strike * 1.62);
  support.rotation.z -= facing * (load * 0.54 + strike * 0.35);
  rig.root.position.x += facing * (strike * 0.36 - load * 0.07);
  ringPulse(rig, strike, facing * 0.5);
}

function sweep(rig: FighterRig, progress: number, facing: -1 | 1): void {
  const load = motionWindow(progress, 0, 0.28, 0.46);
  const strike = heldMotion(progress, 0.27, 0.53, 0.7, 1);
  const leg = facing === 1 ? rig.rightLeg : rig.leftLeg;
  const support = facing === 1 ? rig.leftLeg : rig.rightLeg;
  rig.root.position.y -= Math.max(load * 0.22, strike * 0.34);
  rig.torso.rotation.z -= facing * (load * 0.28 + strike * 0.14);
  rig.torso.rotation.y += facing * strike * 0.66;
  leg.position.x += facing * strike * 0.58;
  leg.position.y -= strike * 0.08;
  leg.rotation.z += facing * (load * 0.38 - strike * 1.76);
  support.rotation.z += facing * load * 0.26;
  ringPulse(rig, strike, facing * -0.34);
}

function forwardKick(rig: FighterRig, progress: number, facing: -1 | 1): void {
  const load = motionWindow(progress, 0.02, 0.3, 0.48);
  const strike = heldMotion(progress, 0.29, 0.52, 0.72, 1);
  const leg = facing === 1 ? rig.rightLeg : rig.leftLeg;
  const supportArm = facing === 1 ? rig.leftArm : rig.rightArm;
  leg.position.x += facing * strike * 0.62;
  leg.position.y += strike * 0.32;
  leg.rotation.z += facing * (load * 0.45 - strike * 1.62);
  supportArm.rotation.z += facing * (load * 0.48 - strike * 0.72);
  rig.torso.rotation.z -= facing * strike * 0.22;
  rig.root.position.x += facing * (strike * 0.3 - load * 0.05);
  rig.root.position.y += strike * 0.04;
  ringPulse(rig, strike, facing * 0.42);
}

function ringPulse(rig: FighterRig, amount: number, roll: number): void {
  rig.echoes.scale.setScalar(1 + amount * 0.16);
  rig.echoes.rotation.z += roll * amount;
}

