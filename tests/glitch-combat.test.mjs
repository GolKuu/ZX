import assert from 'node:assert/strict';
import { test } from 'node:test';

import { BUTTON_BIT } from '../.sim-test-build/src/input/bindings.js';
import { InputBuffer } from '../.sim-test-build/src/input/buffer.js';
import { resolveCommand } from '../.sim-test-build/src/input/command.js';
import { GLITCH_COMMANDS } from '../.sim-test-build/src/input/glitchCommands.js';
import {
  GLITCH_ANIMATION_SPEED,
  GLITCH_MOVE_IDS,
  GLITCH_MOVES,
} from '../.sim-test-build/src/data/glitch-combat-moves.js';

const NEUTRAL = 5;
const DOWN = 2;
const DOWN_FORWARD = 3;
const FORWARD = 6;
const DOWN_BACK = 1;
const BACK = 4;

function play(directions, button) {
  const buffer = new InputBuffer();
  buffer.push(NEUTRAL, 0);
  for (const direction of directions) buffer.push(direction, 0);
  buffer.push(directions.at(-1) ?? NEUTRAL, BUTTON_BIT[button]);
  return resolveCommand(buffer, GLITCH_COMMANDS)?.moveId;
}

test('GLITCH maps all four attack buttons to unique normals', () => {
  assert.equal(play([], 'lp'), GLITCH_MOVE_IDS.lp);
  assert.equal(play([], 'hp'), GLITCH_MOVE_IDS.hp);
  assert.equal(play([], 'lk'), GLITCH_MOVE_IDS.lk);
  assert.equal(play([], 'hk'), GLITCH_MOVE_IDS.hk);
});

test('Packet Loss resolves on quarter-circle forward plus punch', () => {
  assert.equal(
    play([DOWN, DOWN_FORWARD, FORWARD], 'lp'),
    GLITCH_MOVE_IDS.packetLoss,
  );
});

test('Corrupted Zone resolves on quarter-circle back plus punch', () => {
  assert.equal(
    play([DOWN, DOWN_BACK, BACK], 'hp'),
    GLITCH_MOVE_IDS.corruptedZone,
  );
});

test('Desync Jump resolves on dragon-punch motion plus punch', () => {
  assert.equal(
    play([FORWARD, DOWN, DOWN_FORWARD], 'lp'),
    GLITCH_MOVE_IDS.desyncJump,
  );
});

test('every GLITCH move has active combat data', () => {
  assert.equal(GLITCH_MOVES.length, Object.keys(GLITCH_MOVE_IDS).length);
  for (const move of GLITCH_MOVES) {
    assert.ok(move.startup > 0);
    assert.ok(move.active > 0);
    assert.ok(move.recovery > 0);
    assert.ok(move.hitboxes.length > 0, `${move.id} needs a hitbox`);
  }
});

test('GLITCH combat phases use MIM animation cadence', () => {
  assert.equal(GLITCH_ANIMATION_SPEED, 1);
  assert.deepEqual(
    GLITCH_MOVES.map(({ id, startup, active, recovery }) => ({
      id,
      startup,
      active,
      recovery,
    })),
    [
      { id: GLITCH_MOVE_IDS.lp, startup: 4, active: 2, recovery: 10 },
      { id: GLITCH_MOVE_IDS.hp, startup: 15, active: 5, recovery: 30 },
      { id: GLITCH_MOVE_IDS.lk, startup: 7, active: 3, recovery: 17 },
      { id: GLITCH_MOVE_IDS.hk, startup: 14, active: 5, recovery: 28 },
      {
        id: GLITCH_MOVE_IDS.packetLoss,
        startup: 18,
        active: 8,
        recovery: 26,
      },
      {
        id: GLITCH_MOVE_IDS.corruptedZone,
        startup: 23,
        active: 10,
        recovery: 31,
      },
      {
        id: GLITCH_MOVE_IDS.desyncJump,
        startup: 11,
        active: 4,
        recovery: 24,
      },
    ],
  );
});
