import { ACHIEVEMENTS } from './achievements.js';
import { transact } from './profile.js';
import type { GameplayEvent, ProgressionProfile } from './types.js';

export interface EventResult { readonly profile: ProgressionProfile; readonly completed: readonly string[]; }

export function processGameplayEvent(profile: ProgressionProfile, event: GameplayEvent): EventResult {
  if (event.validMatch === false || profile.completedRewardIds.includes(`event:${event.id}`)) return { profile, completed: [] };
  let next: ProgressionProfile = { ...profile, completedRewardIds: [...profile.completedRewardIds, `event:${event.id}`] };
  const completed: string[] = [];
  for (const definition of ACHIEVEMENTS.filter((item) => item.progressSource === event.type)) {
    const prior = next.achievements[definition.id] ?? { progress: 0, rewardClaimed: false };
    if (prior.completedAt !== undefined) continue;
    const progress = Math.min(definition.target, prior.progress + Math.max(1, event.value ?? 1));
    const done = progress >= definition.target;
    next = { ...next, achievements: { ...next.achievements, [definition.id]: {
      progress, completedAt: done ? event.timestamp : undefined, rewardClaimed: done,
    } } };
    if (!done) continue;
    next = transact(next, { type: 'AchievementReward', amount: definition.tokenReward,
      sourceId: definition.id, idempotencyKey: `achievement:${definition.id}`, now: new Date(event.timestamp) });
    next = { ...next, cosmetics: [...new Set([...next.cosmetics, ...definition.cosmeticRewards])] };
    completed.push(definition.id);
  }
  return { profile: next, completed };
}

export function gameplayEvent(type: string, id: string, extras: Partial<GameplayEvent> = {}): GameplayEvent {
  return { id, type, timestamp: new Date().toISOString(), validMatch: true, ...extras };
}
