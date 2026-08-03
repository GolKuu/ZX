import { VORGH_ENHANCED_SPECIAL_SPECS } from './enhanced-specials.js';
import { VORGH_NORMAL_SPECS } from './normals.js';
import { VORGH_SPECIAL_SPECS } from './specials.js';
import { VORGH_SUPER_SPECS } from './supers.js';
import { VORGH_TECHNIQUE_SPECS } from './techniques.js';

export * from './character.js';
export { VORGH_DAMAGE_PERCENT } from './builder.js';
export * from './ids.js';
export * from './types.js';
export { VORGH_AI_LOADOUTS } from './ai.js';
export { vorghSuperCostForMove, VORGH_SUPER_COST } from './supers.js';

export const VORGH_MOVE_SPECS = [
  ...VORGH_NORMAL_SPECS,
  ...VORGH_TECHNIQUE_SPECS,
  ...VORGH_SPECIAL_SPECS,
  ...VORGH_ENHANCED_SPECIAL_SPECS,
  ...VORGH_SUPER_SPECS,
] as const;

export const VORGH_MOVES = VORGH_MOVE_SPECS.map(({ move }) => move);

export function vorghMove(id: string) {
  return VORGH_MOVE_SPECS.find(({ move }) => move.id === id);
}
