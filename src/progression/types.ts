import type { CharacterId } from '../data/characterRoster.js';

export type ProgressionMode = 'story' | 'ai' | 'training' | 'ranked' | 'casual';
export type TransactionType = 'DailyReward' | 'AchievementReward' | 'StoryReward' |
  'ChallengeReward' | 'GloryReward' | 'NodePurchase' | 'RespecRefund' | 'MigrationAdjustment' | 'AdminDebug';
export type AchievementCategory = 'general' | 'combat' | 'story' | 'tutorial' |
  'training' | 'mastery' | 'collection' | 'challenge' | 'secret' | 'longTerm';

export interface TokenTransaction {
  readonly id: string; readonly profileId: string; readonly timestamp: string;
  readonly type: TransactionType; readonly amount: number; readonly balanceBefore: number;
  readonly balanceAfter: number; readonly sourceId: string; readonly idempotencyKey: string;
  readonly version: 1;
}

export interface NodeEffect {
  readonly stat: string; readonly before: string; readonly after: string;
  readonly maxBonusPercent: number;
}

export interface ProgressionNode {
  readonly id: string; readonly fighterId: CharacterId; readonly branchId: string;
  readonly tier: 1 | 2 | 3 | 4; readonly name: string; readonly description: string;
  readonly cost: number; readonly prerequisites: readonly string[];
  readonly exclusions: readonly string[]; readonly capstone: boolean;
  readonly affectedMoves: readonly string[]; readonly effect: NodeEffect;
}

export interface AchievementDefinition {
  readonly id: string; readonly category: AchievementCategory; readonly title: string;
  readonly description: string; readonly hidden: boolean; readonly target: number;
  readonly progressSource: string; readonly tokenReward: number;
  readonly cosmeticRewards: readonly string[]; readonly repeatable: false;
  readonly prerequisiteIds: readonly string[]; readonly version: 1;
}

export interface AchievementState {
  readonly progress: number; readonly completedAt?: string; readonly rewardClaimed: boolean;
  readonly uniqueValues?: readonly string[];
}

export interface ChallengeState { readonly progress: number; readonly claimed: boolean; }

/** Online quick-match standing: earned XP and the wins that produced it. */
export interface GloryState { readonly xp: number; readonly wins: number; }

export interface ProgressionProfile {
  readonly schemaVersion: 3; readonly profileId: string; readonly tokenBalance: number;
  readonly lifetimeEarned: number; readonly lifetimeSpent: number;
  readonly transactions: readonly TokenTransaction[]; readonly completedRewardIds: readonly string[];
  readonly daily: { readonly lastClaimUtc?: string; readonly periodId?: string; readonly sequence: number;
    readonly lastTrustedUtc?: string; readonly utcOffsetMinutes: number; readonly suspiciousClock: boolean;
    readonly streak: number; readonly unverifiedClaims: number; };
  readonly achievements: Readonly<Record<string, AchievementState>>;
  readonly purchasedNodes: Readonly<Record<CharacterId, readonly string[]>>;
  readonly loadouts: Readonly<Record<CharacterId, readonly string[]>>;
  readonly freeRespecUsed: Readonly<Record<CharacterId, boolean>>;
  readonly challenges: Readonly<Record<string, ChallengeState>>;
  readonly glory: GloryState;
  readonly cosmetics: readonly string[]; readonly updatedAt: string;
}

export interface GameplayEvent {
  readonly id: string; readonly type: string; readonly timestamp: string;
  readonly value?: number; readonly characterId?: CharacterId; readonly validMatch?: boolean;
  readonly metadata?: Readonly<Record<string, string | number | boolean>>;
}
