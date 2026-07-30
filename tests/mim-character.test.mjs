import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BUTTON_BIT,
  InputBuffer,
  MIM_COMMANDS,
  resolveCommand,
} from '../.sim-test-build/src/input/core.js';
import {
  MIM_MOVES,
  MIM_MOVE_IDS,
} from '../.sim-test-build/src/data/mim-moves.js';
import {
  MIM_SUPER_MOVES,
  MIM_SUPER_MOVE_IDS,
} from '../.sim-test-build/src/data/mim-super-moves.js';

const expectedByButton = {
  lp: MIM_MOVE_IDS.snap,
  hp: MIM_MOVE_IDS.cursor,
  lk: MIM_MOVE_IDS.banana,
  hk: MIM_MOVE_IDS.chair,
};

test('MIM owns one unique move for every attack button', () => {
  for (const [button, moveId] of Object.entries(expectedByButton)) {
    const buffer = new InputBuffer();
    buffer.push(5, 0);
    buffer.push(5, BUTTON_BIT[button]);
    assert.equal(resolveCommand(buffer, MIM_COMMANDS)?.moveId, moveId);
  }
});

test('MIM frame data contains four damaging, active attacks', () => {
  assert.deepEqual(
    MIM_MOVES.map(({ id }) => id),
    Object.values(MIM_MOVE_IDS),
  );
  for (const move of MIM_MOVES) {
    assert.ok(move.startup > 0);
    assert.ok(move.active > 0);
    assert.ok(move.recovery > 0);
    assert.ok((move.hitboxes[0]?.hit.damage ?? 0) > 0);
  }
});

test('MIM attacks preserve their intended reach order', () => {
  const reach = Object.fromEntries(MIM_MOVES.map((move) => [
    move.id,
    move.hitboxes[0].boxes[0].halfSize.x,
  ]));
  assert.ok(reach[MIM_MOVE_IDS.snap] < reach[MIM_MOVE_IDS.banana]);
  assert.ok(reach[MIM_MOVE_IDS.banana] < reach[MIM_MOVE_IDS.chair]);
});

test('MIM super button upgrades from prank to hero with the energy bar', () => {
  assert.equal(resolvePress('super', 33)?.moveId, undefined);
  assert.equal(resolvePress('super', 34)?.moveId, MIM_SUPER_MOVE_IDS.prank);
  assert.equal(resolvePress('super', 100)?.moveId, MIM_SUPER_MOVE_IDS.hero);
});

test('MIM ALT+F4 waits for the low-health ultimate unlock', () => {
  assert.equal(resolvePress('ultimate', 100)?.moveId, undefined);
  assert.equal(
    resolvePress('ultimate', 0, true)?.moveId,
    MIM_SUPER_MOVE_IDS.altF4,
  );
});

test('MIM supers have authored cinematic hit data', () => {
  assert.deepEqual(
    MIM_SUPER_MOVES.map(({ id }) => id),
    Object.values(MIM_SUPER_MOVE_IDS),
  );
  for (const move of MIM_SUPER_MOVES) {
    assert.ok(move.startup >= 14);
    assert.ok(move.recovery >= 100);
    assert.equal(move.hitboxes[0]?.hit.block, undefined);
  }
});

function resolvePress(button, superMeter, ultimateReady = false) {
  const buffer = new InputBuffer();
  buffer.push(5, 0);
  buffer.push(5, BUTTON_BIT[button]);
  return resolveCommand(buffer, MIM_COMMANDS, {
    grounded: true,
    stanceId: null,
    gauge: 0,
    superMeter,
    ultimateReady,
  });
}
