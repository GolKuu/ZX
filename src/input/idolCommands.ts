import { IDOL_MOVE_IDS } from '../data/idol-combat-moves.js';
import type { CommandRow } from './command.js';

export const IDOL_COMMANDS: readonly CommandRow[] = [
  { moveId: IDOL_MOVE_IDS.lp, motion: 'none', button: 'lp', stance: 'any' },
  { moveId: IDOL_MOVE_IDS.hp, motion: 'none', button: 'hp', stance: 'any' },
  { moveId: IDOL_MOVE_IDS.lk, motion: 'none', button: 'lk', stance: 'any' },
  { moveId: IDOL_MOVE_IDS.hk, motion: 'none', button: 'hk', stance: 'any' },
];
