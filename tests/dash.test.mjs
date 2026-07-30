import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DASH_FRAMES,
  DASH_SPEED_MULTIPLIER,
  LUNGE_FRAMES,
} from '../.sim-test-build/src/sim/dash.js';
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
  assert.equal(readFighter(dash.state, 'p1').dashFrames, DASH_FRAMES - 1);

  for (let frame = 1; frame < DASH_FRAMES; frame += 1) {
    engine.tick({ p1: {} });
  }
  const after = engine.tick({ p1: {} });
  assert.equal(
    readFighter(after.state, 'p1').position.x,
    FORWARD_SPEED * DASH_SPEED_MULTIPLIER * DASH_FRAMES,
    'the dash ends on its own after DASH_FRAMES and nothing carries on',
  );
  assert.equal(readFighter(after.state, 'p1').dashFrames, 0);
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
  assert.equal(readFighter(attacking.state, 'p1').dashFrames, 0);

  const guarding = makeEngine(makeMove());
  guarding.tick({ p1: { dash: 1 } });
  assert.equal(
    readFighter(guarding.tick({ p1: { guard: true } }).state, 'p1').dashFrames,
    0,
  );

  const jumping = makeEngine(makeMove());
  jumping.tick({ p1: { dash: 1 } });
  const jumped = jumping.tick({ p1: { jump: true } });
  assert.equal(readFighter(jumped.state, 'p1').dashFrames, 0);
  assert.equal(readFighter(jumped.state, 'p1').grounded, false);
});

test('an attack out of a dash keeps sliding; one out of a walk stops dead', () => {
  const lunging = makeEngine(makeMove({ startup: 6, recovery: 12 }));
  lunging.tick({ p1: { dash: 1 } });
  const start = readFighter(lunging.tick({ p1: { move: 'strike' } }).state, 'p1');
  const sliding = readFighter(lunging.tick({ p1: {} }).state, 'p1');
  assert.ok(
    sliding.position.x > start.position.x,
    'a dash attack should carry the fighter forward',
  );
  assert.ok(
    sliding.position.x - start.position.x < FORWARD_SPEED * DASH_SPEED_MULTIPLIER,
    'and do it slower than the dash itself',
  );

  const walking = makeEngine(makeMove({ startup: 6, recovery: 12 }));
  walking.tick({ p1: { movement: 1 } });
  const planted = readFighter(
    walking.tick({ p1: { movement: 1, move: 'strike' } }).state,
    'p1',
  );
  const stillPlanted = readFighter(walking.tick({ p1: { movement: 1 } }).state, 'p1');
  assert.equal(
    stillPlanted.position.x,
    planted.position.x,
    'an ordinary attack still roots the fighter in place',
  );
});

test('the lunge bleeds off instead of running for the whole move', () => {
  const engine = makeEngine(makeMove({ startup: 30, recovery: 30 }));
  engine.tick({ p1: { dash: 1 } });
  engine.tick({ p1: { move: 'strike' } });

  let previousStep = Number.POSITIVE_INFINITY;
  let previous = readFighter(engine.read(), 'p1').position.x;
  for (let frame = 0; frame < LUNGE_FRAMES; frame += 1) {
    const current = readFighter(engine.tick({ p1: {} }).state, 'p1').position.x;
    const step = current - previous;
    assert.ok(step < previousStep, `frame ${frame} should slow down`);
    previous = current;
    previousStep = step;
  }
  const settled = readFighter(engine.tick({ p1: {} }).state, 'p1').position.x;
  assert.equal(settled, previous, 'the slide ends inside the move');
});

test('being hit ends a dash and a bad dash value is rejected', () => {
  const engine = makeEngine(makeMove({ hitstun: 12 }));
  engine.tick({ p2: { dash: 1 } });
  const hit = engine.tick({ p1: { move: 'strike' } });
  assert.equal(readFighter(hit.state, 'p2').hitstun > 0, true);

  const stunned = engine.tick({});
  assert.equal(readFighter(stunned.state, 'p2').dashFrames, 0);

  assert.throws(
    () => engine.tick({ p1: { dash: 2 } }),
    /Invalid dash input/,
  );
});
