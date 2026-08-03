import assert from 'node:assert/strict';
import test from 'node:test';
import { comboDamagePercent } from '../.sim-test-build/src/sim/combo-scaling.js';

test('combo scaling preserves starters and decays to a safe floor', () => {
  assert.deepEqual(
    [0, 1, 2, 3, 4, 8].map(comboDamagePercent),
    [100, 100, 90, 83, 76, 55],
  );
});
