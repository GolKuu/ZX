import { IDOL_MOVE_IDS } from '../data/idol-combat-moves.js';
import { IDOL_SUPER_COSTS } from '../data/idol-move-ids.js';
import type { CommandRow } from './command.js';
import { TAUNT_COMMAND } from './sharedCommands.js';

export const IDOL_COMMANDS: readonly CommandRow[] = [
  {
    moveId: IDOL_MOVE_IDS.cancel,
    motion: 'none',
    button: 'ultimate',
    stance: 'any',
    available: ({ ultimateReady }) => ultimateReady === true,
  },
  {
    moveId: IDOL_MOVE_IDS.million,
    motion: 'none',
    button: 'hp',
    requiresModifier: true,
    stance: 'any',
    available: ({ superMeter }) =>
      superMeter >= IDOL_SUPER_COSTS[IDOL_MOVE_IDS.million],
  },
  {
    moveId: IDOL_MOVE_IDS.highlight,
    motion: 'none',
    button: 'lp',
    requiresModifier: true,
    stance: 'any',
    available: ({ superMeter }) =>
      superMeter >= IDOL_SUPER_COSTS[IDOL_MOVE_IDS.highlight],
  },
  TAUNT_COMMAND,
  { moveId: IDOL_MOVE_IDS.lp, motion: 'none', button: 'lp', stance: 'any' },
  { moveId: IDOL_MOVE_IDS.hp, motion: 'none', button: 'hp', stance: 'any' },
  { moveId: IDOL_MOVE_IDS.lk, motion: 'none', button: 'lk', stance: 'any' },
  { moveId: IDOL_MOVE_IDS.hk, motion: 'none', button: 'hk', stance: 'any' },
];
