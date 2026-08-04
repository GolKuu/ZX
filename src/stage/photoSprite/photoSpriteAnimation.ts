import type { FighterSnapshot } from '../../sim/index.js';
import { spriteAnimationFrame } from '../combatAnimationProgress.js';
import { photoAttackSequence } from './photoAttackSequences.js';
import { photoFallFrame } from './photoFallAnimation.js';

export const PHOTO_COLUMNS = 4;
export const PHOTO_ROWS = 4;

export function photoFrameFor(
  fighter: FighterSnapshot,
  elapsedTime: number,
  defeatFrames = 0,
): number {
  const falling = photoFallFrame(fighter, defeatFrames);
  if (falling !== null) return falling;
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
