import type { FighterSnapshot } from '@/src/sim';
import { spriteAnimationFrame } from '../combatAnimationProgress';

export const PHOTO_COLUMNS = 4;
export const PHOTO_ROWS = 4;

export function photoFrameFor(
  fighter: FighterSnapshot,
  elapsedTime: number,
): number {
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
    const sequence = attackSequenceFor(fighter.action.moveId);
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

const ATTACK_SEQUENCES = {
  jab: [IDLE, frame(2, 0), frame(2, 0), frame(2, 1), frame(2, 1), frame(2, 1), frame(2, 0), frame(2, 0), IDLE],
  heavy: [IDLE, frame(2, 0), frame(2, 0), frame(2, 2), frame(2, 2), frame(2, 2), frame(2, 0), frame(2, 0), IDLE],
  kick: [IDLE, frame(1, 0), frame(3, 0), frame(3, 0), frame(3, 0), frame(3, 0), frame(1, 0), frame(1, 0), IDLE],
  highKick: [IDLE, frame(1, 0), frame(3, 1), frame(3, 1), frame(3, 1), frame(3, 1), frame(1, 0), frame(1, 0), IDLE],
  sweep: [IDLE, frame(1, 1), frame(2, 3), frame(2, 3), frame(2, 3), frame(2, 3), frame(1, 1), frame(1, 1), IDLE],
  uppercut: [IDLE, frame(1, 1), frame(3, 2), frame(3, 2), frame(3, 2), frame(3, 2), frame(1, 0), frame(1, 0), IDLE],
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
