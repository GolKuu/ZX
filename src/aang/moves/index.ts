import { AIR_MOVES } from './air';
import { EARTH_MOVES } from './earth';
import { FIRE_MOVES } from './fire';
import { SPECIAL_MOVES } from './specials';
import { WATER_MOVES } from './water';

export const AANG_MOVES = [
  ...AIR_MOVES,
  ...FIRE_MOVES,
  ...EARTH_MOVES,
  ...WATER_MOVES,
  ...SPECIAL_MOVES,
] as const;
