export interface ChallengeDefinition { readonly id: string; readonly cadence: 'daily' | 'weekly'; readonly text: string; readonly event: string; readonly target: number; readonly reward: number; }

export const CHALLENGES: readonly ChallengeDefinition[] = [
  { id:'daily-ai-wins',cadence:'daily',text:'Win two AI matches',event:'MatchWon',target:2,reward:1 },
  { id:'daily-throws',cadence:'daily',text:'Complete three throws',event:'ThrowLanded',target:3,reward:1 },
  { id:'daily-anti-air',cadence:'daily',text:'Perform five anti-airs',event:'AntiAirLanded',target:5,reward:1 },
  { id:'daily-mechanic',cadence:'daily',text:'Use a character mechanic ten times',event:'CharacterMechanicUsed',target:10,reward:1 },
  { id:'daily-training',cadence:'daily',text:'Complete one Training challenge',event:'TrainingChallengeCompleted',target:1,reward:1 },
  { id:'daily-story',cadence:'daily',text:'Finish one Story battle',event:'StoryBattleCompleted',target:1,reward:1 },
  { id:'weekly-roster',cadence:'weekly',text:'Win with three different fighters',event:'UniqueFighterWin',target:3,reward:3 },
  { id:'weekly-learning',cadence:'weekly',text:'Complete five Tutorial or Training objectives',event:'LearningObjectiveCompleted',target:5,reward:3 },
  { id:'weekly-blocks',cadence:'weekly',text:'Perform twenty successful blocks',event:'BlockCompleted',target:20,reward:3 },
  { id:'weekly-character',cadence:'weekly',text:'Complete a character-specific challenge',event:'CharacterChallengeCompleted',target:1,reward:2 },
  { id:'weekly-story',cadence:'weekly',text:'Finish one Story chapter',event:'StoryChapterCompleted',target:1,reward:3 },
];

import { transact } from './profile.js';
import type { GameplayEvent, ProgressionProfile } from './types.js';

export function processChallenges(profile: ProgressionProfile, event: GameplayEvent): ProgressionProfile {
  let next = profile;
  for (const challenge of CHALLENGES.filter((item) => item.event === event.type)) {
    const period = challengePeriod(challenge.cadence, new Date(event.timestamp));
    const stateId = `${challenge.id}:${period}`;
    const prior = next.challenges[stateId] ?? { progress: 0, claimed: false };
    if (prior.claimed) continue;
    const progress = Math.min(challenge.target, prior.progress + Math.max(1, event.value ?? 1));
    next = { ...next, challenges: { ...next.challenges, [stateId]: { progress, claimed: progress >= challenge.target } } };
    if (progress >= challenge.target) next = transact(next, { type:'ChallengeReward', amount:challenge.reward,
      sourceId:stateId, idempotencyKey:`challenge:${stateId}`, now:new Date(event.timestamp) });
  }
  return next;
}

export function challengePeriod(cadence: 'daily' | 'weekly', now: Date): string {
  const day = now.toISOString().slice(0,10); if(cadence==='daily') return day;
  const date = new Date(`${day}T00:00:00.000Z`); const offset=(date.getUTCDay()+6)%7;
  date.setUTCDate(date.getUTCDate()-offset); return date.toISOString().slice(0,10);
}
