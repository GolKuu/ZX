import assert from 'node:assert/strict';
import test from 'node:test';

import {
  InputBuffer,
  KADE_COMMANDS,
  BUTTON_BIT,
  matchesMotion,
  detectMotion,
  resolveCommand,
  toFacingRelative,
  resolveDirection,
  DEFAULT_BINDINGS,
  AttackButtonGate,
} from '../.sim-test-build/src/input/core.js';

/** Feed a sequence of [direction, buttonNames[]] pairs, one per frame. */
function feed(buffer, frames) {
  for (const [direction, buttons = []] of frames) {
    let mask = 0;
    for (const button of buttons) {
      mask |= BUTTON_BIT[button];
    }
    buffer.push(direction, mask);
  }
  return buffer;
}

test('resolveDirection collapses opposing horizontals to neutral', () => {
  const both = new Set([DEFAULT_BINDINGS.left, DEFAULT_BINDINGS.right]);
  assert.equal(resolveDirection(both, DEFAULT_BINDINGS), 5);

  const forwardDown = new Set([DEFAULT_BINDINGS.right, DEFAULT_BINDINGS.down]);
  assert.equal(resolveDirection(forwardDown, DEFAULT_BINDINGS), 3);
});

test('directions mirror when facing left so motions are authored once', () => {
  assert.equal(toFacingRelative(6, 1), 6);
  assert.equal(toFacingRelative(6, -1), 4);
  assert.equal(toFacingRelative(3, -1), 1);
  assert.equal(toFacingRelative(2, -1), 2);
});

test('buffer reports press edges, not held state', () => {
  const buffer = new InputBuffer();
  feed(buffer, [
    [5, []],
    [5, ['lp']],
    [5, ['lp']],
  ]);
  assert.equal(buffer.framesSincePress('lp'), 1);
  assert.equal(buffer.isHeld('lp'), true);
});

test('quarter-circle forward is recognised', () => {
  const buffer = new InputBuffer();
  feed(buffer, [
    [5, []],
    [2, []],
    [3, []],
    [6, []],
  ]);
  assert.equal(matchesMotion(buffer, 'qcf'), true);
  assert.equal(matchesMotion(buffer, 'qcb'), false);
});

test('quarter-circle tolerates dropped intermediate frames', () => {
  const buffer = new InputBuffer();
  feed(buffer, [
    [2, []],
    [2, []],
    [3, []],
    [3, []],
    [6, []],
  ]);
  assert.equal(matchesMotion(buffer, 'qcf'), true);
});

test('walking forward alone is not a quarter-circle', () => {
  const buffer = new InputBuffer();
  feed(buffer, [
    [6, []],
    [6, []],
    [6, []],
    [6, []],
  ]);
  assert.equal(matchesMotion(buffer, 'qcf'), false);
});

test('a motion that exceeds its window is rejected', () => {
  const buffer = new InputBuffer();
  const frames = [[2, []], [3, []]];
  for (let index = 0; index < 24; index += 1) {
    frames.push([5, []]);
  }
  frames.push([6, []]);
  feed(buffer, frames);
  assert.equal(matchesMotion(buffer, 'qcf'), false);
});

test('half-circle back is not reported as the quarter-circle inside it', () => {
  const buffer = new InputBuffer();
  feed(buffer, [
    [6, []],
    [3, []],
    [2, []],
    [1, []],
    [4, []],
  ]);
  assert.equal(matchesMotion(buffer, 'hcb'), true);
  assert.equal(detectMotion(buffer), 'hcb');
});

test('dragon-punch motion is distinct from quarter-circle forward', () => {
  const buffer = new InputBuffer();
  feed(buffer, [
    [6, []],
    [2, []],
    [3, []],
  ]);
  assert.equal(matchesMotion(buffer, 'dp'), true);
});

test('double-down requires the stick to return to neutral', () => {
  const held = new InputBuffer();
  feed(held, [
    [2, []],
    [2, []],
    [2, []],
  ]);
  assert.equal(matchesMotion(held, 'dd'), false);

  const tapped = new InputBuffer();
  feed(tapped, [
    [2, []],
    [5, []],
    [2, []],
  ]);
  assert.equal(matchesMotion(tapped, 'dd'), true);
});

test('special beats the normal that shares its button', () => {
  const buffer = new InputBuffer();
  feed(buffer, [
    [2, []],
    [3, []],
    [6, []],
    [6, ['hp']],
  ]);
  const resolved = resolveCommand(buffer, KADE_COMMANDS);
  assert.equal(resolved?.moveId, 'overtake');
  assert.equal(resolved?.motion, 'qcf');
});

test('the same button without a motion yields the normal', () => {
  const buffer = new InputBuffer();
  feed(buffer, [
    [5, []],
    [5, ['hp']],
  ]);
  assert.equal(resolveCommand(buffer, KADE_COMMANDS)?.moveId, '5H');
});

test('the dedicated special button starts Overtake without a motion', () => {
  const buffer = new InputBuffer();
  feed(buffer, [
    [5, []],
    [5, ['special']],
  ]);
  assert.equal(resolveCommand(buffer, KADE_COMMANDS)?.moveId, 'overtake');
});

test('crouching selects the crouching normal', () => {
  const buffer = new InputBuffer();
  feed(buffer, [
    [2, []],
    [2, ['lp']],
  ]);
  assert.equal(resolveCommand(buffer, KADE_COMMANDS)?.moveId, '2L');
});

test('a press older than the leeway window no longer commits a move', () => {
  const buffer = new InputBuffer();
  const frames = [[5, ['lp']]];
  for (let index = 0; index < 10; index += 1) {
    frames.push([5, []]);
  }
  feed(buffer, frames);
  assert.equal(resolveCommand(buffer, KADE_COMMANDS), null);
});

test('rolling the stick after the press does not register the motion', () => {
  const buffer = new InputBuffer();
  feed(buffer, [
    [5, ['hp']],
    [2, []],
    [3, []],
    [6, []],
  ]);
  const resolved = resolveCommand(buffer, KADE_COMMANDS);
  assert.equal(resolved?.moveId, '5H');
  assert.equal(resolved?.motion, 'none');
});

test('identical frame sequences resolve identically', () => {
  const frames = [
    [5, []],
    [2, []],
    [3, []],
    [6, ['lp']],
  ];
  const first = resolveCommand(feed(new InputBuffer(), frames), KADE_COMMANDS);
  const second = resolveCommand(feed(new InputBuffer(), frames), KADE_COMMANDS);
  assert.deepEqual(first, second);
});

test('attack gate rejects mashing and requires release after animation', () => {
  const gate = new AttackButtonGate();
  const attackAndGuard = BUTTON_BIT.hp | BUTTON_BIT.block;

  assert.equal(gate.filter(attackAndGuard, true), BUTTON_BIT.block);
  assert.equal(gate.filter(attackAndGuard, false), BUTTON_BIT.block);
  assert.equal(gate.filter(BUTTON_BIT.block, false), BUTTON_BIT.block);
  assert.equal(gate.filter(attackAndGuard, false), attackAndGuard);
});
