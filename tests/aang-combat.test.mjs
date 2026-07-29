import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AangCombatController,
} from '../.sim-test-build/src/aang/combat/elements.js';
import {
  AANG_COMMANDS,
  BUTTON_BIT,
  InputBuffer,
  resolveCommand,
} from '../.sim-test-build/src/input/core.js';
import {
  AANG_NORMAL_MOVES,
} from '../.sim-test-build/src/data/aang-combat-moves.js';

function push(buffer, direction, buttons = []) {
  const mask = buttons.reduce(
    (value, button) => value | BUTTON_BIT[button],
    0,
  );
  buffer.push(direction, mask);
}

test('double-down plus attack selects each element before normal resolution', () => {
  const buffer = new InputBuffer();
  push(buffer, 2);
  push(buffer, 5);
  push(buffer, 2);
  push(buffer, 2, ['hp']);
  assert.equal(
    resolveCommand(buffer, AANG_COMMANDS)?.moveId,
    'element-shift-fire',
  );
});

test('J and K resolve to the selected element light and heavy punches', () => {
  const published = [];
  const controller = new AangCombatController((element) => published.push(element));
  controller.resolve({ move: 'element-shift-water' });
  assert.equal(controller.resolve({ move: 'aang-input-lp' }).move, 'water-lp');
  assert.equal(controller.resolve({ move: 'aang-input-hp' }).move, 'water-hp');
  assert.deepEqual(published, ['water']);
  controller.reset();
  assert.equal(controller.resolve({ move: 'aang-input-lp' }).move, 'air-lp');
});

test('the four styles have distinct combat properties', () => {
  const move = (id) => AANG_NORMAL_MOVES.find((entry) => entry.id === id);
  assert.ok(move('air-lp').recovery < move('earth-lp').recovery);
  assert.ok(
    move('water-hp').hitboxes[0].boxes[0].offset.x
      > move('fire-hp').hitboxes[0].boxes[0].offset.x,
  );
  assert.equal(move('fire-lp').hitboxes[0].hit.block.chipDamage, 4);
  assert.equal(move('earth-hk').hitboxes[0].hit.groundBounce.count, 1);
});
