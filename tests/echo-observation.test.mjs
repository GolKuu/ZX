import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  createEchoObservation,
  observeOpponent,
} from '../.sim-test-build/src/stage/echo/echoObservation.js';

test('Echo confidence rises when an opponent repeats a move', () => {
  const memory = createEchoObservation();
  let readout = observeOpponent(memory, fighter(), 0.1);
  for (let serial = 1; serial <= 3; serial += 1) {
    readout = observeOpponent(
      memory,
      fighter({ action: action('opponent.hp', serial) }),
      0.35,
    );
  }
  assert.equal(readout.habit, 'repeat');
  assert.ok(readout.confidence >= 0.9);
  assert.ok(readout.lockPulse > 0);
});

test('Echo learns jump, guard and dash habits without combat changes', () => {
  const cases = [
    ['jump', { grounded: false }, { grounded: true }],
    ['guard', { guarding: true }, { guarding: false }],
    ['dash', { dashFrames: 6 }, { dashFrames: 0 }],
  ];
  for (const [habit, active, neutral] of cases) {
    const memory = createEchoObservation();
    observeOpponent(memory, fighter(neutral), 0.1);
    let readout;
    for (let index = 0; index < 3; index += 1) {
      readout = observeOpponent(memory, fighter(active), 0.25);
      observeOpponent(memory, fighter(neutral), 0.25);
    }
    assert.equal(readout.habit, habit);
    assert.ok(readout.habitStrength >= 0.65);
  }
});

test('Echo recognizes a consistent attack cadence', () => {
  const memory = createEchoObservation();
  let readout;
  for (let serial = 1; serial <= 4; serial += 1) {
    readout = observeOpponent(
      memory,
      fighter({ action: action(`opponent.move-${serial}`, serial) }),
      0.5,
    );
  }
  assert.equal(readout.habit, 'cadence');
  assert.equal(readout.habitStrength, 1);
});

function action(moveId, serial) {
  return { moveId, serial, frame: 0 };
}

function fighter(overrides = {}) {
  return {
    id: 'p2',
    team: 2,
    health: 1_000,
    maxHealth: 1_000,
    position: { x: 1_000, y: 0 },
    previousPosition: { x: 1_000, y: 0 },
    velocity: { x: 0, y: 0 },
    facing: -1,
    grounded: true,
    guarding: false,
    dashFrames: 0,
    hitstop: 0,
    hitstun: 0,
    action: null,
    ...overrides,
  };
}
