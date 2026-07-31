import assert from 'node:assert/strict';
import test from 'node:test';
import { MIM_MOVES } from '../.sim-test-build/src/data/mim-moves.js';
import {
  mimAnimationBeat,
} from '../.sim-test-build/src/stage/mim/mimSpriteTimeline.js';

test('every MIM attack uses four approach frames, impact, and four return frames', () => {
  const normals = new Set(['mim.jab', 'mim.elbow', 'mim.capoeira', 'mim.spin']);
  for (const move of MIM_MOVES.filter(({ id }) => normals.has(id))) {
    const beats = Array.from(
      { length: move.startup + move.active + move.recovery },
      (_, frame) => mimAnimationBeat(move.id, frame),
    );
    const approach = uniqueAmounts(beats, 'approach');
    const returning = uniqueAmounts(beats, 'return');
    const strikes = beats.filter((beat) => beat?.phase === 'strike');

    assert.deepEqual(approach, [0.25, 0.5, 0.75, 1], move.id);
    assert.deepEqual(returning, [0.75, 0.5, 0.25, 0], move.id);
    assert.equal(strikes.length, move.active, move.id);
  }
});

function uniqueAmounts(beats, phase) {
  return [...new Set(
    beats
      .filter((beat) => beat?.phase === phase)
      .map((beat) => beat.amount),
  )];
}
