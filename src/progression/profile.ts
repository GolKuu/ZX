import type { CharacterId } from '../data/characterRoster.js';
import type { ProgressionProfile, TokenTransaction, TransactionType } from './types.js';

const FIGHTERS: readonly CharacterId[] = ['mim', 'glitch', 'lucky', 'titan', 'vorgh'];
const emptyLists = (): Record<CharacterId, readonly string[]> => ({ mim: [], glitch: [], lucky: [], titan: [], vorgh: [] });
const emptyFlags = (): Record<CharacterId, boolean> => ({ mim: false, glitch: false, lucky: false, titan: false, vorgh: false });

export function createProfile(profileId = 'offline-player', now = new Date()): ProgressionProfile {
  return {
    schemaVersion: 3, profileId, tokenBalance: 0, lifetimeEarned: 0, lifetimeSpent: 0,
    transactions: [], completedRewardIds: [], daily: {
      sequence: 0, utcOffsetMinutes: -now.getTimezoneOffset(), suspiciousClock: false, streak: 0, unverifiedClaims: 0,
    }, achievements: {}, purchasedNodes: emptyLists(), loadouts: emptyLists(),
    freeRespecUsed: emptyFlags(), challenges: {}, cosmetics: [], updatedAt: now.toISOString(),
  };
}

export function migrateProfile(value: unknown, now = new Date()): ProgressionProfile {
  const base = createProfile('offline-player', now);
  if (!record(value)) return base;
  const transactionList = Array.isArray(value.transactions) ? value.transactions.filter(validTransaction) : [];
  const balance = Math.max(0, integer(value.tokenBalance));
  const purchased = record(value.purchasedNodes) ? value.purchasedNodes : {};
  const loadouts = record(value.loadouts) ? value.loadouts : {};
  const flags = record(value.freeRespecUsed) ? value.freeRespecUsed : {};
  return {
    ...base, profileId: stringValue(value.profileId, base.profileId), tokenBalance: balance,
    lifetimeEarned: Math.max(balance, integer(value.lifetimeEarned)),
    lifetimeSpent: Math.max(0, integer(value.lifetimeSpent)), transactions: transactionList,
    completedRewardIds: strings(value.completedRewardIds),
    daily: migrateDaily(value.daily, base), achievements: record(value.achievements) ? value.achievements : {},
    purchasedNodes: fighterRecord(purchased), loadouts: fighterRecord(loadouts),
    freeRespecUsed: Object.fromEntries(FIGHTERS.map((id) => [id, flags[id] === true])) as Record<CharacterId, boolean>,
    challenges: record(value.challenges) ? value.challenges : {}, cosmetics: strings(value.cosmetics),
    updatedAt: stringValue(value.updatedAt, now.toISOString()),
  } as ProgressionProfile;
}

export function transact(profile: ProgressionProfile, input: {
  readonly type: TransactionType; readonly amount: number; readonly sourceId: string;
  readonly idempotencyKey: string; readonly now?: Date;
}): ProgressionProfile {
  if (!Number.isSafeInteger(input.amount) || input.amount === 0) throw new Error('INVALID_AMOUNT');
  if (profile.transactions.some((entry) => entry.idempotencyKey === input.idempotencyKey)) return profile;
  const after = profile.tokenBalance + input.amount;
  if (after < 0) throw new Error('INSUFFICIENT_TOKENS');
  const now = input.now ?? new Date();
  const transaction: TokenTransaction = {
    id: `${profile.profileId}:${profile.transactions.length + 1}:${input.idempotencyKey}`,
    profileId: profile.profileId, timestamp: now.toISOString(), type: input.type,
    amount: input.amount, balanceBefore: profile.tokenBalance, balanceAfter: after,
    sourceId: input.sourceId, idempotencyKey: input.idempotencyKey, version: 1,
  };
  return { ...profile, tokenBalance: after,
    lifetimeEarned: profile.lifetimeEarned + Math.max(0, input.amount),
    lifetimeSpent: profile.lifetimeSpent + Math.max(0, -input.amount),
    transactions: [...profile.transactions, transaction], updatedAt: now.toISOString() };
}

export function validateProfile(profile: ProgressionProfile): readonly string[] {
  const errors: string[] = [];
  if (profile.tokenBalance < 0) errors.push('NEGATIVE_BALANCE');
  if (new Set(profile.transactions.map((entry) => entry.id)).size !== profile.transactions.length) errors.push('DUPLICATE_TRANSACTION_ID');
  if (new Set(profile.transactions.map((entry) => entry.idempotencyKey)).size !== profile.transactions.length) errors.push('DUPLICATE_IDEMPOTENCY_KEY');
  const ledger = profile.transactions.reduce((total, entry) => total + entry.amount, 0);
  if (ledger !== profile.tokenBalance) errors.push('LEDGER_MISMATCH');
  return errors;
}

const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const integer = (value: unknown): number => typeof value === 'number' && Number.isSafeInteger(value) ? value : 0;
const stringValue = (value: unknown, fallback: string): string => typeof value === 'string' ? value : fallback;
const strings = (value: unknown): readonly string[] => Array.isArray(value) ? [...new Set(value.filter((item): item is string => typeof item === 'string'))] : [];
const validTransaction = (value: unknown): value is TokenTransaction => record(value) && typeof value.id === 'string' && typeof value.idempotencyKey === 'string' && typeof value.amount === 'number';
const fighterRecord = (raw: Record<string, unknown>): Record<CharacterId, readonly string[]> => Object.fromEntries(FIGHTERS.map((id) => [id, strings(raw[id])])) as Record<CharacterId, readonly string[]>;
const migrateDaily = (value: unknown, base: ProgressionProfile): ProgressionProfile['daily'] => {
  if (!record(value)) return base.daily;
  return { lastClaimUtc: typeof value.lastClaimUtc === 'string' ? value.lastClaimUtc : undefined,
    periodId: typeof value.periodId === 'string' ? value.periodId : undefined,
    sequence: Math.max(0, integer(value.sequence)), lastTrustedUtc: typeof value.lastTrustedUtc === 'string' ? value.lastTrustedUtc : undefined,
    utcOffsetMinutes: integer(value.utcOffsetMinutes), suspiciousClock: value.suspiciousClock === true,
    streak: Math.max(0, integer(value.streak)), unverifiedClaims: Math.max(0, integer(value.unverifiedClaims)) };
};
