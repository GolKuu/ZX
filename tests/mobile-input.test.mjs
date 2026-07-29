import assert from 'node:assert/strict';
import test from 'node:test';
import { MobileInputController } from '../.sim-test-build/src/input/mobile-controller.js';

test('mobile input holds movement and guard until their pointer is released', () => {
  const input = new MobileInputController();
  input.press(1, 'forward');
  input.press(2, 'guard');

  assert.deepEqual(input.read(), { movement: 1, guard: true });
  input.release(2);
  assert.deepEqual(input.read(), { movement: 1, guard: false });
  input.release(1);
  assert.deepEqual(input.read(), { movement: 0, guard: false });
});

test('mobile attack is emitted once on press rather than every held frame', () => {
  const input = new MobileInputController();
  input.press(7, 'heavy');

  assert.deepEqual(input.read(), {
    movement: 0,
    guard: false,
    move: '5H',
  });
  assert.deepEqual(input.read(), { movement: 0, guard: false });
});

test('mobile attacks tapped during animation are discarded, not queued', () => {
  const input = new MobileInputController();
  input.press(7, 'heavy');

  assert.deepEqual(input.read(true), { movement: 0, guard: false });
  assert.deepEqual(input.read(false), { movement: 0, guard: false });

  input.release(7);
  input.press(8, 'heavy');
  assert.equal(input.read(false).move, '5H');
});

test('mobile input handles simultaneous and duplicate touch pointers safely', () => {
  const input = new MobileInputController();
  input.press(1, 'back');
  input.press(2, 'forward');
  assert.equal(input.read().movement, 0);

  input.release(2);
  assert.equal(input.read().movement, -1);

  input.press(3, 'back');
  input.release(1);
  assert.equal(input.isPressed('back'), true);
  assert.equal(input.read().movement, -1);

  input.releaseAll();
  assert.deepEqual(input.read(), { movement: 0, guard: false });
});

test('mobile controls map every attack button to authored move ids', () => {
  const cases = [
    ['light', '5L'],
    ['medium', '5M'],
    ['heavy', '5H'],
    ['special', 'overtake'],
  ];

  for (const [control, move] of cases) {
    const input = new MobileInputController();
    input.press(1, control);
    assert.equal(input.read().move, move);
  }
});
