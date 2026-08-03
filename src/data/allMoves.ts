/**
 * One flat move table for the whole roster.
 *
 * Extracted from `game/combatSetup.ts`, which pulls in the HUD store and so
 * cannot be loaded by the DOM-free simulation test build. The table itself is
 * pure data and is needed by anything that has to answer "does this move id
 * exist?" — the Tutorial's data validation above all. `combatSetup` re-exports
 * it, so every existing import keeps working unchanged.
 *
 * Ids are globally unique across the roster; which character may use which move
 * is decided by the command tables in `src/input/`, not here.
 */

import type { MoveFrameData } from '../sim/frame-data.js';
import { KADE_MOVES } from './combat-moves.js';
import { MIM_MOVES } from './mim-moves.js';
import { MIM_SPECIAL_MOVES } from './mim-special-moves.js';
import { MIM_SUPER_MOVES } from './mim-super-moves.js';
import { GLITCH_MOVES } from './glitch-combat-moves.js';
import { GLITCH_SUPER_MOVES } from './glitch-super-moves.js';
import {
  LUCKY_MOVES,
  LUCKY_SPECIAL_MOVES,
  LUCKY_SUPER_MOVES,
} from './lucky/index.js';
import { VORGH_MOVES } from './vorgh/index.js';
import { TITAN_ALL_MOVES } from './titan/index.js';
import { TAUNT_MOVES } from './taunt-move.js';

export const ALL_COMBAT_MOVES: readonly MoveFrameData[] = [
  ...KADE_MOVES,
  ...MIM_MOVES,
  ...MIM_SPECIAL_MOVES,
  ...MIM_SUPER_MOVES,
  ...GLITCH_MOVES,
  ...GLITCH_SUPER_MOVES,
  ...LUCKY_MOVES,
  ...LUCKY_SPECIAL_MOVES,
  ...LUCKY_SUPER_MOVES,
  ...VORGH_MOVES,
  ...TITAN_ALL_MOVES,
  ...TAUNT_MOVES,
];

const BY_ID = new Map(ALL_COMBAT_MOVES.map((move) => [move.id, move]));

export function findMove(moveId: string): MoveFrameData | undefined {
  return BY_ID.get(moveId);
}

export function moveExists(moveId: string): boolean {
  return BY_ID.has(moveId);
}
