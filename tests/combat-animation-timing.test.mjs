import assert from 'node:assert/strict';
import test from 'node:test';
import { ALL_COMBAT_MOVES } from '../.sim-test-build/src/data/allMoves.js';
import { totalMoveFrames } from '../.sim-test-build/src/sim/index.js';
import { combatAnimationProgress, isStrikeFrame } from '../.sim-test-build/src/stage/combatAnimationProgress.js';

test('every roster move reaches visual contact on its real active frame', () => {
  for (const move of ALL_COMBAT_MOVES) {
    if (move.active <= 0) continue;
    assert.equal(combatAnimationProgress(move.id, move.startup), .34, move.id);
    assert.equal(isStrikeFrame(move.id, move.startup), true, move.id);
    assert.equal(isStrikeFrame(move.id, move.startup + move.active), false, move.id);
    assert.equal(combatAnimationProgress(move.id, move.startup + move.active), .58, move.id);
    if (move.recovery > 1) {
      assert.equal(combatAnimationProgress(move.id, totalMoveFrames(move) - 1), 1, move.id);
    }
  }
});
