import type { FighterSnapshot } from '@/src/sim';
import { spriteAnimationProgress } from '../combatAnimationProgress';

export const PHOTO_COLUMNS = 6;
export const PHOTO_ROWS = 8;

export function photoFrameFor(
  fighter: FighterSnapshot,
  elapsedTime: number,
): number {
  if (fighter.hitstun > 0) {
    return fighter.hitstun > 16 ? frame(6, 3) : frame(3, 2);
  }
  if (!fighter.grounded) {
    return fighter.velocity.y > 10
      ? frame(2, 2)
      : fighter.velocity.y < -10
        ? frame(1, 5)
        : frame(2, 3);
  }
  if (fighter.guarding || fighter.crouching) {
    return frame(fighter.crouching ? 4 : 1, 1);
  }
  if (fighter.dashFrames > 0) {
    return WALK_FRAMES[
      Math.abs(12 - fighter.dashFrames) % WALK_FRAMES.length
    ] ?? IDLE;
  }
  if (fighter.action !== null) {
    const progress = spriteAnimationProgress(
      fighter.action.moveId,
      fighter.action.frame,
    );
    const sequence = attackSequenceFor(fighter.action.moveId);
    return sequence[Math.min(
      sequence.length - 1,
      Math.floor(progress * sequence.length),
    )] ?? IDLE;
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
const WALK_FRAMES = [frame(6, 0), frame(6, 1), frame(6, 2), frame(6, 1)];

const ATTACK_SEQUENCES = {
  jab: [IDLE, frame(0, 2), frame(0, 1), frame(0, 2), IDLE],
  heavy: [IDLE, frame(5, 3), frame(5, 4), frame(5, 3), IDLE],
  kick: [IDLE, frame(2, 2), frame(0, 3), frame(2, 2), IDLE],
  highKick: [IDLE, frame(3, 4), frame(0, 4), frame(3, 4), IDLE],
  sweep: [IDLE, frame(4, 1), frame(0, 5), frame(4, 1), IDLE],
  uppercut: [IDLE, frame(4, 1), frame(5, 0), frame(5, 2), IDLE],
} as const;

function attackSequenceFor(moveId: string): readonly number[] {
  const id = moveId.toLowerCase();
  if (includesAny(id, ['sweep', 'crouch', 'low-vector'])) {
    return ATTACK_SEQUENCES.sweep;
  }
  if (includesAny(id, ['uppercut', 'anti-air', 'launcher'])) {
    return ATTACK_SEQUENCES.uppercut;
  }
  if (includesAny(id, ['axe', 'spin', 'triple-kick', 'butterfly'])) {
    return ATTACK_SEQUENCES.highKick;
  }
  if (includesAny(id, ['kick', 'knee', 'vault', 'wall-dive'])) {
    return ATTACK_SEQUENCES.kick;
  }
  if (includesAny(id, ['jab', 'light', 'elbow', 'strike'])) {
    return ATTACK_SEQUENCES.jab;
  }
  return ATTACK_SEQUENCES.heavy;
}

function includesAny(value: string, needles: readonly string[]): boolean {
  return needles.some((needle) => value.includes(needle));
}
