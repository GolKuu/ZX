import assert from 'node:assert/strict';
import test from 'node:test';
import { DASH_FRAMES, DASH_SPEED_MULTIPLIER } from '../.sim-test-build/src/sim/dash.js';
import { makeEngine, makeMove, readFighter } from './combat-test-utils.mjs';

const FORWARD_SPEED = 65;
const BACKWARD_SPEED = 53;

test('a dash press covers ground faster than walking for a fixed length', () => {
  const engine = makeEngine(makeMove());
  const dash = engine.tick({ p1: { dash: 1 } });
  assert.equal(
    readFighter(dash.state, 'p1').position.x,
    FORWARD_SPEED * DASH_SPEED_MULTIPLIER,
  );
  assert.equal(readFighter(dash.state, 'p1').dashing, true);

  for (let frame = 1; frame < DASH_FRAMES; frame += 1) {
    engine.tick({ p1: {} });
  }
  const after = engine.tick({ p1: {} });
  assert.equal(
    readFighter(after.state, 'p1').position.x,
    FORWARD_SPEED * DASH_SPEED_MULTIPLIER * DASH_FRAMES,
    'the dash ends on its own after DASH_FRAMES and nothing carries on',
  );
  assert.equal(readFighter(after.state, 'p1').dashing, false);
});

test('a back dash uses the backward speed and the fighter facing', () => {
  const engine = makeEngine(makeMove());
  const dash = engine.tick({ p1: { dash: -1 }, p2: { dash: 1 } });
  assert.equal(
    readFighter(dash.state, 'p1').position.x,
    -BACKWARD_SPEED * DASH_SPEED_MULTIPLIER,
  );
  assert.equal(
    readFighter(dash.state, 'p2').position.x,
    1_200 - FORWARD_SPEED * DASH_SPEED_MULTIPLIER,
    'p2 faces left, so its forward dash moves it left',
  );
});

test('a dash cannot be steered or re-pressed mid-dash', () => {
  const engine = makeEngine(makeMove());
  engine.tick({ p1: { dash: 1 } });
  const steered = engine.tick({ p1: { movement: -1, dash: -1 } });
  assert.equal(
    readFighter(steered.state, 'p1').position.x,
    FORWARD_SPEED * DASH_SPEED_MULTIPLIER * 2,
  );
});

test('attacking, guarding and jumping all end a dash', () => {
  const attacker = makeEngine(makeMove({ startup: 4 }));
  attacker.tick({ p1: { dash: 1 } });
  const attacking = attacker.tick({ p1: { move: 'strike' } });
  assert.equal(readFighter(attacking.state, 'p1').dashing, false);

  const guarding = makeEngine(makeMove());
  guarding.tick({ p1: { dash: 1 } });
  assert.equal(
    readFighter(guarding.tick({ p1: { guard: true } }).state, 'p1').dashing,
    false,
  );

  const jumping = makeEngine(makeMove());
  jumping.tick({ p1: { dash: 1 } });
  const jumped = jumping.tick({ p1: { jump: true } });
  assert.equal(readFighter(jumped.state, 'p1').dashing, false);
  assert.equal(readFighter(jumped.state, 'p1').grounded, false);
});

test('being hit ends a dash and a bad dash value is rejected', () => {
  const engine = makeEngine(makeMove({ hitstun: 12 }));
  engine.tick({ p2: { dash: 1 } });
  const hit = engine.tick({ p1: { move: 'strike' } });
  assert.equal(readFighter(hit.state, 'p2').hitstun > 0, true);

  const stunned = engine.tick({});
  assert.equal(readFighter(stunned.state, 'p2').dashing, false);

  assert.throws(
    () => engine.tick({ p1: { dash: 2 } }),
    /Invalid dash input/,
  );
});
