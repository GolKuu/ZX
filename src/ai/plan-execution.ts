import type { FighterSnapshot } from '../sim/state.js';
import type { ActionController } from './action-controller.js';
import { createDecision } from './decision.js';
import type { PlannedAction } from './planning.js';
import type { AiDecision, AiEvent } from './types.js';

export function executePlan(
  actions: ActionController,
  frame: number,
  self: FighterSnapshot,
  plan: PlannedAction,
  events: AiEvent[],
): AiDecision {
  return plan.kind === 'input'
    ? createDecision(plan.input, plan.intent, null, events)
    : actions.begin(frame, self, plan.request, events);
}
