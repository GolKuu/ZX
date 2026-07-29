import { CHRONO_MOVE_IDS } from '../data/chrono-combat-moves.js';
import type { CommandRow } from './command.js';

/** CHRONO keeps the global J/K/L/U layout without touching other fighters. */
export const CHRONO_COMMANDS: readonly CommandRow[] = [
  { moveId: CHRONO_MOVE_IDS.lp, motion: 'none', button: 'lp', stance: 'any' },
  { moveId: CHRONO_MOVE_IDS.hp, motion: 'none', button: 'hp', stance: 'any' },
  { moveId: CHRONO_MOVE_IDS.lk, motion: 'none', button: 'lk', stance: 'any' },
  { moveId: CHRONO_MOVE_IDS.hk, motion: 'none', button: 'hk', stance: 'any' },
];
