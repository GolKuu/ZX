import { transact } from './profile.js';
import type { ProgressionProfile } from './types.js';

export interface GloryTier {
  readonly id: string; readonly xp: number; readonly title: string; readonly tokens: number;
}

export interface GloryStanding {
  readonly level: number; readonly xp: number; readonly wins: number;
  readonly nextTier: GloryTier | null; readonly floorXp: number; readonly progress: number;
}

export interface GloryAward {
  readonly profile: ProgressionProfile; readonly xpGained: number;
  readonly unlocked: readonly GloryTier[];
}

/** Base pay for a win, plus two bounded bonuses so a dominant match is worth more. */
export const GLORY_XP_PER_WIN = 100;
export const GLORY_FLAWLESS_BONUS = 40;
export const GLORY_COMBO_XP_PER_HIT = 5;
export const GLORY_COMBO_XP_CAP = 50;

const tier = (id: string, xp: number, title: string, tokens: number): GloryTier => ({ id, xp, title, tokens });

/** Cumulative XP gates, Brawl Stars trophy road style: every tier pays out once, forever. */
export const GLORY_TIERS: readonly GloryTier[] = [
  tier('glory-1', 100, 'Первый выход', 1),
  tier('glory-2', 250, 'Разогрев', 1),
  tier('glory-3', 500, 'Претендент', 2),
  tier('glory-4', 800, 'Завсегдатай', 2),
  tier('glory-5', 1_200, 'Бронзовый круг', 3),
  tier('glory-6', 1_700, 'Ветеран сети', 3),
  tier('glory-7', 2_300, 'Серебряный круг', 4),
  tier('glory-8', 3_000, 'Дуэлянт', 4),
  tier('glory-9', 4_000, 'Золотой круг', 5),
  tier('glory-10', 5_200, 'Мастер арены', 6),
  tier('glory-11', 6_600, 'Легенда славы', 7),
  tier('glory-12', 8_000, 'Живая геометрия', 10),
];

export function gloryXpForWin(input: { readonly loserRounds: number; readonly maxCombo: number }): number {
  const combo = Math.min(GLORY_COMBO_XP_CAP, Math.max(0, Math.floor(input.maxCombo)) * GLORY_COMBO_XP_PER_HIT);
  return GLORY_XP_PER_WIN + (input.loserRounds === 0 ? GLORY_FLAWLESS_BONUS : 0) + combo;
}

export function gloryStanding(profile: ProgressionProfile): GloryStanding {
  const { xp, wins } = profile.glory;
  const unlocked = GLORY_TIERS.filter((entry) => entry.xp <= xp);
  const nextTier = GLORY_TIERS.find((entry) => entry.xp > xp) ?? null;
  const floorXp = unlocked.length === 0 ? 0 : (unlocked[unlocked.length - 1]?.xp ?? 0);
  const span = (nextTier?.xp ?? floorXp) - floorXp;
  return { level: unlocked.length, xp, wins, nextTier, floorXp,
    progress: span <= 0 ? 1 : Math.min(1, (xp - floorXp) / span) };
}

/**
 * Adds the XP of one online win. `matchId` is the replay guard: a result screen
 * that mounts twice, or a broadcast that arrives twice, must never pay twice.
 */
export function awardGloryWin(profile: ProgressionProfile, input: {
  readonly xp: number; readonly matchId: string; readonly now?: Date;
}): GloryAward {
  const key = `glory-win:${input.matchId}`;
  if (profile.completedRewardIds.includes(key)) return { profile, xpGained: 0, unlocked: [] };
  const xpGained = Math.max(0, Math.floor(input.xp));
  const now = input.now ?? new Date();
  const xp = profile.glory.xp + xpGained;
  let next: ProgressionProfile = {
    ...profile, completedRewardIds: [...profile.completedRewardIds, key],
    glory: { xp, wins: profile.glory.wins + 1 }, updatedAt: now.toISOString(),
  };
  const unlocked = GLORY_TIERS.filter((entry) => entry.xp > profile.glory.xp && entry.xp <= xp);
  for (const entry of unlocked) {
    next = transact(next, { type: 'GloryReward', amount: entry.tokens,
      sourceId: entry.id, idempotencyKey: `glory:${entry.id}`, now });
  }
  return { profile: next, xpGained, unlocked };
}
