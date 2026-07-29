import assert from 'node:assert/strict';
import test from 'node:test';
import {
  KADE_MOVES,
} from '../.sim-test-build/src/data/combat-moves.js';
import {
  fighterDefinition,
  makeEngine,
  makeMove,
} from './combat-test-utils.mjs';

test('fighter and input insertion order do not change simulation output', () => {
  const move = makeMove({
    active: 2,
    recovery: 2,
    hitstop: { attacker: 2, defender: 3 },
    hitstun: 12,
    knockback: { x: 160, y: 240 },
  });
  const p1 = fighterDefinition('p1', 1, 0, 1);
  const p2 = fighterDefinition('p2', 2, 1_200, -1);
  const first = makeEngine(move, { fighters: [p1, p2] });
  const second = makeEngine(move, { fighters: [p2, p1] });

  const firstEvents = [];
  const secondEvents = [];
  for (let frame = 0; frame < 30; frame += 1) {
    const firstInput =
      frame === 0
        ? { p1: { move: 'strike' }, p2: { move: 'strike' } }
        : {};
    const secondInput =
      frame === 0
        ? { p2: { move: 'strike' }, p1: { move: 'strike' } }
        : {};
    firstEvents.push(...first.tick(firstInput).events);
    secondEvents.push(...second.tick(secondInput).events);
  }
  assert.deepEqual(first.read(), second.read());
  assert.deepEqual(firstEvents, secondEvents);
});

test('production move table carries the authored frame data', () => {
  const frameData = Object.fromEntries(
    KADE_MOVES.map((move) => [
      move.id,
      [move.startup, move.active, move.recovery],
    ]),
  );
  assert.deepEqual(frameData, {
    '5L': [6, 2, 13],
    '5M': [9, 3, 22],
    '5H': [13, 4, 34],
    '2L': [5, 2, 14],
    '2M': [8, 3, 23],
    overtake: [16, 3, 33],
    xray: [18, 4, 158],
  });
});
