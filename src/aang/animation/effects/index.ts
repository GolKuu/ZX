import type { EffectMotion } from '../../types';
import { AIR_FIRE_EFFECTS } from './airFire';
import { EARTH_WATER_EFFECTS } from './earthWater';
import { SPECIAL_EFFECTS } from './special';
import type { EffectAnimation } from './types';

const EFFECTS = {
  ...AIR_FIRE_EFFECTS,
  ...EARTH_WATER_EFFECTS,
  ...SPECIAL_EFFECTS,
};

export function getEffectAnimation(effect: EffectMotion): EffectAnimation {
  const animation = EFFECTS[effect];
  if (animation === undefined) {
    throw new Error(`Missing Aang effect animation: ${effect}`);
  }
  return animation;
}
