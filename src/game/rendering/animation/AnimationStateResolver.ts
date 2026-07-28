import type { FighterSnapshot, PlayerId } from '../../core/types';
import type { AnimationStateId } from './AnimationCatalog';

export type AnimationContext = {
  matchWinner: PlayerId | null;
};

export function resolveAnimationState(
  fighter: FighterSnapshot,
  context: AnimationContext,
): AnimationStateId {
  if (context.matchWinner) return context.matchWinner === fighter.id ? 'victory' : 'defeat';
  const defenseState = defenseAnimation(fighter);
  if (defenseState) return defenseState;
  if (fighter.attack) return attackAnimation(fighter);
  if (fighter.mode === 'knockout') return 'defeat';
  if (fighter.mode === 'knockdown') return 'knockdown';
  if (fighter.mode === 'wakeup') return 'wake-up';
  if (fighter.mode === 'hitstun') {
    return Math.abs(fighter.velocityY) > 120 ? 'launch-reaction' : 'hit-reaction-heavy';
  }
  if (fighter.mode === 'blockstun') return 'block-reaction';
  if (fighter.mode === 'blocking') return 'block';
  if (fighter.landedTicksRemaining > 0) return 'landing';
  if (!fighter.grounded) return fighter.velocityY < 0 ? 'jump-rise' : 'jump-fall';
  if (fighter.vulnerableTicksRemaining > 0) return 'dash-whiff';
  if (fighter.mode === 'dashing') return 'dash';
  if (fighter.mode === 'walking') return 'walk';
  if (fighter.mode === 'crouching') return 'crouch';
  if (fighter.passiveValue >= fighter.maxPassiveValue) return 'passive-full';
  return 'idle';
}

function defenseAnimation(fighter: FighterSnapshot): AnimationStateId | null {
  switch (fighter.defense.effect) {
    case 'perfect-block': return 'perfect-block';
    case 'precise-block': return 'precise-block';
    case 'combo-break': return 'combo-break';
    case 'combo-escape': return 'combo-escape';
    default: return null;
  }
}

function attackAnimation(fighter: FighterSnapshot): AnimationStateId {
  const id = fighter.attack?.id.slice(fighter.characterId.length + 1) ?? 'idle';
  const known: Record<string, AnimationStateId> = {
    'light-forward': 'light-2',
    'light-retreat': 'light-1',
    'light-dash': 'auto-combo',
    'heavy-forward': 'heavy-2',
    'heavy-retreat': 'heavy-1',
    'heavy-dash': 'heavy-3',
    'special-neutral': 'special-neutral',
    'special-forward': 'special-forward',
    'special-retreat': 'special-retreat',
    'special-air': 'special-air',
    'enhanced-special': 'enhanced-special',
    'momentum-reversal': 'momentum-reversal',
  };
  return known[id] ?? isAnimationState(id) ? (known[id] ?? id as AnimationStateId) : 'idle';
}

function isAnimationState(value: string): value is AnimationStateId {
  return [
    'light-1', 'light-2', 'light-3', 'heavy-1', 'heavy-2', 'heavy-3',
    'low-light', 'low-heavy', 'air-light', 'air-heavy', 'grab',
    'throw-forward', 'throw-back', 'super',
  ].includes(value);
}
