/**
 * What kind of action a move id is, for code that must treat a whole tier the
 * same way — animation above all.
 *
 * The answer comes from the same registries gameplay uses, so a move cannot be
 * a super to the meter and a normal to the renderer.
 */

import { isUltimateMove, superCostForMove } from './meter-moves.js';
import { TAUNT_MOVE_ID } from './taunt-move.js';

export type MoveKind = 'normal' | 'super' | 'ultimate' | 'taunt';

export function moveKindFor(moveId: string): MoveKind {
  if (moveId === TAUNT_MOVE_ID) return 'taunt';
  if (isUltimateMove(moveId)) return 'ultimate';
  if (superCostForMove(moveId) !== null) return 'super';
  return 'normal';
}
