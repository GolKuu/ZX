import type { FighterSnapshot } from '@/src/sim';
import { spriteAnimationFrame } from '../combatAnimationProgress';
import { photoAttackKind } from './photoKickAnimation';

export const PHOTO_COLUMNS = 4;
export const PHOTO_ROWS = 4;

export function photoFrameFor(
  fighter: FighterSnapshot,
  elapsedTime: number,
): number {
  if (fighter.knockdownFrames > 0) {
    return frame(2, 3);
  }
  if (fighter.hitstun > 0) {
    return frame(1, 3);
  }
  if (!fighter.grounded) {
    return frame(1, 2);
  }
  if (fighter.guarding || fighter.crouching) {
    return frame(1, fighter.crouching ? 1 : 0);
  }
  if (fighter.dashFrames > 0) {
    return WALK_FRAMES[
      Math.abs(12 - fighter.dashFrames) % WALK_FRAMES.length
    ] ?? IDLE;
  }
  if (fighter.action !== null) {
    const animationFrame = spriteAnimationFrame(
      fighter.action.moveId,
      fighter.action.frame,
    );
    const sequence = photoAttackSequence(fighter.action.moveId);
    return sequence[animationFrame] ?? IDLE;
  }
  if (Math.abs(fighter.velocity.x) > 16) {
    return WALK_FRAMES[
      Math.floor(elapsedTime * 9) % WALK_FRAMES.length
    ] ?? IDLE;
  }
  // A motionless fighter holds the authored neutral silhouette. Cycling the
  // six unrelated source poses here made idle look like a broken dance.
  return frame(0, 0);
}

function frame(row: number, column: number): number {
  return row * PHOTO_COLUMNS + column;
}

const IDLE = frame(0, 0);
const WALK_FRAMES = [frame(0, 2), frame(0, 3), frame(0, 2), IDLE];
const HAND_WINDUP = frame(2, 0);
const LEAD_HAND_CONTACT = frame(2, 1);
const REAR_HAND_CONTACT = frame(2, 2);
const STANDING_GUARD = frame(1, 0);
const CROUCH_GUARD = frame(1, 1);
const LEG_CHAMBER = frame(1, 2);
const LEAD_LEG_CONTACT = frame(3, 0);
const REAR_LEG_CONTACT = frame(3, 1);

const ATTACK_SEQUENCES = {
  jab: [IDLE, HAND_WINDUP, HAND_WINDUP, LEAD_HAND_CONTACT, LEAD_HAND_CONTACT, LEAD_HAND_CONTACT, HAND_WINDUP, HAND_WINDUP, IDLE],
  heavy: [IDLE, STANDING_GUARD, HAND_WINDUP, REAR_HAND_CONTACT, REAR_HAND_CONTACT, REAR_HAND_CONTACT, HAND_WINDUP, STANDING_GUARD, IDLE],
  kick: [IDLE, CROUCH_GUARD, LEG_CHAMBER, LEAD_LEG_CONTACT, LEAD_LEG_CONTACT, LEAD_LEG_CONTACT, LEG_CHAMBER, CROUCH_GUARD, IDLE],
  highKick: [IDLE, STANDING_GUARD, LEG_CHAMBER, REAR_LEG_CONTACT, REAR_LEG_CONTACT, REAR_LEG_CONTACT, LEG_CHAMBER, STANDING_GUARD, IDLE],
  sweep: [IDLE, frame(1, 1), frame(2, 3), frame(2, 3), frame(2, 3), frame(2, 3), frame(1, 1), frame(1, 1), IDLE],
  uppercut: [IDLE, frame(1, 1), frame(3, 2), frame(3, 2), frame(3, 2), frame(3, 2), frame(1, 0), frame(1, 0), IDLE],
} as const;

export function photoAttackSequence(moveId: string): readonly number[] {
  return ATTACK_SEQUENCES[photoAttackKind(moveId)];
}
