import type { MoveFrameData } from '../../sim/frame-data.js';
import { fixed } from '../../sim/math.js';
import { luckyMove } from './moveBuilder.js';
import { LUCKY_SPECIAL_IDS } from './specials.js';

export const LUCKY_SUPER_IDS = {
  winningStreak: 'lucky.super.winning-streak',
  houseAdvantage: 'lucky.super.house-advantage',
  impossibleOutcome: 'lucky.ultimate.impossible-outcome',
} as const;

export const LUCKY_JACKPOT_STREAK_ID = 'lucky.super.winning-streak.jackpot';

export type LuckySuperKind = keyof typeof LUCKY_SUPER_IDS;

export const LUCKY_CINEMATIC_FRAMES: Readonly<Record<LuckySuperKind, number>> = {
  winningStreak: 170,
  houseAdvantage: 180,
  impossibleOutcome: 240,
};

export const LUCKY_SUPER_MOVES: readonly MoveFrameData[] = [
  cinematic(LUCKY_SUPER_IDS.winningStreak, 14, 5, 136, 220),
  cinematic(LUCKY_JACKPOT_STREAK_ID, 12, 8, 123, 320),
  cinematic(LUCKY_SUPER_IDS.houseAdvantage, 18, 3, 149, 180, true),
  cinematic(LUCKY_SUPER_IDS.impossibleOutcome, 16, 7, 195, 420),
];

export function luckySuperCostForMove(moveId: string): number | null {
  if (
    moveId === LUCKY_SUPER_IDS.winningStreak
    || moveId === LUCKY_JACKPOT_STREAK_ID
  ) return 34;
  if (moveId === LUCKY_SUPER_IDS.houseAdvantage) return 100;
  return null;
}

export function luckySuperKindForMove(moveId: string): LuckySuperKind | null {
  if (moveId === LUCKY_JACKPOT_STREAK_ID) return 'winningStreak';
  for (const [kind, id] of Object.entries(LUCKY_SUPER_IDS)) {
    if (id === moveId) return kind as LuckySuperKind;
  }
  return null;
}

function cinematic(
  id: string,
  startup: number,
  strikes: number,
  recovery: number,
  damage: number,
  advantage = false,
): MoveFrameData {
  const gap = 4;
  const active = (strikes - 1) * gap + 3;
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
    status: advantage
      ? {
          id: 'lucky.house-advantage',
          durationFrames: 420,
          recoveryPercent: 78,
          cancelInto: Object.values(LUCKY_SPECIAL_IDS),
        }
      : undefined,
  });
  const source = move.hitboxes[0];
  if (source === undefined) return move;
  return {
    ...move,
    wallPiercing: true,
    hitboxes: Array.from({ length: strikes }, (_, index) => {
      const final = index === strikes - 1;
      const from = startup + index * gap;
      return {
        ...source,
        hitId: `outcome-${index + 1}`,
        frames: { from, toExclusive: from + 2 },
        hit: {
          ...source.hit,
          damage: Math.floor(damage / strikes),
          hitstun: final ? source.hit.hitstun : gap + 2,
          knockback: final ? source.hit.knockback : { x: fixed(0.02), y: 0 },
          block: undefined,
        },
      };
    }),
  };
}
