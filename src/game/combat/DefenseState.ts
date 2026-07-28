import { balanceConfig } from '../config/balanceConfig';
import type {
  DefenseEffect,
  DefenseTimingFeedback,
  FighterSnapshot,
} from '../core/types';

export function setDefenseFeedback(
  fighter: FighterSnapshot,
  feedback: DefenseTimingFeedback,
) {
  fighter.defense.feedback = feedback;
  fighter.defense.feedbackTicksRemaining = balanceConfig.defenseFeedbackFrames;
}

export function setDefenseEffect(fighter: FighterSnapshot, effect: DefenseEffect) {
  fighter.defense.effect = effect;
  fighter.defense.effectTicksRemaining = balanceConfig.defenseEffectFrames;
}

export function tickDefenseState(fighter: FighterSnapshot) {
  const defense = fighter.defense;
  defense.comboEscapeCooldownTicks = decrement(defense.comboEscapeCooldownTicks);
  defense.feedbackTicksRemaining = decrement(defense.feedbackTicksRemaining);
  defense.effectTicksRemaining = decrement(defense.effectTicksRemaining);
  if (defense.feedbackTicksRemaining === 0) defense.feedback = 'none';
  if (defense.effectTicksRemaining === 0) defense.effect = 'none';
}

function decrement(value: number) {
  return Math.max(0, value - 1);
}
