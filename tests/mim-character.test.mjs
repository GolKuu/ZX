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
import {
  MIM_SPECIAL_MOVES,
  MIM_SPECIAL_MOVE_IDS,
} from '../.sim-test-build/src/data/mim-special-moves.js';

const expectedByButton = {
  lp: MIM_MOVE_IDS.maskJab,
  hp: MIM_MOVE_IDS.capoeiraKick,
  lk: MIM_MOVE_IDS.backElbow,
  hk: MIM_MOVE_IDS.spinningKick,
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
    [...new Set(Object.values(MIM_MOVE_IDS))],
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
  assert.equal(resolvePress('super', 34)?.moveId, MIM_SUPER_MOVE_IDS.falseOpening);
  assert.equal(resolvePress('super', 100)?.moveId, MIM_SUPER_MOVE_IDS.mirrorArena);
});

test('MIM ALT+F4 waits for the low-health ultimate unlock', () => {
  assert.equal(resolvePress('ultimate', 100)?.moveId, undefined);
  assert.equal(
    resolvePress('ultimate', 100, true)?.moveId,
    MIM_SUPER_MOVE_IDS.perfectBox,
  );
});

test('MIM owns dedicated E R F specials and Q modifier supers', () => {
  assert.equal(resolveMimPress('mimR')?.moveId, MIM_SPECIAL_MOVE_IDS.invisibleWall);
  assert.equal(resolveMimPress('mimE')?.moveId, MIM_SPECIAL_MOVE_IDS.wallLaunch);
  assert.equal(resolveMimPress('mimF')?.moveId, MIM_MOVE_IDS.throwStart);
  assert.equal(
    resolveMimPress('mimE', ['mimQ'], 34)?.moveId,
    MIM_SUPER_MOVE_IDS.falseOpening,
  );
  assert.equal(
    resolveMimPress('mimR', ['mimQ'], 100)?.moveId,
    MIM_SUPER_MOVE_IDS.mirrorArena,
  );
  assert.equal(
    resolveMimPress('mimF', ['mimQ'], 99, true)?.moveId,
    MIM_MOVE_IDS.throwStart,
  );
  assert.equal(
    resolveMimPress('mimF', ['mimQ'], 100, true)?.moveId,
    MIM_SUPER_MOVE_IDS.perfectBox,
  );
});

test('MIM specials preserve normals and keep fake opening harmless', () => {
  assert.deepEqual(
    MIM_SPECIAL_MOVES.map(({ id }) => id),
    [...new Set(Object.values(MIM_SPECIAL_MOVE_IDS))],
  );
  const fake = MIM_SPECIAL_MOVES.find(
    ({ id }) => id === MIM_SPECIAL_MOVE_IDS.fakeOpening,
  );
  const trap = MIM_SPECIAL_MOVES.find(
    ({ id }) => id === MIM_SPECIAL_MOVE_IDS.bananaTrap,
  );
  assert.equal(fake?.hitboxes.length, 0);
  assert.equal(trap?.hitboxes.length, 0);
});

test('MIM wall blocks crossing during active frames and breaks in one hit', () => {
  const wallMove = MIM_SPECIAL_MOVES.find(
    ({ id }) => id === MIM_SPECIAL_MOVE_IDS.invisibleWall,
  );
  assert.equal(wallMove?.walls?.[0]?.integrity, 2);
  assert.equal(wallMove?.walls?.[0]?.runnable, true);
});

test('MIM supers have authored cinematic hit data', () => {
  assert.deepEqual(
    MIM_SUPER_MOVES.map(({ id }) => id),
    [
      MIM_SUPER_MOVE_IDS.mirrorArena,
      MIM_SUPER_MOVE_IDS.falseOpening,
      'mim.super.false-opening.counter',
      MIM_SUPER_MOVE_IDS.perfectBox,
      'mim.ultimate.perfect-box.sequence',
    ],
  );
  for (const move of MIM_SUPER_MOVES) {
    assert.ok(move.startup >= 4);
    assert.ok(move.recovery >= 16);
    assert.ok(move.hitboxes.every(({ hit }) => hit.block === undefined));
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

function resolveMimPress(
  button,
  heldButtons = [],
  superMeter = 0,
  ultimateReady = false,
) {
  const held = heldButtons.reduce(
    (mask, heldButton) => mask | BUTTON_BIT[heldButton],
    BUTTON_BIT[button],
  );
  const buffer = new InputBuffer();
  buffer.push(5, heldButtons.reduce(
    (mask, heldButton) => mask | BUTTON_BIT[heldButton],
    0,
  ));
  buffer.push(5, held);
  return resolveCommand(buffer, MIM_COMMANDS, {
    grounded: true,
    stanceId: null,
    gauge: 0,
    superMeter,
    ultimateReady,
  });
}
