import type { FighterInput } from '../sim/state.js';
import type {
  AiDecision,
  AiDifficulty,
  AiEvent,
  AiIntent,
} from './types.js';

export function createDecision(
  input: FighterInput,
  intent: AiIntent,
  telegraph: AiDecision['telegraph'],
  events: readonly AiEvent[],
): AiDecision {
  return { input, intent, telegraph, events };
}

export function oppositeDirection(direction: -1 | 1): -1 | 1 {
  return direction === 1 ? -1 : 1;
}

export function createAiSeed(
  fighterId: string,
  difficulty: AiDifficulty,
): number {
  let hash = 2_166_136_261;
  for (const character of `${fighterId}:${difficulty}`) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}
