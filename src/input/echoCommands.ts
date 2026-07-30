import { ECHO_MOVE_IDS } from '../data/echo-combat-moves.js';
import { ECHO_SPECIAL_MOVE_IDS } from '../data/echo-special-moves.js';
import { ECHO_SUPER_MOVE_IDS } from '../data/echo-super-moves.js';
import type { CommandRow } from './command.js';
import { TAUNT_COMMAND } from './sharedCommands.js';

export const ECHO_COMMANDS: readonly CommandRow[] = [
  {
    moveId: ECHO_SUPER_MOVE_IDS.statistics,
    motion: 'none',
    button: 'echoF',
    alsoPressed: ['echoQ'],
    stance: 'any',
    available: ({ ultimateReady }) => ultimateReady === true,
  },
  {
    moveId: ECHO_SUPER_MOVE_IDS.repeat,
    motion: 'none',
    button: 'echoR',
    alsoPressed: ['echoQ'],
    stance: 'any',
    available: ({ superMeter }) => superMeter >= 100,
  },
  {
    moveId: ECHO_SUPER_MOVE_IDS.analysis,
    motion: 'none',
    button: 'echoE',
    alsoPressed: ['echoQ'],
    stance: 'any',
    available: ({ superMeter }) => superMeter >= 34,
  },
  {
    moveId: ECHO_SUPER_MOVE_IDS.statistics,
    motion: 'none',
    button: 'ultimate',
    stance: 'any',
    available: ({ ultimateReady }) => ultimateReady === true,
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
  TAUNT_COMMAND,
  {
    moveId: ECHO_SPECIAL_MOVE_IDS.patternScan,
    motion: 'none',
    button: 'echoR',
    stance: 'any',
  },
  {
    moveId: ECHO_SPECIAL_MOVE_IDS.behavioralMirror,
    motion: 'none',
    button: 'echoE',
    stance: 'any',
  },
  {
    moveId: ECHO_SPECIAL_MOVE_IDS.predictionLock,
    motion: 'none',
    button: 'echoF',
    stance: 'any',
  },
  { moveId: ECHO_MOVE_IDS.lp, motion: 'none', button: 'lp', stance: 'any' },
  { moveId: ECHO_MOVE_IDS.hp, motion: 'none', button: 'hp', stance: 'any' },
  { moveId: ECHO_MOVE_IDS.lk, motion: 'none', button: 'lk', stance: 'any' },
  { moveId: ECHO_MOVE_IDS.hk, motion: 'none', button: 'hk', stance: 'any' },
];
