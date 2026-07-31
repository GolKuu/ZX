import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BUTTON_BIT,
  InputBuffer,
  LUCKY_COMMANDS,
  resolveCommand,
} from '../.sim-test-build/src/input/core.js';
import { LuckLedger } from '../.sim-test-build/src/data/lucky/luck.js';
import { MeterLedger } from '../.sim-test-build/src/hud/meterLedger.js';
import { LUCKY_MOVES, LUCKY_MOVE_IDS } from '../.sim-test-build/src/data/lucky/moves.js';
import { LUCKY_SPECIAL_IDS } from '../.sim-test-build/src/data/lucky/specials.js';
import { LUCKY_SPECIAL_MOVES } from '../.sim-test-build/src/data/lucky/specials.js';
import {
  LUCKY_JACKPOT_STREAK_ID,
  LUCKY_SUPER_IDS,
  LUCKY_SUPER_MOVES,
} from '../.sim-test-build/src/data/lucky/supers.js';
import { validateMoves } from '../.sim-test-build/src/sim/move-validation.js';
import { CombatEngine } from '../.sim-test-build/src/sim/combat-engine.js';
import { fixed } from '../.sim-test-build/src/sim/math.js';

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

test('air normals and real throws are reachable from commands', () => {
  assert.equal(resolvePress('lp', 0, 0, false, false)?.moveId, LUCKY_MOVE_IDS.airLight);
  const groundThrow = LUCKY_MOVES.find(({ id }) => id === LUCKY_MOVE_IDS.throw);
  const airThrow = LUCKY_MOVES.find(({ id }) => id === LUCKY_MOVE_IDS.airThrow);
  assert.equal(groundThrow?.grapple?.kind, 'normal');
  assert.equal(groundThrow?.hitboxes[0]?.hit.block, undefined);
  assert.equal(airThrow?.grapple?.targetSize, 'airborne');
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
  const enhanced = LUCKY_SPECIAL_MOVES.find(
    ({ id }) => id === LUCKY_SPECIAL_IDS.enhancedStrike,
  );
  assert.equal(enhanced?.minimumResource, 25);
  assert.equal(enhanced?.resourceCost, 25);
});

test('the authoritative engine rejects unpaid enhanced moves and spends once', () => {
  assert.equal(startEnhancedWith(24).action, null);
  const paid = startEnhancedWith(25);
  assert.equal(paid.action?.moveId, LUCKY_SPECIAL_IDS.enhancedStrike);
  assert.equal(paid.resource, 0);
});

test('all Lucky move geometry and multi-hit supers validate', () => {
  assert.doesNotThrow(() => validateMoves([
    ...LUCKY_MOVES,
    ...LUCKY_SPECIAL_MOVES,
    ...LUCKY_SUPER_MOVES,
  ]));
  assert.equal(LUCKY_SUPER_MOVES[0]?.hitboxes.length, 5);
  assert.equal(
    LUCKY_SUPER_MOVES.find(
      ({ id }) => id === LUCKY_SUPER_IDS.impossibleOutcome,
    )?.hitboxes.length,
    7,
  );
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

test('Lucky Guard rewards only the visible three-frame perfect window', () => {
  const ledger = new LuckLedger();
  ledger.accept([blocked(false), blocked(true)]);
  assert.equal(ledger.charge('p1'), 4);
});

test('supers and ultimate keep explicit resource gates', () => {
  assert.equal(resolvePress('super', 0, 33)?.moveId, undefined);
  assert.equal(
    resolvePress('super', 0, 34)?.moveId,
    LUCKY_SUPER_IDS.winningStreak,
  );
  assert.equal(
    resolvePress('super', 75, 34)?.moveId,
    LUCKY_JACKPOT_STREAK_ID,
  );
  const house = LUCKY_SUPER_MOVES.find(
    ({ id }) => id === LUCKY_SUPER_IDS.houseAdvantage,
  );
  assert.equal(house?.status?.recoveryPercent, 78);
  assert.ok((house?.status?.cancelInto?.length ?? 0) >= 6);
  assert.equal(resolvePress('ultimate', 75, 100, false)?.moveId, undefined);
  assert.equal(
    resolvePress('ultimate', 75, 100, true)?.moveId,
    LUCKY_SUPER_IDS.impossibleOutcome,
  );
  const meter = new MeterLedger();
  meter.accept([started(LUCKY_SUPER_IDS.impossibleOutcome)]);
  assert.equal(meter.ultimateUsed('p1'), true);
  assert.equal(meter.isUltimateReady('p1', 1, 100), false);
});

function resolvePress(
  button,
  gauge = 0,
  superMeter = 0,
  ultimateReady = false,
  grounded = true,
) {
  const buffer = new InputBuffer();
  buffer.push(5, 0);
  buffer.push(5, BUTTON_BIT[button]);
  return resolveCommand(
    buffer,
    LUCKY_COMMANDS,
    context(gauge, superMeter, ultimateReady, grounded),
  );
}

function resolveQcf(button, gauge, enhanced) {
  const modifier = enhanced ? BUTTON_BIT.super : 0;
  const buffer = new InputBuffer();
  buffer.push(2, modifier);
  buffer.push(3, modifier);
  buffer.push(6, modifier | BUTTON_BIT[button]);
  return resolveCommand(buffer, LUCKY_COMMANDS, context(gauge));
}

function context(gauge, superMeter = 0, ultimateReady = false, grounded = true) {
  return { grounded, stanceId: null, gauge, superMeter, ultimateReady };
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

function blocked(perfect) {
  return {
    type: 'block',
    frame: 1,
    attackerId: 'p2',
    defenderId: 'p1',
    moveId: 'test',
    hitId: 'mid',
    position: { x: 0, y: 0 },
    perfect,
    painGuard: false,
  };
}

function startEnhancedWith(initial) {
  const move = LUCKY_SPECIAL_MOVES.find(
    ({ id }) => id === LUCKY_SPECIAL_IDS.enhancedStrike,
  );
  const fighter = (id, team, x, facing, resource) => ({
    id,
    team,
    maxHealth: 100,
    spawn: { x: fixed(x), y: 0 },
    facing,
    hurtboxes: [{
      offset: { x: 0, y: fixed(0.8) },
      halfSize: { x: fixed(0.3), y: fixed(0.8) },
    }],
    resource: { maximum: 100, initial: resource, damageTakenPercent: 0 },
  });
  const engine = new CombatEngine({
    moves: [move],
    fighters: [fighter('p1', 1, -2, 1, initial), fighter('p2', 2, 2, -1, 0)],
    world: { leftWall: fixed(-5), rightWall: fixed(5) },
  });
  return engine.tick({ p1: { move: LUCKY_SPECIAL_IDS.enhancedStrike } })
    .state.fighters[0];
}
