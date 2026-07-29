import type { FighterInput } from '../sim/state.js';
import type { TelegraphRequest } from './telegraph.js';
import type { AiIntent } from './types.js';

export interface ImmediatePlan {
  readonly kind: 'input';
  readonly input: FighterInput;
  readonly intent: AiIntent;
}

export interface TelegraphPlan {
  readonly kind: 'telegraph';
  readonly request: TelegraphRequest;
}

export type PlannedAction = ImmediatePlan | TelegraphPlan;
