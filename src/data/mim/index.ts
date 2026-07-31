import type { MoveFrameData } from '../../sim/frame-data.js';
import { MIM_DUAL_MOVES } from './duals.js';
import { MIM_NORMAL_MOVES } from './normals.js';
import { MIM_STORY_MOVES } from './story-moves.js';
import { MIM_SUPER_MOVES } from './supers.js';
import { MIM_UTILITY_MOVES } from './utility.js';
import { MIM_WALL_SPECIAL_MOVES } from './wall-specials.js';

export * from './character.js';
export * from './ids.js';
export * from './unlocks.js';
export { MIM_DUAL_MOVES } from './duals.js';
export { MIM_NORMAL_MOVES } from './normals.js';
export { MIM_STORY_MOVES } from './story-moves.js';
export { MIM_UTILITY_MOVES } from './utility.js';
export { MIM_WALL_SPECIAL_MOVES, MIM_WALL_LIFETIME, MIM_WALL_TOP } from './wall-specials.js';
export { MIM_PERFECT_BOX_SEQUENCE } from './ultimate.js';
export {
  MIM_FALSE_OPENING_COUNTER,
  MIM_LEVEL_ONE_COST,
  MIM_LEVEL_THREE_COST,
  MIM_SUPER_MOVES,
  mimSuperCostForMove,
  mimSuperKindForMove,
  type MimSuperKind,
} from './supers.js';

/** Every frame-data row MIM owns. The engine takes one flat table. */
export const MIM_ALL_MOVES: readonly MoveFrameData[] = [
  ...MIM_NORMAL_MOVES,
  ...MIM_DUAL_MOVES,
  ...MIM_UTILITY_MOVES,
  ...MIM_WALL_SPECIAL_MOVES,
  ...MIM_STORY_MOVES,
  ...MIM_SUPER_MOVES,
];

export function mimMove(moveId: string): MoveFrameData | undefined {
  return MIM_ALL_MOVES.find((move) => move.id === moveId);
}
