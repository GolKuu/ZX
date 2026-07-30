import { KADE_MOVES } from '@/src/data/combat-moves';
import { IDOL_MOVES } from '@/src/data/idol-combat-moves';
import { ECHO_MOVES } from '@/src/data/echo-combat-moves';
import { CHRONO_MOVES } from '@/src/data/chrono-combat-moves';
import { MIM_MOVES } from '@/src/data/mim-moves';
import { GLITCH_MOVES } from '@/src/data/glitch-combat-moves';
import { totalMoveFrames } from '@/src/sim';

const WINDUP_END = 0.34;
const ACTIVE_END = 0.58;
const FALLBACK_FRAMES = 32;

const MOVES_BY_ID = new Map(
  [
    ...KADE_MOVES,
    ...MIM_MOVES,
    ...IDOL_MOVES,
    ...ECHO_MOVES,
    ...CHRONO_MOVES,
    ...GLITCH_MOVES,
  ].map((move) => [move.id, move]),
);

/**
 * Whether this frame is the one the player reads as the strike.
 *
 * Taken from the frame data rather than from a progress float: the two progress
 * curves above shape time differently — `idolSpriteAnimationProgress` deliberately
 * steps and holds — so a pair of thresholds on the returned number picks out a
 * different span for each, and for IDOL picked out most of the move.
 *
 * Padded a few frames either side because a light jab is active for two frames.
 * Held for 33ms, the drawing reads as a flicker rather than as a punch.
 */
export function isStrikeFrame(moveId: string, frame: number): boolean {
  const move = MOVES_BY_ID.get(moveId);
  if (move === undefined) return false;
  return frame >= move.startup && frame < move.startup + move.active;
}

export function combatAnimationProgress(
  moveId: string,
  frame: number,
): number {
  const move = MOVES_BY_ID.get(moveId);
  if (move === undefined) {
    return smooth(clamp01(frame / FALLBACK_FRAMES));
  }

  const activeStart = move.startup;
  const recoveryStart = move.startup + move.active;
  const total = totalMoveFrames(move);

  if (frame < activeStart) {
    return WINDUP_END * smooth(frame / Math.max(1, activeStart));
  }
  if (frame < recoveryStart) {
    const activeProgress = (frame - activeStart) / Math.max(1, move.active);
    return WINDUP_END + (ACTIVE_END - WINDUP_END) * smooth(activeProgress);
  }

  const recoveryProgress = (
    frame - recoveryStart
  ) / Math.max(1, total - recoveryStart - 1);
  return ACTIVE_END + (1 - ACTIVE_END) * smooth(recoveryProgress);
}

/**
 * IDOL's paper-doll attacks deliberately use a small hand-authored-looking
 * frame set: four anticipation drawings, one held impact drawing, then four
 * recovery drawings before neutral. Simulation timing stays unchanged; long
 * moves simply hold each drawing for more than one 60 Hz tick.
 */
export function spriteAnimationProgress(
  moveId: string,
  frame: number,
): number {
  const move = MOVES_BY_ID.get(moveId);
  if (move === undefined) return combatAnimationProgress(moveId, frame);

  if (frame < move.startup) {
    return WINDUP_END * steppedFrame(frame, move.startup) / 5;
  }
  if (frame < move.startup + move.active) {
    return ACTIVE_END;
  }

  const recoveryFrame = frame - move.startup - move.active;
  return ACTIVE_END
    + (1 - ACTIVE_END) * steppedFrame(recoveryFrame, move.recovery) / 4;
}

/** Returns one of 1, 2, 3, 4 while deliberately excluding both endpoints. */
function steppedFrame(frame: number, duration: number): number {
  const safeDuration = Math.max(1, duration);
  return Math.min(4, Math.floor((Math.max(0, frame) * 4) / safeDuration) + 1);
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function smooth(value: number): number {
  const clamped = clamp01(value);
  return clamped * clamped * (3 - 2 * clamped);
}
