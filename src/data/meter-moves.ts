/**
 * Which moves the meter system cares about, in one place.
 *
 * Two tiers with two different prices:
 * - **supers** cost energy from the bar,
 * - **ultimates** cost no energy at all and unlock on low health instead.
 */

import { chronoSuperCostForMove, CHRONO_SUPER_MOVE_IDS } from './chrono-super-moves.js';
import { XRAY_MOVE_ID } from './combat-moves.js';
import { echoSuperCostForMove, ECHO_SUPER_MOVE_IDS } from './echo-super-moves.js';
import { glitchSuperCostForMove, GLITCH_SUPER_MOVE_IDS } from './glitch-super-moves.js';
import { mimSuperCostForMove, MIM_SUPER_MOVE_IDS } from './mim-super-moves.js';
import {
  luckySuperCostForMove,
  LUCKY_SUPER_IDS,
} from './lucky/supers.js';
import {
  vorghSuperCostForMove,
  VORGH_SUPER_IDS,
} from './vorgh/index.js';

/** One ultimate per character. */
export const ULTIMATE_MOVE_IDS: ReadonlySet<string> = new Set<string>([
  XRAY_MOVE_ID,
  MIM_SUPER_MOVE_IDS.perfectBox,
  ECHO_SUPER_MOVE_IDS.statistics,
  CHRONO_SUPER_MOVE_IDS.inevitability,
  GLITCH_SUPER_MOVE_IDS.patchNotes,
  LUCKY_SUPER_IDS.impossibleOutcome,
  VORGH_SUPER_IDS.lastBeast,
  VORGH_SUPER_IDS.lastBeastSequence,
]);

export function isUltimateMove(moveId: string): boolean {
  return ULTIMATE_MOVE_IDS.has(moveId);
}

/** Energy price of a super, or `null` when the move is not paid for in energy. */
export function superCostForMove(moveId: string): number | null {
  if (isUltimateMove(moveId)) {
    return null;
  }
  return mimSuperCostForMove(moveId)
    ?? echoSuperCostForMove(moveId)
    ?? chronoSuperCostForMove(moveId)
    ?? glitchSuperCostForMove(moveId)
    ?? luckySuperCostForMove(moveId)
    ?? vorghSuperCostForMove(moveId);
}

/** Supers and ultimates both build no energy for the attacker. */
export function buildsMeter(moveId: string): boolean {
  return !isUltimateMove(moveId) && superCostForMove(moveId) === null;
}
