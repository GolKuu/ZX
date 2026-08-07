import { MIM_MOVE_IDS } from '../data/mim-moves.js';
import { MIM_SPECIAL_MOVE_IDS } from '../data/mim-special-moves.js';
import type { CommandRow } from './command.js';
import { MIM_SUPER_COMMANDS } from './mim/superCommands.js';
import { MIM_WALL_COMMANDS } from './mim/wallCommands.js';
import { TAUNT_COMMAND } from './sharedCommands.js';
import { withSequenceCommands } from './sequenceCommands.js';

/**
 * MIM's command table: W A S D for space, J K I L for the body.
 *
 * Rows are matched top-down, so the table reads from most committed to least:
 * four-button ultimate, story chords, supers, wall grammar, two-button
 * techniques, then the four normals.
 */
const MIM_BASE_COMMANDS: readonly CommandRow[] = [
  ...MIM_SUPER_COMMANDS.slice(0, 1),
  ...MIM_WALL_COMMANDS,
  ...MIM_SUPER_COMMANDS.slice(1),

  // Dual techniques — no direction, so they are what a bare button pair means.
  {
    moveId: MIM_MOVE_IDS.mirrorStrike,
    motion: 'none',
    button: 'lp',
    alsoPressed: ['lk'],
    forbiddenPressed: ['hp', 'hk'],
    stance: 'any',
  },
  {
    moveId: MIM_MOVE_IDS.vaultKnee,
    motion: 'none',
    button: 'lp',
    alsoPressed: ['hp'],
    forbiddenPressed: ['lk', 'hk'],
    stance: 'any',
  },
  {
    moveId: MIM_MOVE_IDS.acrobatKick,
    motion: 'none',
    button: 'lk',
    alsoPressed: ['hk'],
    forbiddenPressed: ['lp', 'hp'],
    stance: 'any',
  },
  {
    moveId: MIM_MOVE_IDS.butterflyKick,
    motion: 'none',
    button: 'hp',
    alsoPressed: ['hk'],
    forbiddenPressed: ['lp', 'lk'],
    stance: 'any',
  },

  // Utility. The throw pierces planes by design; the sweep is the crouching L.
  { moveId: MIM_MOVE_IDS.throwStart, motion: 'none', button: 'mimF', stance: 'any' },
  {
    moveId: MIM_MOVE_IDS.antiAir,
    motion: 'none',
    button: 'hp',
    forbiddenPressed: ['lp', 'lk', 'hk'],
    holdDirection: 'up',
    stance: 'any',
  },
  { moveId: MIM_MOVE_IDS.sweep, motion: 'none', button: 'hk', stance: 'crouching' },

  // Legacy single-key shortcuts for the wall specials.
  {
    moveId: MIM_SPECIAL_MOVE_IDS.invisibleWall,
    motion: 'none',
    button: 'mimR',
    forbiddenPressed: ['mimQ'],
    stance: 'any',
  },
  {
    moveId: MIM_SPECIAL_MOVE_IDS.wallLaunch,
    motion: 'none',
    button: 'mimE',
    forbiddenPressed: ['mimQ'],
    stance: 'any',
  },

  TAUNT_COMMAND,

  // The four normals: J, K, I, L.
  { moveId: MIM_MOVE_IDS.maskJab, motion: 'none', button: 'lp', stance: 'any' },
  { moveId: MIM_MOVE_IDS.backElbow, motion: 'none', button: 'lk', stance: 'any' },
  { moveId: MIM_MOVE_IDS.capoeiraKick, motion: 'none', button: 'hp', stance: 'any' },
  { moveId: MIM_MOVE_IDS.spinningKick, motion: 'none', button: 'hk', stance: 'any' },
];

export const MIM_COMMANDS = withSequenceCommands('mim', MIM_BASE_COMMANDS);
