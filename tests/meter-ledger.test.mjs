import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isUltimateMove,
  superCostForMove,
} from '../.sim-test-build/src/data/meter-moves.js';
import { MIM_SUPER_MOVE_IDS } from '../.sim-test-build/src/data/mim-super-moves.js';
import { MeterLedger } from '../.sim-test-build/src/hud/meterLedger.js';
import {
  ULTIMATE_HEALTH_RATIO,
  ultimateReadyFromHealth,
} from '../.sim-test-build/src/hud/ultimateCharge.js';

function hit(attackerId, defenderId, moveId, damage) {
  return {
    type: 'hit',
    frame: 0,
    attackerId,
    defenderId,
    moveId,
    hitId: 'primary',
    damage,
    position: { x: 0, y: 0 },
  };
}

function moveStarted(fighterId, moveId) {
  return { type: 'moveStarted', frame: 0, fighterId, moveId };
}

test('supers cost energy, ultimates cost none', () => {
  assert.equal(superCostForMove('mim.super.prank'), 34);
  assert.equal(superCostForMove(MIM_SUPER_MOVE_IDS.hero), 100);
  assert.equal(superCostForMove(MIM_SUPER_MOVE_IDS.altF4), null);
  assert.equal(isUltimateMove(MIM_SUPER_MOVE_IDS.altF4), true);
  assert.equal(isUltimateMove(MIM_SUPER_MOVE_IDS.hero), false);
  assert.equal(superCostForMove('mim.snap'), null);
});

test('both fighters earn energy from a hit, the attacker more', () => {
  const ledger = new MeterLedger();
  ledger.accept([hit('p1', 'p2', 'mim.snap', 100)]);

  const attacker = ledger.charge('p1');
  const defender = ledger.charge('p2');
  assert.ok(attacker > defender, `${attacker} should beat ${defender}`);
  assert.ok(attacker > 0 && attacker < 100);
});

test('energy fills to the cap and never goes below zero', () => {
  const ledger = new MeterLedger();
  for (let index = 0; index < 20; index += 1) {
    ledger.accept([hit('p1', 'p2', 'mim.snap', 200)]);
  }
  assert.equal(ledger.charge('p1'), 100);

  ledger.accept([moveStarted('p1', MIM_SUPER_MOVE_IDS.hero)]);
  assert.equal(ledger.charge('p1'), 0);

  ledger.accept([moveStarted('p1', 'mim.super.prank')]);
  assert.equal(ledger.charge('p1'), 0);
});

test('supers and ultimates build no energy for the attacker', () => {
  const ledger = new MeterLedger();
  ledger.accept([hit('p1', 'p2', MIM_SUPER_MOVE_IDS.hero, 380)]);
  assert.equal(ledger.charge('p1'), 0);

  ledger.accept([hit('p1', 'p2', MIM_SUPER_MOVE_IDS.altF4, 1_000)]);
  assert.equal(ledger.charge('p1'), 0);
  assert.equal(ledger.charge('p2'), 0);
});

test('the ultimate unlocks at the health threshold and only once per round', () => {
  const ledger = new MeterLedger();
  const threshold = Math.round(1_000 * ULTIMATE_HEALTH_RATIO);

  assert.equal(ultimateReadyFromHealth(threshold + 1, 1_000), false);
  assert.equal(ultimateReadyFromHealth(threshold, 1_000), true);
  assert.equal(ledger.isUltimateReady('p1', threshold, 1_000), true);

  ledger.accept([moveStarted('p1', MIM_SUPER_MOVE_IDS.altF4)]);
  assert.equal(ledger.isUltimateReady('p1', threshold, 1_000), false);
  assert.equal(ledger.ultimateUsed('p1'), true);
  assert.equal(ledger.isUltimateReady('p2', threshold, 1_000), true);

  ledger.reset();
  assert.equal(ledger.isUltimateReady('p1', threshold, 1_000), true);
});
