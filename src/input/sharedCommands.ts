/**
 * Command rows every character shares.
 *
 * The taunt is one move id for the whole roster: it has no hitbox, so nothing
 * about it is character-specific except the voice line the audio layer picks.
 */

import { TAUNT_MOVE_ID } from '../data/taunt-move.js';
import type { CommandRow } from './command.js';

export const TAUNT_COMMAND: CommandRow = {
  moveId: TAUNT_MOVE_ID,
  motion: 'none',
  button: 'taunt',
  stance: 'any',
};
