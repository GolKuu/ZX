import {
  MIM_LEVEL_ONE_COST,
  MIM_LEVEL_THREE_COST,
  MIM_SUPER_MOVE_IDS,
} from '../../data/mim-super-moves.js';
import type { CommandRow } from '../command.js';

/**
 * Supers and the ultimate.
 *
 * Perfect Box asks for all four buttons *and* the comeback gate *and* a full
 * bar; the brief's third condition — that the opening blow has to land — is
 * enforced by the move itself, which only continues into the cinematic on a
 * confirmed hit.
 */
export const MIM_SUPER_COMMANDS: readonly CommandRow[] = [
  {
    moveId: MIM_SUPER_MOVE_IDS.perfectBox,
    motion: 'none',
    button: 'lp',
    alsoPressed: ['lk', 'hp', 'hk'],
    stance: 'any',
    available: ({ superMeter, ultimateReady }) =>
      ultimateReady === true && superMeter >= MIM_LEVEL_THREE_COST,
  },
  {
    moveId: MIM_SUPER_MOVE_IDS.mirrorArena,
    motion: 'none',
    button: 'lp',
    alsoPressed: ['lk', 'hp'],
    forbiddenPressed: ['hk'],
    stance: 'any',
    available: ({ superMeter }) => superMeter >= MIM_LEVEL_ONE_COST,
  },
  {
    moveId: MIM_SUPER_MOVE_IDS.falseOpening,
    motion: 'none',
    button: 'lp',
    alsoPressed: ['lk', 'hk'],
    forbiddenPressed: ['hp'],
    stance: 'any',
    available: ({ superMeter }) => superMeter >= MIM_LEVEL_ONE_COST,
  },

  // Keyboard shortcuts kept from the previous layout, so a player who learned
  // Q/E/R/F does not lose access to the character.
  {
    moveId: MIM_SUPER_MOVE_IDS.perfectBox,
    motion: 'none',
    button: 'mimF',
    alsoPressed: ['mimQ'],
    stance: 'any',
    available: ({ superMeter, ultimateReady }) =>
      ultimateReady === true && superMeter >= MIM_LEVEL_THREE_COST,
  },
  {
    moveId: MIM_SUPER_MOVE_IDS.mirrorArena,
    motion: 'none',
    button: 'mimR',
    alsoPressed: ['mimQ'],
    stance: 'any',
    available: ({ superMeter }) => superMeter >= MIM_LEVEL_ONE_COST,
  },
  {
    moveId: MIM_SUPER_MOVE_IDS.falseOpening,
    motion: 'none',
    button: 'mimE',
    alsoPressed: ['mimQ'],
    stance: 'any',
    available: ({ superMeter }) => superMeter >= MIM_LEVEL_ONE_COST,
  },
  {
    moveId: MIM_SUPER_MOVE_IDS.perfectBox,
    motion: 'none',
    button: 'ultimate',
    stance: 'any',
    available: ({ superMeter, ultimateReady }) =>
      ultimateReady === true && superMeter >= MIM_LEVEL_THREE_COST,
  },
  {
    moveId: MIM_SUPER_MOVE_IDS.mirrorArena,
    motion: 'none',
    button: 'super',
    stance: 'any',
    available: ({ superMeter }) => superMeter >= MIM_LEVEL_THREE_COST,
  },
  {
    moveId: MIM_SUPER_MOVE_IDS.falseOpening,
    motion: 'none',
    button: 'super',
    stance: 'any',
    available: ({ superMeter }) => superMeter >= MIM_LEVEL_ONE_COST,
  },
];
