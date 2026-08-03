import { transact } from './profile.js';
import type { ProgressionProfile } from './types.js';

const BACKWARD_TOLERANCE_MS = 5 * 60 * 1000;
export interface DailyStatus {
  readonly available: boolean; readonly periodId: string; readonly nextResetUtc: string;
  readonly suspiciousClock: boolean; readonly reason?: 'ALREADY_CLAIMED' | 'CLOCK_ROLLBACK';
}

export function dailyPeriod(now: Date, savedOffsetMinutes: number): { readonly id: string; readonly nextResetUtc: string } {
  const shifted = new Date(now.getTime() + savedOffsetMinutes * 60_000);
  const id = shifted.toISOString().slice(0, 10);
  const [year, month, day] = id.split('-').map(Number);
  const next = Date.UTC(year!, month! - 1, day! + 1) - savedOffsetMinutes * 60_000;
  return { id, nextResetUtc: new Date(next).toISOString() };
}

export function dailyStatus(profile: ProgressionProfile, localNow: Date, trustedNow?: Date): DailyStatus {
  const now = trustedNow ?? localNow;
  const lastTrusted = profile.daily.lastTrustedUtc === undefined ? undefined : Date.parse(profile.daily.lastTrustedUtc);
  const rollback = lastTrusted !== undefined && now.getTime() + BACKWARD_TOLERANCE_MS < lastTrusted;
  const period = dailyPeriod(now, profile.daily.utcOffsetMinutes);
  if (rollback) return { available: false, periodId: period.id, nextResetUtc: period.nextResetUtc, suspiciousClock: true, reason: 'CLOCK_ROLLBACK' };
  if (profile.daily.periodId === period.id) return { available: false, periodId: period.id, nextResetUtc: period.nextResetUtc, suspiciousClock: false, reason: 'ALREADY_CLAIMED' };
  return { available: true, periodId: period.id, nextResetUtc: period.nextResetUtc, suspiciousClock: false };
}

export function claimDaily(profile: ProgressionProfile, localNow: Date, trustedNow?: Date): ProgressionProfile {
  const status = dailyStatus(profile, localNow, trustedNow);
  if (!status.available) return status.suspiciousClock === profile.daily.suspiciousClock
    ? profile : { ...profile, daily: { ...profile.daily, suspiciousClock: status.suspiciousClock } };
  const now = trustedNow ?? localNow;
  const priorDay = new Date(now.getTime() - 86_400_000);
  const priorPeriod = dailyPeriod(priorDay, profile.daily.utcOffsetMinutes).id;
  const streak = profile.daily.periodId === priorPeriod ? profile.daily.streak + 1 : 1;
  const cycleDay = ((streak - 1) % 7) + 1;
  const amount = cycleDay === 7 ? 2 : 1;
  const rewarded = transact(profile, { type: 'DailyReward', amount, sourceId: status.periodId,
    idempotencyKey: `daily:${status.periodId}`, now });
  return { ...rewarded, daily: { ...rewarded.daily, lastClaimUtc: now.toISOString(), periodId: status.periodId,
    sequence: profile.daily.sequence + 1, lastTrustedUtc: now.toISOString(), suspiciousClock: false, streak } };
}
