/**
 * Command table: buffer → move id.
 *
 * Adding a move to a character is adding a row here. No branching, per README
 * rule R6. Rows are matched in array order, so specials must precede the
 * normals that share their button.
 */

import type { Button, Direction } from './bindings.js';
import { XRAY_MOVE_ID } from '../data/combat-moves.js';
import { TAUNT_COMMAND } from './sharedCommands.js';
import { hasButton, horizontalOf, isCrouching, isJumping } from './bindings.js';
import { INPUT_LEEWAY_FRAMES, type InputBuffer } from './buffer.js';
import { matchesMotion, type MotionId } from './motion.js';

export interface CommandRow {
  /** Move id understood by the simulation. */
  readonly moveId: string;
  /** Motion prefix, or `'none'` for a plain button press. */
  readonly motion: MotionId;
  /** Button that commits the move. */
  readonly button: Button;
  /** Requires the Super button to be held as a modifier. */
  readonly requiresModifier?: boolean;
  /** `'crouching'` and `'standing'` gate on the direction at press time. */
  readonly stance?: 'standing' | 'crouching' | 'any';
  /**
   * Additional buttons that must be down at the committing press, for
   * simultaneous-press commands like `LP+LK` and `P+K`. Checked against the
   * held mask on that frame rather than requiring a same-frame press, because
   * no player hits two keys on the same 16 ms tick.
   */
  readonly alsoPressed?: readonly Button[];
  /** Buttons that must be up, used to prevent a failed chord falling through. */
  readonly forbiddenPressed?: readonly Button[];
  /**
   * Facing-relative direction that must be held at the committing press.
   *
   * MIM's wall commands are `D + J + K`-shaped rather than motion inputs, so
   * the table needs to gate on a held direction without inventing a motion.
   */
  readonly holdDirection?: 'forward' | 'back' | 'up' | 'down' | 'neutral';
  /** Optional gate — stance systems, gauge costs, air-only moves. */
  readonly available?: (context: CommandContext) => boolean;
}

export interface CommandContext {
  readonly grounded: boolean;
  readonly stanceId: string | null;
  readonly gauge: number;
  /** The energy bar, 0–100. Supers are paid for out of this. */
  readonly superMeter: number;
  /**
   * The comeback gate: this fighter's own health has fallen to the ultimate
   * threshold and the ultimate is still unused this round. Ultimates cost no
   * energy — this flag is their whole price.
   */
  readonly ultimateReady?: boolean;
  /**
   * Moves the current save has unlocked. `undefined` means "no story gate",
   * which is what versus and training pass.
   */
  readonly unlockedMoves?: ReadonlySet<string>;
}

export const DEFAULT_CONTEXT: CommandContext = {
  grounded: true,
  stanceId: null,
  gauge: 0,
  superMeter: 0,
  ultimateReady: false,
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
    button: 'ultimate',
    stance: 'any',
    available: ({ ultimateReady }) => ultimateReady === true,
  },
  { moveId: 'overtake', motion: 'none', button: 'super', stance: 'any' },
  TAUNT_COMMAND,
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
    if (row.requiresModifier === true && !buffer.isHeld('super')) {
      continue;
    }
    if (!matchesStance(buffer.at(pressedAgo).direction, row.stance)) {
      continue;
    }
    if (!allButtonsDown(buffer, row.alsoPressed, pressedAgo)) {
      continue;
    }
    if (!allButtonsUp(buffer, row.forbiddenPressed, pressedAgo)) {
      continue;
    }
    if (!matchesHeldDirection(buffer, row.holdDirection, pressedAgo)) {
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

function allButtonsUp(
  buffer: InputBuffer,
  buttons: readonly Button[] | undefined,
  pressedAgo: number,
): boolean {
  if (buttons === undefined) return true;
  const held = buffer.at(pressedAgo).held;
  return buttons.every((button) => !hasButton(held, button));
}

/**
 * Every companion button must be held on the committing frame. A one-frame
 * window would make `LP+LK` unusable on a keyboard.
 */
function allButtonsDown(
  buffer: InputBuffer,
  buttons: readonly Button[] | undefined,
  pressedAgo: number,
): boolean {
  if (buttons === undefined) return true;
  const held = buffer.at(pressedAgo).held;
  for (const button of buttons) {
    if (!hasButton(held, button)) return false;
  }
  return true;
}

/**
 * A chord direction is forgiving by a few frames: players roll onto the
 * direction and the buttons together, and the press frame is rarely the exact
 * frame the key registered.
 */
const DIRECTION_LEEWAY_FRAMES = 4;

function matchesHeldDirection(
  buffer: InputBuffer,
  hold: CommandRow['holdDirection'],
  pressedAgo: number,
): boolean {
  if (hold === undefined) return true;
  for (let ago = pressedAgo; ago <= pressedAgo + DIRECTION_LEEWAY_FRAMES; ago += 1) {
    if (directionMatches(buffer.at(ago).direction, hold)) return true;
  }
  return false;
}

function directionMatches(
  direction: Direction,
  hold: Exclude<CommandRow['holdDirection'], undefined>,
): boolean {
  if (hold === 'neutral') return direction === 5;
  if (hold === 'up') return isJumping(direction);
  if (hold === 'down') return isCrouching(direction);
  const horizontal = horizontalOf(direction);
  return hold === 'forward' ? horizontal === 1 : horizontal === -1;
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
