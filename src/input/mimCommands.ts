import { MIM_MOVE_IDS } from '../data/mim-moves.js';
import type { CommandRow } from './command.js';

/** MIM keeps the shared four-button layout while owning unique move ids. */
export const MIM_COMMANDS: readonly CommandRow[] = [
  { moveId: MIM_MOVE_IDS.snap, motion: 'none', button: 'lp', stance: 'any' },
  { moveId: MIM_MOVE_IDS.cursor, motion: 'none', button: 'hp', stance: 'any' },
  { moveId: MIM_MOVE_IDS.banana, motion: 'none', button: 'lk', stance: 'any' },
  { moveId: MIM_MOVE_IDS.chair, motion: 'none', button: 'hk', stance: 'any' },
];
