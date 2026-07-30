import assert from 'node:assert/strict';
import { test } from 'node:test';

import { BUTTON_BIT } from '../.sim-test-build/src/input/bindings.js';
import { InputBuffer } from '../.sim-test-build/src/input/buffer.js';
import { resolveCommand } from '../.sim-test-build/src/input/command.js';
import { ECHO_COMMANDS } from '../.sim-test-build/src/input/echoCommands.js';
import { ECHO_MOVES } from '../.sim-test-build/src/data/echo-combat-moves.js';
import {
  ECHO_CINEMATIC_FREEZE_FRAMES,
  ECHO_SUPER_MOVES,
  ECHO_SUPER_MOVE_IDS,
} from '../.sim-test-build/src/data/echo-super-moves.js';

const BUTTONS = ['lp', 'hp', 'lk', 'hk'];

test('ECHO exposes all four diagram attacks on matching buttons', () => {
  for (const button of BUTTONS) {
    const buffer = new InputBuffer();
    buffer.push(5, 0);
    buffer.push(5, BUTTON_BIT[button]);
    assert.equal(
      resolveCommand(buffer, ECHO_COMMANDS)?.moveId,
      `echo.${button}`,
    );
  }
});

test('ECHO has distinct frame data for every attack', () => {
  assert.deepEqual(
    ECHO_MOVES.map(({ id }) => id),
    ['echo.lp', 'echo.hp', 'echo.lk', 'echo.hk'],
  );
  assert.ok(ECHO_MOVES.every(({ hitboxes }) => hitboxes.length === 1));
});

test('sweep stays low while forward kick reaches farther and higher', () => {
  const sweep = ECHO_MOVES.find(({ id }) => id === 'echo.lk');
  const kick = ECHO_MOVES.find(({ id }) => id === 'echo.hk');
  assert.ok(sweep);
  assert.ok(kick);
  const sweepBox = sweep.hitboxes[0].boxes[0];
  const kickBox = kick.hitboxes[0].boxes[0];
  assert.ok(sweepBox.offset.y < kickBox.offset.y);
  assert.ok(kickBox.offset.x > sweepBox.offset.x);
});

function superCommand(button, superMeter, ultimateReady = false) {
  const buffer = new InputBuffer();
  buffer.push(5, BUTTON_BIT.super);
  buffer.push(5, BUTTON_BIT.super | BUTTON_BIT[button]);
  return resolveCommand(buffer, ECHO_COMMANDS, {
    grounded: true,
    stanceId: null,
    gauge: 0,
    superMeter,
    ultimateReady,
  })?.moveId;
}

function ultimateCommand(superMeter, ultimateReady) {
  const buffer = new InputBuffer();
  buffer.push(5, BUTTON_BIT.ultimate);
  return resolveCommand(buffer, ECHO_COMMANDS, {
    grounded: true,
    stanceId: null,
    gauge: 0,
    superMeter,
    ultimateReady,
  })?.moveId;
}

test('ECHO supers use Super-held combos and respect meter levels', () => {
  assert.equal(superCommand('lp', 33), 'echo.lp');
  assert.equal(superCommand('lp', 34), ECHO_SUPER_MOVE_IDS.analysis);
  assert.equal(superCommand('hp', 100), ECHO_SUPER_MOVE_IDS.repeat);
  assert.equal(superCommand('hk', 100), 'echo.hk');
});

test('ECHO statistics needs the ultimate unlock, not energy', () => {
  assert.equal(ultimateCommand(100, false), undefined);
  assert.equal(ultimateCommand(0, true), ECHO_SUPER_MOVE_IDS.statistics);
});

test('ECHO supers encode the hologram swarm, copied combo, and finisher', () => {
  const byId = new Map(ECHO_SUPER_MOVES.map((move) => [move.id, move]));
  const analysis = byId.get(ECHO_SUPER_MOVE_IDS.analysis);
  const repeat = byId.get(ECHO_SUPER_MOVE_IDS.repeat);
  const statistics = byId.get(ECHO_SUPER_MOVE_IDS.statistics);

  assert.equal(analysis.hitboxes.length, 12);
  assert.equal(repeat.hitboxes.length, 7);
  assert.equal(statistics.hitboxes[0].hit.damage, 1_000);
  assert.ok(repeat.hitboxes.at(-1).hit.damage > repeat.hitboxes[0].hit.damage);
  assert.deepEqual(ECHO_CINEMATIC_FREEZE_FRAMES, {
    analysis: 150,
    repeat: 126,
    statistics: 220,
  });
});
