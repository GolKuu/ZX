import assert from 'node:assert/strict';
import test from 'node:test';
import { spriteAttackFrame } from '../.sim-test-build/src/stage/sprite2d/spriteAttackTimeline.js';

test('Lucky attacks expose all nine readable animation beats', () => {
  const move = { startup: 10, active: 4, recovery: 14 };
  const frames = Array.from(
    { length: move.startup + move.active + move.recovery },
    (_, frame) => spriteAttackFrame(frame, move),
  );

  assert.deepEqual([...new Set(frames)], [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  assert.equal(frames.filter((frame) => frame === 4).length, move.active);
});
