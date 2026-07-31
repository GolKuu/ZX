import type { MoveFrameData } from '../../sim/frame-data.js';
import { TITAN_GRAPPLE_MOVES } from './grapples.js';
import { TITAN_NORMAL_MOVES } from './normals.js';
import { TITAN_SPECIAL_MOVES } from './specials.js';
import { TITAN_SUPER_MOVES } from './supers.js';

export * from './ai.js';
export * from './character.js';
export * from './grapples.js';
export * from './ids.js';
export * from './presentation.js';
export * from './supers.js';

export const TITAN_ALL_MOVES: readonly MoveFrameData[] = [
  ...TITAN_NORMAL_MOVES,
  ...TITAN_GRAPPLE_MOVES,
  ...TITAN_SPECIAL_MOVES,
  ...TITAN_SUPER_MOVES,
];

export function titanMoveById(moveId: string): MoveFrameData | undefined {
  return TITAN_ALL_MOVES.find((move) => move.id === moveId);
}
