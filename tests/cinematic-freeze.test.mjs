import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CinematicFreeze,
} from '../.sim-test-build/src/game/CinematicFreeze.js';

test('cinematic freeze consumes exactly the requested simulation frames', () => {
  const freeze = new CinematicFreeze();
  freeze.start(3);

  assert.equal(freeze.active, true);
  assert.equal(freeze.consume(), true);
  assert.equal(freeze.consume(), true);
  assert.equal(freeze.consume(), true);
  assert.equal(freeze.active, false);
  assert.equal(freeze.consume(), false);
});

test('a longer cinematic extends an active freeze and reset clears it', () => {
  const freeze = new CinematicFreeze();
  freeze.start(2);
  freeze.start(4);

  for (let frame = 0; frame < 3; frame += 1) {
    assert.equal(freeze.consume(), true);
  }
  assert.equal(freeze.active, true);
  freeze.reset();
  assert.equal(freeze.active, false);
});

test('cinematic freeze rejects invalid frame counts', () => {
  const freeze = new CinematicFreeze();
  assert.throws(() => freeze.start(-1), /non-negative/);
  assert.throws(() => freeze.start(1.5), /non-negative/);
});
