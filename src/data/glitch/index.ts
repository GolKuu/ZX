import type { MoveFrameData } from '../../sim/frame-data.js';
import { GLITCH_AIR_MOVES } from './aerials.js';
import { GLITCH_NORMAL_MOVES } from './normals.js';
import { GLITCH_SHIFT_MOVES } from './shifts.js';
import { GLITCH_SPECIAL_MOVES } from './specials.js';
import { GLITCH_UTILITY_MOVES } from './utility.js';

export {
  GLITCH_AIR_RULES,
  GLITCH_DEFENSE_STATES,
  GLITCH_HURTBOXES,
  GLITCH_MAX_HEALTH,
  GLITCH_MOVEMENT,
  GLITCH_STATS,
} from './character.js';
export { GLITCH_MOVE_DEFINITIONS } from './builder.js';
export * from './ids.js';
export {
  GLITCH_LEVEL_ONE_COST,
  GLITCH_LEVEL_THREE_COST,
  GLITCH_SUPER_MOVES,
  glitchSuperCostForMove,
  glitchSuperKindForMove,
  type GlitchSuperKind,
} from './supers.js';
export type {
  GlitchHitLevel,
  GlitchMoveDefinition,
  GlitchPresentation,
} from './types.js';

export const GLITCH_MOVES: readonly MoveFrameData[] = [
  ...GLITCH_NORMAL_MOVES,
  ...GLITCH_AIR_MOVES,
  ...GLITCH_UTILITY_MOVES,
  ...GLITCH_SHIFT_MOVES,
  ...GLITCH_SPECIAL_MOVES,
];

export const GLITCH_ANIMATION_SPEED = 1;
