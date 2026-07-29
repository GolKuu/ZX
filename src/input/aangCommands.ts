import type { CommandRow } from './command.js';

/**
 * Element Sage controls. Normal rows are semantic inputs; CombatSession maps
 * them to the selected element before the simulation sees them.
 */
export const AANG_COMMANDS: readonly CommandRow[] = [
  { moveId: 'avatar-state', motion: 'qcb2', button: 'special', stance: 'any' },
  { moveId: 'elemental-cocoon', motion: 'qcf2', button: 'lp', stance: 'any' },
  { moveId: 'elemental-cocoon', motion: 'qcf2', button: 'hp', stance: 'any' },

  { moveId: 'element-shift-air', motion: 'dd', button: 'lp', stance: 'any' },
  { moveId: 'element-shift-fire', motion: 'dd', button: 'hp', stance: 'any' },
  { moveId: 'element-shift-earth', motion: 'dd', button: 'lk', stance: 'any' },
  { moveId: 'element-shift-water', motion: 'dd', button: 'hk', stance: 'any' },

  { moveId: 'air-squall', motion: 'qcf', button: 'lp', stance: 'any' },
  { moveId: 'air-squall', motion: 'qcf', button: 'hp', stance: 'any' },
  { moveId: 'earth-wall', motion: 'qcb', button: 'lk', stance: 'any' },
  { moveId: 'earth-wall', motion: 'qcb', button: 'hk', stance: 'any' },
  { moveId: 'water-diagonal', motion: 'dp', button: 'lp', stance: 'any' },
  { moveId: 'water-diagonal', motion: 'dp', button: 'hp', stance: 'any' },

  { moveId: 'aang-input-lp', motion: 'none', button: 'lp', stance: 'any' },
  { moveId: 'aang-input-hp', motion: 'none', button: 'hp', stance: 'any' },
  { moveId: 'aang-input-lk', motion: 'none', button: 'lk', stance: 'any' },
  { moveId: 'aang-input-hk', motion: 'none', button: 'hk', stance: 'any' },
];
