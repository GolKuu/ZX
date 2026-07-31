import assert from 'node:assert/strict';
import test from 'node:test';

import {
  VORGH_HURTBOXES,
  VORGH_MOVES,
  VORGH_RESOURCE,
  VORGH_SPECIAL_IDS,
} from '../.sim-test-build/src/data/vorgh/index.js';
import { CombatEngine } from '../.sim-test-build/src/sim/combat-engine.js';
import { fixed } from '../.sim-test-build/src/sim/math.js';

test('Pain-to-Power gives bounded Rage after a real hurt reaction', () => {
  const engine = duel();
  const hit = connect(engine, 'probe-heavy');
  const vorgh = fighter(hit.state, 'vorgh');
  assert.equal(vorgh.health, 950);
  assert.ok(vorgh.hitstun > 0);
  assert.ok(vorgh.resource >= 18 && vorgh.resource <= 23);
  assert.ok(vorgh.resource < 100);
});

test('Perfect Block and Pain Guard have limited, distinct rewards', () => {
  const perfectEngine = duel();
  const perfect = connect(perfectEngine, 'probe-heavy', { guard: true });
  const perfectVorgh = fighter(perfect.state, 'vorgh');
  assert.equal(perfect.events.find(({ type }) => type === 'block')?.perfect, true);
  assert.equal(perfectVorgh.resource, 4);

  const painEngine = duel(45);
  const pain = connect(painEngine, 'probe-heavy', { guard: true, guardMode: 'pain' });
  const painBlock = pain.events.find(({ type }) => type === 'block');
  assert.equal(painBlock?.painGuard, true);
  assert.ok(fighter(pain.state, 'vorgh').resource <= 47);
  assert.ok(fighter(pain.state, 'vorgh').health < 1050);
});

test('Guard break removes Rage and locks Pain-to-Power gain', () => {
  const engine = duel(60);
  const broken = connect(engine, 'probe-breaker', { guard: true, guardMode: 'pain' });
  const vorgh = fighter(broken.state, 'vorgh');
  assert.ok(broken.events.some(({ type }) => type === 'guardBreak'));
  assert.equal(vorgh.resource, 35);
  assert.equal(vorgh.resourceLockFrames, 180);
  assert.ok(vorgh.hitstun >= 36);
});

test('armour is one-hit and keeps meaningful damage', () => {
  const engine = duel();
  engine.tick({ vorgh: { move: VORGH_SPECIAL_IDS.berserkDash } });
  for (let frame = 0; frame < 7; frame += 1) engine.tick();
  const result = connect(engine, 'probe-heavy');
  assert.ok(result.events.some(({ type }) => type === 'armourAbsorbed'));
  assert.equal(fighter(result.state, 'vorgh').health, 975);
  assert.equal(fighter(result.state, 'vorgh').action?.moveId, VORGH_SPECIAL_IDS.berserkDash);
});

test('standing and crouching guard obey high-low rules', () => {
  const standingLow = connect(duel(), 'probe-low', { guard: true });
  assert.ok(standingLow.events.some(({ type }) => type === 'hit'));
  const crouchingHigh = connect(
    duel(),
    'probe-high',
    { guard: true, crouching: true },
  );
  assert.ok(crouchingHigh.events.some(({ type }) => type === 'hit'));
  const crouchingLow = connect(
    duel(),
    'probe-low',
    { guard: true, crouching: true },
  );
  assert.ok(crouchingLow.events.some(({ type }) => type === 'block'));
});

function duel(initialResource = 0) {
  return new CombatEngine({
    moves: [
      ...VORGH_MOVES,
      probe('probe-heavy'),
      probe('probe-breaker', true),
      probe('probe-low', false, 'low'),
      probe('probe-high', false, 'high'),
    ],
    fighters: [
      {
        id: 'vorgh', team: 1, maxHealth: 1050,
        spawn: { x: fixed(0), y: 0 }, facing: 1,
        hurtboxes: VORGH_HURTBOXES,
        resource: { ...VORGH_RESOURCE, initial: initialResource },
      },
      {
        id: 'enemy', team: 2, maxHealth: 1000,
        spawn: { x: fixed(0.75), y: 0 }, facing: -1,
        hurtboxes: VORGH_HURTBOXES,
      },
    ],
  });
}

function probe(id, guardBreak = false, attackLevel = 'mid') {
  return {
    id, attackLevel, startup: 1, active: 2, recovery: 18,
    hitboxes: [{
      hitId: 'hit', frames: { from: 1, toExclusive: 3 },
      boxes: [{
        offset: { x: fixed(0.75), y: fixed(1.2) },
        halfSize: { x: fixed(0.55), y: fixed(0.7) },
      }],
      hit: {
        damage: 100, hitstop: { attacker: 4, defender: 6 }, hitstun: 24,
        knockback: { x: fixed(0.1), y: 0 },
        block: {
          blockstun: 14, hitstop: { attacker: 4, defender: 6 },
          knockback: { x: fixed(0.08), y: 0 },
          chipDamage: 10, guardDamage: 18, guardBreak,
        },
      },
    }],
  };
}

function connect(engine, move, vorghInput = {}) {
  engine.tick({ enemy: { move }, vorgh: vorghInput });
  return engine.tick({ vorgh: vorghInput });
}

function fighter(state, id) {
  return state.fighters.find((candidate) => candidate.id === id);
}
