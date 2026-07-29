import assert from 'node:assert/strict';
import { test } from 'node:test';

import { BUTTON_BIT } from '../.sim-test-build/src/input/bindings.js';
import { InputBuffer } from '../.sim-test-build/src/input/buffer.js';
import { resolveCommand } from '../.sim-test-build/src/input/command.js';
import { ECHO_COMMANDS } from '../.sim-test-build/src/input/echoCommands.js';
import { ECHO_MOVES } from '../.sim-test-build/src/data/echo-combat-moves.js';

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
