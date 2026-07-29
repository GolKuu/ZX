import type { FighterInput } from '../sim/state.js';
import type { TelegraphRequest } from './telegraph.js';
import type { AiIntent } from './types.js';

export interface InputPlan {
  readonly kind: 'input';
  readonly input: FighterInput;
  readonly intent: AiIntent;
}

export interface AttackPlan {
  readonly kind: 'attack';
  readonly request: TelegraphRequest;
}

export type TacticalPlan = InputPlan | AttackPlan;
