/**
 * Which command table and input profile each fighter plays on.
 *
 * This used to live inside `CombatGameLoop.tsx`, which made it unreachable from
 * anything that is not a React tree — including the simulation test build and
 * the Tutorial, both of which have to agree with a real match about what a key
 * means. Moving it here changes no behaviour: the two functions are the same
 * ones, in the same order, with the same fallbacks.
 *
 * `tests/tutorial-input.test.mjs` pins the mapping so a future character cannot
 * be added to the roster without also being given a table here.
 */

import type { CharacterId } from '../data/characterRoster.js';
import type { CommandRow } from './command.js';
import { GLITCH_COMMANDS } from './glitchCommands.js';
import {
  LUCKY_COMMANDS,
  LUCKY_INPUT_TUNING,
  LUCKY_JUMP_SUPPRESSING_MOVES,
} from './luckyCommands.js';
import { MIM_COMMANDS } from './mimCommands.js';
import {
  DEFAULT_INPUT_PROFILE,
  LUCKY_INPUT_PROFILE,
  type InputProfile,
} from './profiles.js';
import { TITAN_COMMANDS } from './titanCommands.js';
import { VORGH_COMMANDS } from './vorghCommands.js';

export function commandsFor(characterId: CharacterId): readonly CommandRow[] {
  if (characterId === 'titan') return TITAN_COMMANDS;
  if (characterId === 'vorgh') return VORGH_COMMANDS;
  if (characterId === 'lucky') return LUCKY_COMMANDS;
  if (characterId === 'glitch') return GLITCH_COMMANDS;
  return MIM_COMMANDS;
}

/**
 * Lucky guards with Back and dashes with a double tap; everyone else keeps the
 * dedicated block and dash keys they were built around.
 *
 * The Tutorial reads this rather than assuming a roster-wide scheme, which is
 * why a defence lesson prints "hold Back" for Lucky and "hold the Block key"
 * for the other four. Teaching one universal answer would be teaching a
 * falsehood to four fifths of the roster.
 */
export function profileFor(characterId: CharacterId): InputProfile {
  if (characterId !== 'lucky') return DEFAULT_INPUT_PROFILE;
  return {
    ...LUCKY_INPUT_PROFILE,
    leeway: LUCKY_INPUT_TUNING.leeway,
    settleFrames: LUCKY_INPUT_TUNING.settleFrames,
    suppressJumpFor: LUCKY_JUMP_SUPPRESSING_MOVES,
  };
}
