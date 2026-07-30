import assert from 'node:assert/strict';
import test from 'node:test';
import {
  mimSpritePoseFor,
} from '../.sim-test-build/src/stage/mim/mimSpritePose.js';

function fighter(overrides = {}) {
  return {
    id: 'p1',
    team: 0,
    health: 1_000,
    maxHealth: 1_000,
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

test('MIM neutral pose stays crouched in a living fighting stance', () => {
  const neutral = mimSpritePoseFor(fighter(), 0, null);
  assert.ok(neutral.lift < 0);
  assert.ok(neutral.leftLeg > 0);
  assert.ok(neutral.rightLeg < 0);
  assert.notEqual(neutral.scarf, 0);
});

test('MIM uses a full counter-swing at authored walking speed', () => {
  const time = Math.PI / (2 * 8.2);
  const neutral = mimSpritePoseFor(fighter(), time, null);
  const walking = mimSpritePoseFor(
    fighter({ velocity: { x: 65, y: 0 } }),
    time,
    null,
  );

  assert.ok(Math.abs(walking.leftLeg - neutral.leftLeg) > 0.3);
  assert.ok(Math.abs(walking.rightLeg - neutral.rightLeg) > 0.3);
  assert.ok(Math.abs(walking.leftArm - neutral.leftArm) > 0.18);
});
