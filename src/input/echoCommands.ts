import { ECHO_MOVE_IDS } from '../data/echo-combat-moves.js';
import type { CommandRow } from './command.js';

export const ECHO_COMMANDS: readonly CommandRow[] = [
  { moveId: ECHO_MOVE_IDS.lp, motion: 'none', button: 'lp', stance: 'any' },
  { moveId: ECHO_MOVE_IDS.hp, motion: 'none', button: 'hp', stance: 'any' },
  { moveId: ECHO_MOVE_IDS.lk, motion: 'none', button: 'lk', stance: 'any' },
  { moveId: ECHO_MOVE_IDS.hk, motion: 'none', button: 'hk', stance: 'any' },
];
