import assert from 'node:assert/strict';
import test from 'node:test';

import { isAttackInputLocked } from '../.sim-test-build/src/game/attackInputPolicy.js';

const moves = [
  {
    id: 'starter',
    startup: 2,
    active: 2,
    recovery: 4,
    hitboxes: [],
    cancels: [
      {
        frames: { from: 2, toExclusive: 8 },
        into: ['follow'],
      },
    ],
  },
];

function fighter(overrides = {}) {
  return {
    id: 'p1',
    team: 1,
    health: 100,
    maxHealth: 100,
    position: { x: 0, y: 0 },
    previousPosition: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    facing: 1,
    grounded: true,
    guarding: false,
    hitstop: 0,
    hitstun: 0,
    action: null,
    ...overrides,
  };
}

test('attack input is open only in neutral or an authored contact cancel', () => {
  assert.equal(isAttackInputLocked(fighter(), moves, undefined), false);

  const active = fighter({
    action: { moveId: 'starter', frame: 3, serial: 9 },
  });
  assert.equal(isAttackInputLocked(active, moves, undefined), true);
  assert.equal(isAttackInputLocked(active, moves, 9), false);
  assert.equal(
    isAttackInputLocked({ ...active, hitstop: 1 }, moves, 9),
    true,
  );
  assert.equal(
    isAttackInputLocked(
      fighter({ action: { moveId: 'starter', frame: 1, serial: 9 } }),
      moves,
      9,
    ),
    true,
  );
});

test('hitstun rejects attack input so it cannot be queued for wake-up', () => {
  assert.equal(
    isAttackInputLocked(fighter({ hitstun: 4 }), moves, undefined),
    true,
  );
});
