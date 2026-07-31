/**
 * MIM's wall specials and the techniques the story unlocks.
 *
 * Grouped together because they share one rule: every one of them either
 * creates, drives or climbs an energy plane.
 */

import type { MoveFrameData } from '../sim/frame-data.js';
import { MIM_STORY_IDS, MIM_WALL_IDS } from './mim/ids.js';
import { MIM_STORY_MOVES } from './mim/story-moves.js';
import { MIM_WALL_SPECIAL_MOVES } from './mim/wall-specials.js';

export const MIM_SPECIAL_MOVE_IDS = {
  ...MIM_WALL_IDS,
  ...MIM_STORY_IDS,
  /** Legacy presentation hooks; aliases preserve gameplay ids. */
  bananaTrap: MIM_WALL_IDS.invisibleWall,
  fakeOpening: MIM_WALL_IDS.wallLaunch,
} as const;

export const MIM_SPECIAL_MOVES: readonly MoveFrameData[] = [
  ...MIM_WALL_SPECIAL_MOVES,
  ...MIM_STORY_MOVES,
];

export { MIM_STORY_IDS, MIM_WALL_IDS };
export { MIM_STORY_MOVES, MIM_WALL_SPECIAL_MOVES };
export {
  MIM_FULLY_UNLOCKED,
  MIM_STORY_CHAPTERS,
  MIM_STORY_START,
  MIM_UNLOCKS,
  isMimMoveUnlocked,
  unlockedMimMoves,
  type MimStoryChapter,
  type MimUnlockState,
} from './mim/unlocks.js';
