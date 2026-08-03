import { KADE_MOVES } from '@/src/data/combat-moves';
import { MIM_MOVES } from '@/src/data/mim-moves';
import { MIM_SUPER_MOVES } from '@/src/data/mim-super-moves';
import { TAUNT_MOVES } from '@/src/data/taunt-move';
import { GLITCH_MOVES } from '@/src/data/glitch-combat-moves';
import { GLITCH_SUPER_MOVES } from '@/src/data/glitch-super-moves';
import {
  LUCKY_MOVES,
  LUCKY_SPECIAL_MOVES,
  LUCKY_SUPER_MOVES,
} from '@/src/data/lucky';
import { TITAN_ALL_MOVES } from '@/src/data/titan';
import { totalMoveFrames } from '@/src/sim';
import {
  spriteAttackBeat,
  spriteAttackFrame,
} from './sprite2d/spriteAttackTimeline';

const WINDUP_END = 0.34;
const ACTIVE_END = 0.58;
const FALLBACK_FRAMES = 32;

const MOVES_BY_ID = new Map(
  [
    ...KADE_MOVES,
    ...MIM_MOVES,
    ...MIM_SUPER_MOVES,
    ...TAUNT_MOVES,
    ...GLITCH_MOVES,
    ...GLITCH_SUPER_MOVES,
    ...LUCKY_MOVES,
    ...LUCKY_SPECIAL_MOVES,
    ...LUCKY_SUPER_MOVES,
    ...TITAN_ALL_MOVES,
  ].map((move) => [move.id, move]),
);

/**
 * Whether this frame is the one the player reads as the strike.
 *
 * Taken from the frame data rather than from a progress float: the two progress
 * curves above shape time differently — so a pair of thresholds on the returned
 * number picks out a different span for each move.
 *
 * The clean whole-body drawing is held for the move's active frames. Its
 * duration therefore stays in lockstep with the actual hit, without exposing
 * the simulation hitbox artwork.
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
 * Paper-doll attacks deliberately use a small hand-authored-looking frame set:
 * four anticipation drawings, one held clean impact drawing, then four recovery
 * drawings ending in the guarded fighting stance. Simulation timing stays
 * unchanged; long moves simply hold each drawing for more than one 60 Hz tick.
 */
export function spriteAnimationProgress(
  moveId: string,
  frame: number,
): number {
  const move = MOVES_BY_ID.get(moveId);
  if (move === undefined) return combatAnimationProgress(moveId, frame);
  const beat = spriteAttackBeat(frame, move);
  if (beat.phase === 'approach') return WINDUP_END * beat.amount;
  if (beat.phase === 'strike') return ACTIVE_END;
  return ACTIVE_END + (1 - ACTIVE_END) * (1 - beat.amount);
}

/**
 * Exact paper-doll drawing for the current simulation frame.
 *
 * Unlike a progress float, this preserves all nine authored beats: four
 * anticipation drawings, one impact drawing and four recovery drawings.
 */
export function spriteAnimationFrame(
  moveId: string,
  frame: number,
): number {
  const move = MOVES_BY_ID.get(moveId);
  if (move === undefined) {
    return Math.min(8, Math.floor(combatAnimationProgress(moveId, frame) * 9));
  }
  return spriteAttackFrame(frame, move);
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function smooth(value: number): number {
  const clamped = clamp01(value);
  return clamped * clamped * (3 - 2 * clamped);
}
