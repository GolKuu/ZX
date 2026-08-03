import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_BINDINGS,
  PLAYER_TWO_BINDINGS,
} from '../.sim-test-build/src/input/bindings.js';
import { ARENAS, DEFAULT_ARENA } from '../.sim-test-build/src/data/arenas.js';
import { isPracticeMode, ROUNDS_TO_WIN } from '../.sim-test-build/src/game/matchRules.js';

test('P1 exposes WASD plus the physical J K I L combat layout', () => {
  assert.deepEqual(
    [DEFAULT_BINDINGS.up, DEFAULT_BINDINGS.left, DEFAULT_BINDINGS.down, DEFAULT_BINDINGS.right],
    ['KeyW', 'KeyA', 'KeyS', 'KeyD'],
  );
  assert.deepEqual(
    [
      DEFAULT_BINDINGS.buttons.lp,
      DEFAULT_BINDINGS.buttons.lk,
      DEFAULT_BINDINGS.buttons.hp,
      DEFAULT_BINDINGS.buttons.hk,
    ],
    ['KeyJ', 'KeyK', 'KeyI', 'KeyL'],
  );
});

test('P2 exposes arrows plus a visible 1 2 4 5 numpad cluster', () => {
  assert.deepEqual(
    [PLAYER_TWO_BINDINGS.up, PLAYER_TWO_BINDINGS.left, PLAYER_TWO_BINDINGS.down, PLAYER_TWO_BINDINGS.right],
    ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'],
  );
  assert.deepEqual(
    [
      PLAYER_TWO_BINDINGS.buttons.lp,
      PLAYER_TWO_BINDINGS.buttons.lk,
      PLAYER_TWO_BINDINGS.buttons.hp,
      PLAYER_TWO_BINDINGS.buttons.hk,
    ],
    ['Numpad1', 'Numpad2', 'Numpad4', 'Numpad5'],
  );
});

test('stage flow always has a valid neutral default and readable metadata', () => {
  assert.ok(ARENAS.some((arena) => arena.id === DEFAULT_ARENA));
  assert.ok(ARENAS.length >= 3);
  for (const arena of ARENAS) {
    assert.ok(arena.name.length > 3);
    assert.ok(arena.note.length > 20);
  }
});

test('default match is best of three and practice modes use an idle dummy', () => {
  assert.equal(ROUNDS_TO_WIN, 2);
  assert.equal(isPracticeMode('training'), true);
  assert.equal(isPracticeMode('tutorial'), true);
  assert.equal(isPracticeMode('local'), false);
  assert.equal(isPracticeMode('ai'), false);
});
