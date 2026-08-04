// The flat move table the engine is actually built with, mirroring
// `ALL_COMBAT_MOVES` in src/game/combatSetup.ts. That module cannot be imported
// here — it pulls in the zustand stores — so the lists are re-assembled from the
// same data modules. `every roster fighter appears in the flat move table` in
// progression.test.mjs fails if a character is added there and not here.
import { MIM_MOVES } from '../.sim-test-build/src/data/mim-moves.js';
import { MIM_SPECIAL_MOVES } from '../.sim-test-build/src/data/mim-special-moves.js';
import { MIM_SUPER_MOVES } from '../.sim-test-build/src/data/mim-super-moves.js';
import { GLITCH_MOVES } from '../.sim-test-build/src/data/glitch-combat-moves.js';
import { GLITCH_SUPER_MOVES } from '../.sim-test-build/src/data/glitch-super-moves.js';
import {
  LUCKY_MOVES,
  LUCKY_SPECIAL_MOVES,
  LUCKY_SUPER_MOVES,
} from '../.sim-test-build/src/data/lucky/index.js';
import { VORGH_MOVES } from '../.sim-test-build/src/data/vorgh/index.js';
import { TITAN_ALL_MOVES } from '../.sim-test-build/src/data/titan/index.js';
import { TAUNT_MOVES } from '../.sim-test-build/src/data/taunt-move.js';

export const ROSTER_MOVES = [
  ...MIM_MOVES,
  ...MIM_SPECIAL_MOVES,
  ...MIM_SUPER_MOVES,
  ...GLITCH_MOVES,
  ...GLITCH_SUPER_MOVES,
  ...LUCKY_MOVES,
  ...LUCKY_SPECIAL_MOVES,
  ...LUCKY_SUPER_MOVES,
  ...VORGH_MOVES,
  ...TITAN_ALL_MOVES,
  ...TAUNT_MOVES,
];
