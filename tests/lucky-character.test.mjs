import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BUTTON_BIT,
  InputBuffer,
  LUCKY_COMMANDS,
  resolveCommand,
} from '../.sim-test-build/src/input/core.js';
import { LuckLedger } from '../.sim-test-build/src/data/lucky/luck.js';
import { LUCKY_MOVES, LUCKY_MOVE_IDS } from '../.sim-test-build/src/data/lucky/moves.js';
import { LUCKY_SPECIAL_IDS } from '../.sim-test-build/src/data/lucky/specials.js';
import { LUCKY_SUPER_IDS } from '../.sim-test-build/src/data/lucky/supers.js';

const expectedNormals = {
  lp: LUCKY_MOVE_IDS.quickDraw,
  lk: LUCKY_MOVE_IDS.loadedShoulder,
  hp: LUCKY_MOVE_IDS.slidingBet,
  hk: LUCKY_MOVE_IDS.fortuneHeel,
};

test('Lucky has four distinct standing normals on J K I L', () => {
  for (const [button, moveId] of Object.entries(expectedNormals)) {
    assert.equal(resolvePress(button)?.moveId, moveId);
  }
  assert.equal(new Set(Object.values(expectedNormals)).size, 4);
});

test('Lucky authored frames match the brief', () => {
  const expected = {
    [LUCKY_MOVE_IDS.quickDraw]: [5, 3, 9],
    [LUCKY_MOVE_IDS.loadedShoulder]: [10, 4, 14],
    [LUCKY_MOVE_IDS.slidingBet]: [12, 5, 16],
    [LUCKY_MOVE_IDS.fortuneHeel]: [15, 5, 17],
  };
  for (const move of LUCKY_MOVES.slice(0, 4)) {
    assert.deepEqual(
      [move.startup, move.active, move.recovery],
      expected[move.id],
    );
  }
});

test('enhanced routes are visible, gated and spend deterministic Luck', () => {
  assert.equal(resolveQcf('hp', 24, true)?.moveId, undefined);
  assert.equal(
    resolveQcf('hp', 25, true)?.moveId,
    LUCKY_SPECIAL_IDS.enhancedStrike,
  );
  const ledger = new LuckLedger();
  ledger.accept(Array.from({ length: 5 }, (_, index) => hit(index)));
  assert.equal(ledger.charge('p1'), 40);
  ledger.accept([started(LUCKY_SPECIAL_IDS.enhancedStrike)]);
  assert.equal(ledger.charge('p1'), 15);
});

test('Luck clamps at Jackpot and never enables a hidden instant win', () => {
  const ledger = new LuckLedger();
  ledger.accept(Array.from({ length: 20 }, (_, index) => hit(index)));
  assert.equal(ledger.charge('p1'), 100);
  ledger.accept([started(LUCKY_SPECIAL_IDS.enhancedRush)]);
  assert.equal(ledger.charge('p1'), 25);
  assert.ok(!LUCKY_MOVES.some((move) => move.hitboxes.some(
    (box) => box.hit.damage >= 900,
  )));
});

test('supers and ultimate keep explicit resource gates', () => {
  assert.equal(resolvePress('super', 0, 33)?.moveId, undefined);
  assert.equal(
    resolvePress('super', 0, 34)?.moveId,
    LUCKY_SUPER_IDS.winningStreak,
  );
  assert.equal(resolvePress('ultimate', 74, 100, false)?.moveId, undefined);
  assert.equal(
    resolvePress('ultimate', 75, 100, false)?.moveId,
    LUCKY_SUPER_IDS.impossibleOutcome,
  );
});

function resolvePress(button, gauge = 0, superMeter = 0, ultimateReady = false) {
  const buffer = new InputBuffer();
  buffer.push(5, 0);
  buffer.push(5, BUTTON_BIT[button]);
  return resolveCommand(buffer, LUCKY_COMMANDS, context(gauge, superMeter, ultimateReady));
}

function resolveQcf(button, gauge, enhanced) {
  const modifier = enhanced ? BUTTON_BIT.super : 0;
  const buffer = new InputBuffer();
  buffer.push(2, modifier);
  buffer.push(3, modifier);
  buffer.push(6, modifier | BUTTON_BIT[button]);
  return resolveCommand(buffer, LUCKY_COMMANDS, context(gauge));
}

function context(gauge, superMeter = 0, ultimateReady = false) {
  return { grounded: true, stanceId: null, gauge, superMeter, ultimateReady };
}

function hit(frame) {
  return {
    type: 'hit',
    frame,
    attackerId: 'p1',
    defenderId: 'p2',
    moveId: LUCKY_MOVE_IDS.loadedShoulder,
    hitId: 'mid',
    damage: 70,
    position: { x: 0, y: 0 },
  };
}

function started(moveId) {
  return { type: 'moveStarted', frame: 1, fighterId: 'p1', moveId };
}
