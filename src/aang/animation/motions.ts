import type { AangMotion } from '../types';
import { AIR_MOTIONS } from './airMotions';
import { EARTH_MOTIONS } from './earthMotions';
import { FIRE_MOTIONS } from './fireMotions';
import { SPECIAL_MOTIONS } from './specialMotions';
import { SUPER_MOTIONS } from './superMotions';
import { WATER_MOTIONS } from './waterMotions';

export const AANG_MOTIONS: Readonly<Record<string, AangMotion>> = {
  ...AIR_MOTIONS,
  ...FIRE_MOTIONS,
  ...EARTH_MOTIONS,
  ...WATER_MOTIONS,
  ...SPECIAL_MOTIONS,
  ...SUPER_MOTIONS,
};
