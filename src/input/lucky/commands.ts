/**
 * Lucky's command table, derived from `LUCKY_CATALOGUE`.
 *
 * Nothing is hand-written here. Every row the matcher sees comes from the
 * catalogue, so a move cannot exist in the table without also existing in the
 * move list, and cannot be documented without being reachable.
 *
 * Not one row references `block`, `dash`, `taunt`, `super`, `ultimate` or the
 * MIM meme buttons. Lucky's entire vocabulary is W A S D and J K I L; guarding
 * and dashing are directions, handled in `keyboard.ts`.
 */

import type { CommandContext, CommandRow } from '../command.js';
import { LUCKY_LUCK_IDS, LUCKY_MOVE_IDS } from '../../data/lucky/ids.js';
import { LUCKY_CATALOGUE, type LuckyCommandSpec } from './catalogue.js';
import { LUCKY_BUTTON_SLOT } from './buttons.js';

/**
 * Input tuning.
 *
 * `settleFrames` is the simultaneous-press tolerance: the matcher waits this
 * long after the last attack press before reading the chord, so `J` cannot
 * resolve before the `I` of a `J+I` throw arrives. It is the price of a
 * chord-based command set and it is charged to every attack, which is why it is
 * three frames and not eight.
 *
 * `leeway` is the buffer the brief asks for — 6 to 10 frames. Ten, because the
 * settle window eats the first three of them.
 */
export const LUCKY_INPUT_TUNING = {
  settleFrames: 3,
  leeway: 10,
} as const;

/**
 * Moves whose command contains Up but which are not jumps.
 *
 * `Up + K+L` reads the probability state and the charged rising heel releases a
 * Down charge upward; without this both would also leave the ground, and the
 * move would start out of a jump it never asked for.
 */
export const LUCKY_JUMP_SUPPRESSING_MOVES: ReadonlySet<string> = new Set([
  LUCKY_LUCK_IDS.inspect,
  LUCKY_MOVE_IDS.chargeRisingHeel,
]);

export const LUCKY_COMMANDS: readonly CommandRow[] = LUCKY_CATALOGUE.map(toRow);

function toRow(spec: LuckyCommandSpec): CommandRow {
  const role = spec.buttons[0];
  if (role === undefined) {
    throw new Error(`Lucky command "${spec.name}" has no role button`);
  }
  const available = availabilityFor(spec);
  return {
    moveId: spec.moveId,
    motion: spec.motion,
    button: LUCKY_BUTTON_SLOT[role],
    exactChord: spec.buttons.map((button) => LUCKY_BUTTON_SLOT[button]),
    // A motion is its own qualifier, so it is never also stance-gated: a
    // dragon punch ends on Down-Forward, which reads as crouching, and gating
    // it on "standing" would reject every dragon punch ever entered. Ground
    // and air are still enforced through `available` below.
    stance: spec.motion === 'none'
      ? (spec.stance === 'air' ? 'any' : spec.stance)
      : 'any',
    ...(spec.direction === undefined ? {} : { holdDirection: spec.direction }),
    ...(available === null ? {} : { available }),
  };
}

/**
 * Compose the gates a row needs into one predicate.
 *
 * Ground and air are always checked, so a grounded normal can never fire out of
 * a jump and an aerial can never fire on the floor — which is what stops a
 * "move is unreachable" bug from hiding behind an ordering accident.
 */
function availabilityFor(
  spec: LuckyCommandSpec,
): ((context: CommandContext) => boolean) | null {
  const checks: ((context: CommandContext) => boolean)[] = [];

  if (spec.stance === 'air') {
    checks.push(({ grounded }) => !grounded);
  } else if (spec.stance !== 'any') {
    checks.push(({ grounded }) => grounded);
  }

  const luckNeeded = spec.luckCost ?? spec.luckRequired;
  if (luckNeeded !== undefined) {
    checks.push(({ gauge }) => gauge >= luckNeeded);
  }
  if (spec.meterCost !== undefined) {
    const cost = spec.meterCost;
    checks.push(({ superMeter }) => superMeter >= cost);
  }
  if (spec.requiresUltimate === true) {
    checks.push(({ ultimateReady }) => ultimateReady === true);
  }

  if (checks.length === 0) return null;
  return (context) => checks.every((check) => check(context));
}
