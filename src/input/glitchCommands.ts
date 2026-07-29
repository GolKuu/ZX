import { GLITCH_MOVE_IDS } from '../data/glitch-combat-moves.js';
import type { CommandRow } from './command.js';

/**
 * GLITCH keeps the global four-button layout:
 * J = LP, K = HP, L = LK, U = HK.
 *
 * P in the reference sheet means either punch button, so light and heavy
 * command rows precede the normals that use those same buttons.
 */
export const GLITCH_COMMANDS: readonly CommandRow[] = [
  { moveId: GLITCH_MOVE_IDS.packetLoss, motion: 'qcf', button: 'lp', stance: 'any' },
  { moveId: GLITCH_MOVE_IDS.packetLoss, motion: 'qcf', button: 'hp', stance: 'any' },
  { moveId: GLITCH_MOVE_IDS.corruptedZone, motion: 'qcb', button: 'lp', stance: 'any' },
  { moveId: GLITCH_MOVE_IDS.corruptedZone, motion: 'qcb', button: 'hp', stance: 'any' },
  { moveId: GLITCH_MOVE_IDS.desyncJump, motion: 'dp', button: 'lp', stance: 'any' },
  { moveId: GLITCH_MOVE_IDS.desyncJump, motion: 'dp', button: 'hp', stance: 'any' },
  { moveId: GLITCH_MOVE_IDS.lp, motion: 'none', button: 'lp', stance: 'any' },
  { moveId: GLITCH_MOVE_IDS.hp, motion: 'none', button: 'hp', stance: 'any' },
  { moveId: GLITCH_MOVE_IDS.lk, motion: 'none', button: 'lk', stance: 'any' },
  { moveId: GLITCH_MOVE_IDS.hk, motion: 'none', button: 'hk', stance: 'any' },
];
