/**
 * Shared reads every detector needs.
 *
 * These are the questions objectives ask about the world — "is this fighter
 * able to act?", "is that move in recovery?" — answered from the public
 * snapshot and the real frame data, so a Tutorial verdict and a match agree.
 */

import {
  movePhaseAt,
  type MoveFrameData,
  type MovePhase,
} from '../../sim/frame-data.js';
import type { FighterSnapshot, WorldSnapshot } from '../../sim/index.js';

export type MoveLookup = (moveId: string) => MoveFrameData | undefined;

export function makeMoveLookup(
  moves: readonly MoveFrameData[],
): MoveLookup {
  const byId = new Map(moves.map((move) => [move.id, move]));
  return (moveId) => byId.get(moveId);
}

export function fighterOf(
  world: WorldSnapshot,
  id: string,
): FighterSnapshot | undefined {
  return world.fighters.find((entry) => entry.id === id);
}

/**
 * The first actionable frame, as the engine defines it.
 *
 * Block stun counts through `guardFrames`, hit stun through `hitstun`, and an
 * unfinished move through `action`. A reversal lesson that only checked
 * `hitstun` would call a press during block stun "correct", which is exactly
 * the mistake Course 3 Lesson 3 exists to teach against.
 */
export function isActionable(fighter: FighterSnapshot): boolean {
  return fighter.hitstun === 0
    && fighter.hitstop === 0
    && fighter.guardFrames === 0
    && fighter.action === null;
}

/** Which phase a fighter's current move is in, or `null` if it has none. */
export function phaseOf(
  fighter: FighterSnapshot,
  lookup: MoveLookup,
): MovePhase | null {
  const action = fighter.action;
  if (action === null) return null;
  const move = lookup(action.moveId);
  if (move === undefined) return null;
  return movePhaseAt(move, action.frame);
}

/** True while a fighter is in the recovery of a move — the punish window. */
export function isRecovering(
  fighter: FighterSnapshot,
  lookup: MoveLookup,
): boolean {
  return phaseOf(fighter, lookup) === 'recovery';
}

/** True while a fighter is in the startup of a move — the counter-hit window. */
export function isStartingUp(
  fighter: FighterSnapshot,
  lookup: MoveLookup,
): boolean {
  return phaseOf(fighter, lookup) === 'startup';
}

/**
 * The attack level a move hits at, from the move data.
 *
 * Defence lessons gate on this rather than on the move's name, so authoring a
 * new low does not require editing Course 3.
 */
export function attackLevelOf(
  moveId: string,
  lookup: MoveLookup,
): 'high' | 'mid' | 'low' | 'throw' | 'unblockable' | undefined {
  return lookup(moveId)?.attackLevel;
}
