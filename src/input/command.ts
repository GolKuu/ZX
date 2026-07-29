/**
 * Command table: buffer → move id.
 *
 * Adding a move to a character is adding a row here. No branching, per README
 * rule R6. Rows are matched in array order, so specials must precede the
 * normals that share their button.
 */

import type { Button, Direction } from './bindings.js';
import { XRAY_MOVE_ID } from '../data/combat-moves.js';
import { hasButton, isCrouching } from './bindings.js';
import { INPUT_LEEWAY_FRAMES, type InputBuffer } from './buffer.js';
import { matchesMotion, type MotionId } from './motion.js';

export interface CommandRow {
  /** Move id understood by the simulation. */
  readonly moveId: string;
  /** Motion prefix, or `'none'` for a plain button press. */
  readonly motion: MotionId;
  /** Button that commits the move. */
  readonly button: Button;
  /** Requires the special/super modifier to be held. */
  readonly requiresModifier?: boolean;
  /** `'crouching'` and `'standing'` gate on the direction at press time. */
  readonly stance?: 'standing' | 'crouching' | 'any';
  /** Optional gate — stance systems, gauge costs, air-only moves. */
  readonly available?: (context: CommandContext) => boolean;
}

export interface CommandContext {
  readonly grounded: boolean;
  readonly stanceId: string | null;
  readonly gauge: number;
  readonly superMeter: number;
}

export const DEFAULT_CONTEXT: CommandContext = {
  grounded: true,
  stanceId: null,
  gauge: 0,
  superMeter: 0,
};

/**
 * Kade Ruven — the one character in slice scope (README F02).
 *
 * Move ids map to the existing table in `src/data/combat-moves.ts`. The four
 * attack buttons from the Phase 3 brief resolve onto it as follows; if the
 * project settles on the L/M/H/S scheme instead, only this table changes.
 */
export const KADE_COMMANDS: readonly CommandRow[] = [
  {
    moveId: XRAY_MOVE_ID,
    motion: 'none',
    button: 'special',
    stance: 'any',
    available: ({ superMeter }) => superMeter >= 100,
  },
  { moveId: 'overtake', motion: 'none', button: 'special', stance: 'any' },
  // Specials first — they share buttons with the normals below.
  { moveId: 'overtake', motion: 'qcf', button: 'hp', stance: 'any' },
  { moveId: 'overtake', motion: 'qcf', button: 'lp', stance: 'any' },

  // Crouching normals.
  { moveId: '2L', motion: 'none', button: 'lp', stance: 'crouching' },
  { moveId: '2M', motion: 'none', button: 'lk', stance: 'crouching' },

  // Standing normals.
  { moveId: '5L', motion: 'none', button: 'lp', stance: 'standing' },
  { moveId: '5M', motion: 'none', button: 'lk', stance: 'standing' },
  { moveId: '5H', motion: 'none', button: 'hp', stance: 'standing' },
  { moveId: '2M', motion: 'none', button: 'hk', stance: 'any' },
];

export interface ResolvedCommand {
  readonly moveId: string;
  readonly motion: MotionId;
  readonly button: Button;
  /** Frames since the committing press — useful for input-display debugging. */
  readonly pressedAgo: number;
}

/**
 * Resolve the highest-priority command whose button was pressed within the
 * leeway window and whose motion completed by that press.
 */
export function resolveCommand(
  buffer: InputBuffer,
  table: readonly CommandRow[],
  context: CommandContext = DEFAULT_CONTEXT,
  leeway = INPUT_LEEWAY_FRAMES,
): ResolvedCommand | null {
  for (const row of table) {
    const pressedAgo = buffer.framesSincePress(row.button);
    if (pressedAgo === null || pressedAgo >= leeway) {
      continue;
    }
    if (row.requiresModifier === true && !buffer.isHeld('special')) {
      continue;
    }
    if (!matchesStance(buffer.at(pressedAgo).direction, row.stance)) {
      continue;
    }
    if (row.available !== undefined && !row.available(context)) {
      continue;
    }
    if (!matchesMotion(buffer, row.motion, pressedAgo)) {
      continue;
    }
    return {
      moveId: row.moveId,
      motion: row.motion,
      button: row.button,
      pressedAgo,
    };
  }
  return null;
}

function matchesStance(
  direction: Direction,
  stance: CommandRow['stance'],
): boolean {
  if (stance === undefined || stance === 'any') {
    return true;
  }
  const crouching = isCrouching(direction);
  return stance === 'crouching' ? crouching : !crouching;
}

/** Whether the player is currently asking to guard. */
export function isGuarding(buffer: InputBuffer): boolean {
  return hasButton(buffer.current.held, 'block');
}
