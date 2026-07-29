import assert from 'node:assert/strict';
import test from 'node:test';
import {
  fighterDefinition,
  makeEngine,
  makeMove,
  readFighter,
} from './combat-test-utils.mjs';

test('relative movement respects facing and forward/backward speeds', () => {
  const engine = makeEngine(makeMove());
  const forward = engine.tick({
    p1: { movement: 1 },
    p2: { movement: 1 },
  });
  assert.equal(readFighter(forward.state, 'p1').position.x, 65);
  assert.equal(readFighter(forward.state, 'p2').position.x, 1_135);

  const backward = engine.tick({
    p1: { movement: -1 },
    p2: { movement: -1 },
  });
  assert.equal(readFighter(backward.state, 'p1').position.x, 12);
  assert.equal(readFighter(backward.state, 'p2').position.x, 1_188);
});

test('guard converts an incoming hit into blockstun without damage', () => {
  const move = makeMove({
    damage: 30,
    block: {
      blockstun: 7,
      hitstop: { attacker: 2, defender: 3 },
      knockback: { x: 40, y: 0 },
    },
  });
  const engine = makeEngine(move);
  const result = engine.tick({
    p1: { move: 'strike' },
    p2: { guard: true },
  });
  const defender = readFighter(result.state, 'p2');
  assert.equal(result.events.some((event) => event.type === 'block'), true);
  assert.equal(result.events.some((event) => event.type === 'hit'), false);
  assert.equal(defender.health, 100);
  assert.equal(defender.hitstun, 7);
  assert.equal(defender.hitstop, 3);
  assert.equal(defender.guarding, true);
});

test('a confirmed hit can cancel through an authored combo window', () => {
  const starter = makeMove({
    id: 'starter',
    recovery: 10,
    cancels: [
      {
        frames: { from: 0, toExclusive: 11 },
        into: ['follow'],
      },
    ],
  });
  const follow = makeMove({ id: 'follow' });
  const engine = makeEngine(starter, { moves: [starter, follow] });

  engine.tick({ p1: { move: 'starter' } });
  const cancel = engine.tick({ p1: { move: 'follow' } });
  assert.equal(readFighter(cancel.state, 'p1').action.moveId, 'follow');
  assert.equal(readFighter(cancel.state, 'p2').health, 80);
  assert.equal(
    cancel.events.some(
      (event) => event.type === 'moveStarted' && event.moveId === 'follow',
    ),
    true,
  );
});

test('guard only protects the side the fighter is facing', () => {
  const move = makeMove({
    block: {
      blockstun: 7,
      hitstop: { attacker: 0, defender: 0 },
      knockback: { x: 0, y: 0 },
    },
  });
  const engine = makeEngine(move, {
    fighters: [
      fighterDefinition('p1', 1, 1_200, -1),
      fighterDefinition('p2', 2, 0, -1),
    ],
  });
  const result = engine.tick({
    p1: { move: 'strike' },
    p2: { guard: true },
  });
  assert.equal(result.events.some((event) => event.type === 'hit'), true);
  assert.equal(readFighter(result.state, 'p2').health, 90);
});
