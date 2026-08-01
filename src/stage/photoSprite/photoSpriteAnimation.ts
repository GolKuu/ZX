import type { FighterSnapshot } from '@/src/sim';
import { spriteAnimationProgress } from '../combatAnimationProgress';

export const PHOTO_COLUMNS = 6;
export const PHOTO_ROWS = 8;

export function photoFrameFor(
  fighter: FighterSnapshot,
  elapsedTime: number,
): number {
  if (fighter.hitstun > 0) {
    return frame(2, Math.floor(elapsedTime * 12) % PHOTO_COLUMNS);
  }
  if (!fighter.grounded) {
    const airborne = fighter.velocity.y > 10 ? 0 : fighter.velocity.y < -10 ? 4 : 2;
    return frame(3, airborne);
  }
  if (fighter.guarding || fighter.crouching) {
    return frame(4, fighter.crouching ? 1 : 4);
  }
  if (fighter.dashFrames > 0) {
    return frame(7, Math.abs(12 - fighter.dashFrames) % PHOTO_COLUMNS);
  }
  if (fighter.action !== null) {
    const row = 1 + stableHash(fighter.action.moveId) % 7;
    const progress = spriteAnimationProgress(
      fighter.action.moveId,
      fighter.action.frame,
    );
    return frame(row, Math.min(PHOTO_COLUMNS - 1, Math.floor(progress * PHOTO_COLUMNS)));
  }
  if (Math.abs(fighter.velocity.x) > 16) {
    return frame(5, Math.floor(elapsedTime * 10) % PHOTO_COLUMNS);
  }
  return frame(0, Math.floor(elapsedTime * 4) % PHOTO_COLUMNS);
}

function frame(row: number, column: number): number {
  return row * PHOTO_COLUMNS + column;
}

function stableHash(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}
