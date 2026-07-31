import type { MoveFrameData } from '../../sim/frame-data.js';
import { luckyMove } from './moveBuilder.js';

export const LUCKY_SUPER_IDS = {
  winningStreak: 'lucky.super.winning-streak',
  houseAdvantage: 'lucky.super.house-advantage',
  impossibleOutcome: 'lucky.ultimate.impossible-outcome',
} as const;

export type LuckySuperKind = keyof typeof LUCKY_SUPER_IDS;

export const LUCKY_CINEMATIC_FRAMES: Readonly<Record<LuckySuperKind, number>> = {
  winningStreak: 170,
  houseAdvantage: 180,
  impossibleOutcome: 240,
};

export const LUCKY_SUPER_MOVES: readonly MoveFrameData[] = [
  cinematic(LUCKY_SUPER_IDS.winningStreak, 14, 5, 151, 220),
  cinematic(LUCKY_SUPER_IDS.houseAdvantage, 18, 6, 156, 180),
  cinematic(LUCKY_SUPER_IDS.impossibleOutcome, 16, 5, 219, 420),
];

export function luckySuperCostForMove(moveId: string): number | null {
  if (moveId === LUCKY_SUPER_IDS.winningStreak) return 34;
  if (moveId === LUCKY_SUPER_IDS.houseAdvantage) return 100;
  return null;
}

export function luckySuperKindForMove(moveId: string): LuckySuperKind | null {
  for (const [kind, id] of Object.entries(LUCKY_SUPER_IDS)) {
    if (id === moveId) return kind as LuckySuperKind;
  }
  return null;
}

function cinematic(
  id: string,
  startup: number,
  active: number,
  recovery: number,
  damage: number,
): MoveFrameData {
  const move = luckyMove({
    id,
    startup,
    active,
    recovery,
    damage,
    level: 'mid',
    reach: 1.08,
    height: 1.08,
    launch: true,
  });
  return {
    ...move,
    wallPiercing: true,
    hitboxes: move.hitboxes.map((hitbox) => ({
      ...hitbox,
      hit: { ...hitbox.hit, block: undefined },
    })),
  };
}
