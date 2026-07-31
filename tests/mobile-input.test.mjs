import assert from 'node:assert/strict';
import test from 'node:test';
import { MobileInputController } from '../.sim-test-build/src/input/mobile-controller.js';

test('mobile input holds every control until its pointer is released', () => {
  const input = new MobileInputController();
  input.press(1, 'right');
  input.press(2, 'block');
  input.press(3, 'lp');

  assert.deepEqual([...input.read()].sort(), ['block', 'lp', 'right']);
  input.release(2);
  assert.deepEqual([...input.read()].sort(), ['lp', 'right']);
});

test('mobile input handles simultaneous duplicate touch pointers safely', () => {
  const input = new MobileInputController();
  input.press(1, 'left');
  input.press(2, 'left');
  input.release(1);

  assert.equal(input.isPressed('left'), true);
  input.release(2);
  assert.equal(input.isPressed('left'), false);
});

test('moving one pointer replaces its previous control', () => {
  const input = new MobileInputController();
  input.press(7, 'lp');
  input.press(7, 'ultimate');

  assert.equal(input.isPressed('lp'), false);
  assert.equal(input.isPressed('ultimate'), true);
});

test('releaseAll clears movement, attacks, and character controls', () => {
  const input = new MobileInputController();
  input.press(1, 'up');
  input.press(2, 'super');
  input.press(3, 'mimF');
  input.releaseAll();

  assert.deepEqual([...input.read()], []);
});
