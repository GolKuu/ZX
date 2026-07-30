import { ECHO_MOVE_IDS } from '@/src/data/echo-combat-moves';
import type { FighterSnapshot } from '@/src/sim';
import { combatAnimationProgress } from '../combatAnimationProgress';
import type { FighterRig } from '../fighterRig';
import { setRotation } from '../fighterRig';
import {
  adaptiveRoundhouse,
  dataJab,
  habitSweep,
  predictionStrike,
  type EchoNormalAnimation,
} from './echoNormalAnimations';
import { applyEchoSuperAnimation } from './echoSuperAnimation';
import { echoSuperBeat } from './echoSuperTimeline';

const ANIMATIONS: Readonly<Record<string, EchoNormalAnimation>> = {
  [ECHO_MOVE_IDS.lp]: dataJab,
  [ECHO_MOVE_IDS.hp]: predictionStrike,
  [ECHO_MOVE_IDS.lk]: habitSweep,
  [ECHO_MOVE_IDS.hk]: adaptiveRoundhouse,
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
