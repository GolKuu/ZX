import { MIM_MOVE_IDS } from '../data/mim-moves.js';
import {
  MIM_LEVEL_ONE_COST,
  MIM_LEVEL_THREE_COST,
  MIM_SUPER_MOVE_IDS,
} from '../data/mim-super-moves.js';
import type { CommandRow } from './command.js';
import { TAUNT_COMMAND } from './sharedCommands.js';

/** MIM keeps the shared four-button layout while owning unique move ids. */
export const MIM_COMMANDS: readonly CommandRow[] = [
  {
    moveId: MIM_SUPER_MOVE_IDS.altF4,
    motion: 'none',
    button: 'ultimate',
    stance: 'any',
    available: ({ ultimateReady }) => ultimateReady === true,
  },
  {
    moveId: MIM_SUPER_MOVE_IDS.hero,
    motion: 'none',
    button: 'super',
    stance: 'any',
    available: ({ superMeter }) => superMeter >= MIM_LEVEL_THREE_COST,
  },
  {
    moveId: MIM_SUPER_MOVE_IDS.prank,
    motion: 'none',
    button: 'super',
    stance: 'any',
    available: ({ superMeter }) => superMeter >= MIM_LEVEL_ONE_COST,
  },
  TAUNT_COMMAND,
  { moveId: MIM_MOVE_IDS.snap, motion: 'none', button: 'lp', stance: 'any' },
  { moveId: MIM_MOVE_IDS.cursor, motion: 'none', button: 'hp', stance: 'any' },
  { moveId: MIM_MOVE_IDS.banana, motion: 'none', button: 'lk', stance: 'any' },
  { moveId: MIM_MOVE_IDS.chair, motion: 'none', button: 'hk', stance: 'any' },
];
