import type { EffectMotion } from '../../types';
import { SPECIAL_EFFECTS } from './special';
import { STANDARD_EFFECTS } from './standard';
import type { EffectAnimation } from './types';

const EFFECTS = { ...STANDARD_EFFECTS, ...SPECIAL_EFFECTS };

export function getEffectAnimation(effect: EffectMotion): EffectAnimation {
  const animation = EFFECTS[effect];
  if (animation === undefined) {
    throw new Error(`Missing Aang effect animation: ${effect}`);
  }
  return animation;
}
