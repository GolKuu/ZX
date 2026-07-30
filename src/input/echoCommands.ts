import { ECHO_MOVE_IDS } from '../data/echo-combat-moves.js';
import { ECHO_SUPER_MOVE_IDS } from '../data/echo-super-moves.js';
import type { CommandRow } from './command.js';

export const ECHO_COMMANDS: readonly CommandRow[] = [
  {
    moveId: ECHO_SUPER_MOVE_IDS.statistics,
    motion: 'none',
    button: 'hk',
    stance: 'any',
    requiresModifier: true,
    available: ({ finisherReady, superMeter }) =>
      finisherReady === true && superMeter >= 100,
  },
  {
    moveId: ECHO_SUPER_MOVE_IDS.repeat,
    motion: 'none',
    button: 'hp',
    stance: 'any',
    requiresModifier: true,
    available: ({ superMeter }) => superMeter >= 100,
  },
  {
    moveId: ECHO_SUPER_MOVE_IDS.analysis,
    motion: 'none',
    button: 'lp',
    stance: 'any',
    requiresModifier: true,
    available: ({ superMeter }) => superMeter >= 34,
  },
  { moveId: ECHO_MOVE_IDS.lp, motion: 'none', button: 'lp', stance: 'any' },
  { moveId: ECHO_MOVE_IDS.hp, motion: 'none', button: 'hp', stance: 'any' },
  { moveId: ECHO_MOVE_IDS.lk, motion: 'none', button: 'lk', stance: 'any' },
  { moveId: ECHO_MOVE_IDS.hk, motion: 'none', button: 'hk', stance: 'any' },
];
