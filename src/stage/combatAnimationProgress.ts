import { KADE_MOVES } from '@/src/data/combat-moves';
import { ROSTER_ADDITION_MOVES } from '@/src/data/roster-moves';
import { AANG_NORMAL_MOVES } from '@/src/data/aang-combat-moves';
import { AANG_SPECIAL_MOVES } from '@/src/data/aang-special-moves';
import { IDOL_MOVES } from '@/src/data/idol-combat-moves';
import { ECHO_MOVES } from '@/src/data/echo-combat-moves';
import { CHRONO_MOVES } from '@/src/data/chrono-combat-moves';
import { MIM_MOVES } from '@/src/data/mim-moves';
import { totalMoveFrames } from '@/src/sim';

const WINDUP_END = 0.34;
const ACTIVE_END = 0.58;
const FALLBACK_FRAMES = 32;

const MOVES_BY_ID = new Map(
  [
    ...KADE_MOVES,
    ...MIM_MOVES,
    ...ROSTER_ADDITION_MOVES,
    ...AANG_NORMAL_MOVES,
    ...AANG_SPECIAL_MOVES,
    ...IDOL_MOVES,
    ...ECHO_MOVES,
    ...CHRONO_MOVES,
  ].map((move) => [move.id, move]),
);

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

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function smooth(value: number): number {
  const clamped = clamp01(value);
  return clamped * clamped * (3 - 2 * clamped);
}
