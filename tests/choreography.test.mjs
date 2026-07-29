import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  asAttackPose,
  beatAt,
  sequenceFitsMove,
  sequenceLength,
} from '../.sim-test-build/src/stage/model/choreography.js';
import { KADE_MOVES } from '../.sim-test-build/src/data/combat-moves.js';
import {
  BLADE_PHANTOM_CHOREOGRAPHY,
  VOID_WALKER_CHOREOGRAPHY,
} from '../.sim-test-build/src/stage/model/choreographySequences.js';

/** Minimal sequence: holds of 3, 1 (smear), 2. Total 6 frames. */
const SEQUENCE = {
  moveId: 'test',
  beats: [
    { name: 'a', hold: 3, pose: () => {} },
    { name: 'b', hold: 5, smear: true, pose: () => {} },
    { name: 'c', hold: 2, pose: () => {} },
  ],
};

test('sequence length sums holds, counting a smear as one frame', () => {
  // 3 + 1 (smear overrides its hold of 5) + 2
  assert.equal(sequenceLength(SEQUENCE), 6);
});

test('a beat is held for its whole duration, not interpolated', () => {
  // The point of the system: frames 0, 1 and 2 all show beat 'a'.
  assert.equal(beatAt(SEQUENCE, 0)?.beat.name, 'a');
  assert.equal(beatAt(SEQUENCE, 1)?.beat.name, 'a');
  assert.equal(beatAt(SEQUENCE, 2)?.beat.name, 'a');
  assert.equal(beatAt(SEQUENCE, 3)?.beat.name, 'b');
});

test('a smear lasts exactly one frame however long its hold claims', () => {
  assert.equal(beatAt(SEQUENCE, 3)?.beat.name, 'b');
  assert.equal(beatAt(SEQUENCE, 4)?.beat.name, 'c', 'smear is over after one frame');
});

test('progress within a beat runs 0 to just under 1', () => {
  assert.equal(beatAt(SEQUENCE, 0)?.within, 0);
  assert.ok(Math.abs((beatAt(SEQUENCE, 1)?.within ?? 0) - 1 / 3) < 1e-9);
  assert.ok(Math.abs((beatAt(SEQUENCE, 2)?.within ?? 0) - 2 / 3) < 1e-9);
});

test('past the end the final beat holds rather than snapping to idle', () => {
  assert.equal(beatAt(SEQUENCE, 6)?.beat.name, 'c');
  assert.equal(beatAt(SEQUENCE, 999)?.beat.name, 'c');
});

test('negative and fractional frames are handled without throwing', () => {
  assert.equal(beatAt(SEQUENCE, -5)?.beat.name, 'a');
  assert.equal(beatAt(SEQUENCE, 2.9)?.beat.name, 'a', 'floors to frame 2');
});

test('an empty sequence resolves to nothing instead of crashing', () => {
  assert.equal(beatAt({ moveId: 'empty', beats: [] }, 0), null);
  assert.equal(sequenceLength({ moveId: 'empty', beats: [] }), 0);
});

test('a zero hold still occupies one frame', () => {
  const degenerate = {
    moveId: 'zero',
    beats: [
      { name: 'a', hold: 0, pose: () => {} },
      { name: 'b', hold: 0, pose: () => {} },
    ],
  };
  assert.equal(sequenceLength(degenerate), 2);
  assert.equal(beatAt(degenerate, 0)?.beat.name, 'a');
  assert.equal(beatAt(degenerate, 1)?.beat.name, 'b');
});

/* ---------------------------------------------------------------- */
/* Frame accuracy — the bug this system was silently failing at      */
/* ---------------------------------------------------------------- */

test('asAttackPose maps progress onto real frames, not a normalised span', () => {
  const seen = [];
  const probe = {
    moveId: 'probe',
    beats: [
      { name: 'a', hold: 2, pose: () => seen.push('a') },
      { name: 'smear', hold: 1, smear: true, pose: () => seen.push('smear') },
      { name: 'b', hold: 3, pose: () => seen.push('b') },
    ],
  };
  const pose = asAttackPose(probe, 6);

  // Walk all six simulation frames as combatAnimationProgress would.
  for (let frame = 0; frame < 6; frame += 1) {
    const progress = frame / 5;
    pose(null, null, progress / 0.34, 0, 0);
  }

  // The smear must occupy exactly one of the six frames. Before the fix the
  // sequence was stretched across the move and it occupied several.
  assert.equal(seen.filter((name) => name === 'smear').length, 1);
  assert.deepEqual(seen, ['a', 'a', 'smear', 'b', 'b', 'b']);
});

test('authored sequences add up to the exact length of their move', () => {
  for (const sequence of [...BLADE_PHANTOM_CHOREOGRAPHY, ...VOID_WALKER_CHOREOGRAPHY]) {
    const move = KADE_MOVES.find(({ id }) => id === sequence.moveId);
    assert.ok(move, `${sequence.moveId} exists in the frame data`);
    const frames = move.startup + move.active + move.recovery;
    assert.equal(
      sequenceLength(sequence),
      frames,
      `${sequence.moveId}: beats sum to ${sequenceLength(sequence)}, move is ${frames}`,
    );
    assert.ok(sequenceFitsMove(sequence, frames));
  }
});
