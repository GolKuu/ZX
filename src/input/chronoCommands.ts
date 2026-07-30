import { CHRONO_MOVE_IDS } from '../data/chrono-combat-moves.js';
import {
  CHRONO_LEVEL_ONE_COST,
  CHRONO_LEVEL_THREE_COST,
  CHRONO_SUPER_MOVE_IDS,
} from '../data/chrono-super-moves.js';
import type { CommandRow } from './command.js';
import { TAUNT_COMMAND } from './sharedCommands.js';

/** CHRONO keeps the shared button layout without touching other fighters. */
export const CHRONO_COMMANDS: readonly CommandRow[] = [
  {
    moveId: CHRONO_SUPER_MOVE_IDS.inevitability,
    motion: 'none',
    button: 'ultimate',
    stance: 'any',
    available: ({ ultimateReady }) => ultimateReady === true,
  },
  {
    moveId: CHRONO_SUPER_MOVE_IDS.outcomes,
    motion: 'none',
    button: 'super',
    stance: 'any',
    available: ({ superMeter }) => superMeter >= CHRONO_LEVEL_THREE_COST,
  },
  {
    moveId: CHRONO_SUPER_MOVE_IDS.rewind,
    motion: 'none',
    button: 'super',
    stance: 'any',
    available: ({ superMeter }) => superMeter >= CHRONO_LEVEL_ONE_COST,
  },
  TAUNT_COMMAND,
  { moveId: CHRONO_MOVE_IDS.lp, motion: 'none', button: 'lp', stance: 'any' },
  { moveId: CHRONO_MOVE_IDS.hp, motion: 'none', button: 'hp', stance: 'any' },
  { moveId: CHRONO_MOVE_IDS.lk, motion: 'none', button: 'lk', stance: 'any' },
  { moveId: CHRONO_MOVE_IDS.hk, motion: 'none', button: 'hk', stance: 'any' },
];
