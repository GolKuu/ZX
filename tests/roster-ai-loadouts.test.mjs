import test from 'node:test';

import { validateAiLoadout } from '../.sim-test-build/src/ai/validation.js';
import { KADE_AI_LOADOUT } from '../.sim-test-build/src/data/combat-ai.js';
import { KADE_MOVES } from '../.sim-test-build/src/data/combat-moves.js';
import {
  GLITCH_AI_LOADOUT,
  glitchAiLoadout,
} from '../.sim-test-build/src/data/glitch-ai.js';
import {
  GLITCH_MOVES,
} from '../.sim-test-build/src/data/glitch-combat-moves.js';
import {
  GLITCH_SUPER_MOVES,
} from '../.sim-test-build/src/data/glitch-super-moves.js';
import {
  LUCKY_AI_LOADOUT,
  LUCKY_MOVES,
  LUCKY_SPECIAL_MOVES,
  LUCKY_SUPER_MOVES,
} from '../.sim-test-build/src/data/lucky/index.js';
import {
  TITAN_AI_LOADOUT,
  TITAN_ALL_MOVES,
} from '../.sim-test-build/src/data/titan/index.js';
import {
  VORGH_AI_LOADOUTS,
  VORGH_MOVES,
} from '../.sim-test-build/src/data/vorgh/index.js';

function moveMap(moves) {
  return new Map(moves.map((move) => [move.id, move]));
}

test('every roster AI loadout follows authored cancel windows', () => {
  validateAiLoadout(KADE_AI_LOADOUT, moveMap(KADE_MOVES));

  const glitchMoves = moveMap([...GLITCH_MOVES, ...GLITCH_SUPER_MOVES]);
  validateAiLoadout(GLITCH_AI_LOADOUT, glitchMoves);
  for (const difficulty of ['easy', 'normal', 'hard', 'impossible', 'story']) {
    validateAiLoadout(glitchAiLoadout(difficulty), glitchMoves);
  }

  validateAiLoadout(
    LUCKY_AI_LOADOUT,
    moveMap([...LUCKY_MOVES, ...LUCKY_SPECIAL_MOVES, ...LUCKY_SUPER_MOVES]),
  );
  validateAiLoadout(TITAN_AI_LOADOUT, moveMap(TITAN_ALL_MOVES));

  const vorghMoves = moveMap(VORGH_MOVES);
  for (const loadout of Object.values(VORGH_AI_LOADOUTS)) {
    validateAiLoadout(loadout, vorghMoves);
  }
});
