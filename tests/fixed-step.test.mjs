import assert from 'node:assert/strict';
import test from 'node:test';
import {
  FixedStepRunner,
  SIMULATION_FPS,
} from '../.sim-test-build/src/sim/index.js';

test('fixed-step runner simulates only complete 60 Hz frames', () => {
  const inputs = [];
  const runner = new FixedStepRunner((input) => inputs.push(input));

  const first = runner.advance(8, (step) => `first-${step}`);
  assert.equal(first.simulatedSteps, 0);
  const second = runner.advance(9, (step) => `second-${step}`);
  assert.equal(second.simulatedSteps, 1);
  assert.deepEqual(inputs, ['second-0']);
  assert.equal(SIMULATION_FPS, 60);
  assert.ok(second.interpolationAlpha > 0);
  assert.ok(second.interpolationAlpha < 1);
});

test('fixed-step runner caps catch-up and explicitly reports dropped frames', () => {
  let ticks = 0;
  const runner = new FixedStepRunner(() => {
    ticks += 1;
  }, 5);
  const result = runner.advance(1_000, () => undefined);
  assert.equal(result.simulatedSteps, 5);
  assert.equal(result.droppedSteps, 55);
  assert.equal(result.interpolationAlpha, 0);
  assert.equal(ticks, 5);
});
