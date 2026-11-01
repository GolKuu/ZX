import type { readCombatFighter } from '@/src/game/combatRuntime';
import { combatAnimationProgress } from '../combatAnimationProgress';
import { applyAttackPose } from './attackPose';
import { attackShapeFor } from './attackShapes';
import { crouchPose, guardPose, hitPose, idleBreath, neutralPose, walkPose } from './fighterPose';

export const WALK_THRESHOLD = 16;
export const WALK_REFERENCE = 65;

/** Authored fallback posture, with reactions and defense above locomotion. */
export function applyFighterPosture(
  pose: ReturnType<typeof neutralPose>,
  fighter: NonNullable<ReturnType<typeof readCombatFighter>>,
  time: number,
): void {
  idleBreath(pose, time);
  if (fighter.hitstun > 0) {
    hitPose(pose, Math.min(1, fighter.hitstun / 18));
    return;
  }
  const action = fighter.action;
  if (action !== null) {
    applyAttackPose(pose, attackShapeFor(action.moveId), combatAnimationProgress(action.moveId, action.frame));
    return;
  }
  if (fighter.guarding) {
    if (fighter.crouching) crouchPose(pose);
    guardPose(pose);
    return;
  }
  if (fighter.crouching) {
    crouchPose(pose);
    return;
  }
  if (!fighter.grounded) {
    pose.leftLeg.hinge += .8;
    pose.rightLeg.pitch -= .5;
    pose.leftArm.pitch -= .4;
    return;
  }
  const speed = Math.abs(fighter.velocity.x);
  if (speed >= WALK_THRESHOLD) walkPose(pose, time, Math.min(1.25, Math.max(.6, speed / WALK_REFERENCE)));
}
