import assert from 'node:assert/strict';
import test from 'node:test';
import {
  withOpponentFacing,
} from '../.sim-test-build/src/stage/fighterPresentation.js';

function fighter(id, x, facing) {
  return {
    id,
    team: id === 'p1' ? 1 : 2,
    health: 1_000,
    maxHealth: 1_000,
    position: { x, y: 0 },
    previousPosition: { x, y: 0 },
    velocity: { x: 0, y: 0 },
    facing,
    grounded: true,
    guarding: false,
    hitstop: 0,
    hitstun: 0,
    action: { moveId: 'strike', frame: 4, serial: 1 },
  };
}

test('attack presentation mirrors when fighters swap sides', () => {
  const p1 = fighter('p1', 1_200, 1);
  const p2 = fighter('p2', 0, -1);

  const mirroredP1 = withOpponentFacing(p1, p2);
  const mirroredP2 = withOpponentFacing(p2, p1);

  assert.equal(mirroredP1.facing, -1);
  assert.equal(mirroredP2.facing, 1);
  assert.equal(mirroredP1.action, p1.action);
  assert.equal(mirroredP2.action, p2.action);
});

test('presentation keeps simulation facing when fighters overlap', () => {
  const p1 = fighter('p1', 600, -1);
  const p2 = fighter('p2', 600, 1);

  assert.equal(withOpponentFacing(p1, p2), p1);
  assert.equal(withOpponentFacing(p2, p1), p2);
});
