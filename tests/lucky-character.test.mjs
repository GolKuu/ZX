/**
 * Lucky's gameplay contract: frame data, resources, defence and the engine's
 * agreement with all of it.
 *
 * The input side lives in `lucky-input.test.mjs`; this file is about what
 * happens after a command has been accepted.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  LUCK_MAX,
  LUCK_MODIFIERS,
  LUCK_TIERS,
  LuckModifierSlot,
  LuckRng,
  luckTier,
  luckyCostForMove,
  luckySpendingMoves,
} from '../.sim-test-build/src/data/lucky/luck.js';
import { LUCKY_CATALOGUE } from '../.sim-test-build/src/input/lucky/catalogue.js';
import {
  LUCKY_AERIAL_NORMALS,
  LUCKY_BACK_NORMALS,
  LUCKY_CROUCHING_NORMALS,
  LUCKY_DUAL_TECHNIQUES,
  LUCKY_FORWARD_NORMALS,
  LUCKY_MOVES,
  LUCKY_MOVE_IDS,
  LUCKY_STANDING_NORMALS,
  LUCKY_THROWS,
} from '../.sim-test-build/src/data/lucky/moves.js';
import { LUCKY_LUCK_IDS } from '../.sim-test-build/src/data/lucky/ids.js';
import {
  LUCKY_RESOURCE,
  LUCKY_STATS,
} from '../.sim-test-build/src/data/lucky/character.js';
import {
  LUCKY_SPECIAL_IDS,
  LUCKY_SPECIAL_MOVES,
} from '../.sim-test-build/src/data/lucky/specials.js';
import {
  LUCKY_JACKPOT_STREAK_ID,
  LUCKY_SUPER_IDS,
  LUCKY_SUPER_MOVES,
} from '../.sim-test-build/src/data/lucky/supers.js';
import { MeterLedger } from '../.sim-test-build/src/hud/meterLedger.js';
import { validateMoves } from '../.sim-test-build/src/sim/move-validation.js';
import { CombatEngine } from '../.sim-test-build/src/sim/combat-engine.js';
import { fixed } from '../.sim-test-build/src/sim/math.js';

const ALL_MOVES = [...LUCKY_MOVES, ...LUCKY_SPECIAL_MOVES, ...LUCKY_SUPER_MOVES];
const byId = (id) => ALL_MOVES.find((move) => move.id === id);

// ---------------------------------------------------------------- authoring

test('Lucky authored frames match the brief', () => {
  const expected = {
    [LUCKY_MOVE_IDS.quickDraw]: [5, 3, 9],
    [LUCKY_MOVE_IDS.loadedShoulder]: [10, 4, 14],
    [LUCKY_MOVE_IDS.slidingBet]: [12, 5, 16],
    [LUCKY_MOVE_IDS.fortuneHeel]: [15, 5, 17],
  };
  for (const [id, frames] of Object.entries(expected)) {
    const move = byId(id);
    assert.deepEqual([move?.startup, move?.active, move?.recovery], frames, id);
  }
});

test('Lucky carries the stat line the brief specifies', () => {
  assert.deepEqual({ ...LUCKY_STATS }, {
    health: 90, damage: 80, defense: 75, speed: 105, luck: 100, complexity: 7,
  });
});

test('all Lucky move geometry validates', () => {
  assert.doesNotThrow(() => { validateMoves(ALL_MOVES); });
});

test('every normal in each family has its own animation and geometry', () => {
  const families = [
    ['standing', LUCKY_STANDING_NORMALS],
    ['forward', LUCKY_FORWARD_NORMALS],
    ['back', LUCKY_BACK_NORMALS],
    ['crouching', LUCKY_CROUCHING_NORMALS],
  ];
  for (const [label, family] of families) {
    assert.equal(family.length, 4, `${label} needs four normals`);
    assert.equal(new Set(family.map((m) => m.id)).size, 4, label);
    // Distinct timing or distinct reach — never a copy of another normal.
    const shapes = family.map((m) => `${m.startup}/${m.active}/${m.recovery}`);
    assert.equal(new Set(shapes).size, 4, `${label} reuses a timing`);
  }
  assert.equal(LUCKY_AERIAL_NORMALS.length, 8);
  assert.equal(new Set(LUCKY_AERIAL_NORMALS.map((m) => m.id)).size, 8);
});

test('crouching normals keep their low profile and their guard level', () => {
  const sweep = byId(LUCKY_MOVE_IDS.sweepTheTable);
  assert.equal(sweep?.attackLevel, 'low');
  assert.ok(sweep?.hitboxes[0]?.hit.groundBounce, 'the sweep must knock down');
  const rising = byId(LUCKY_MOVE_IDS.risingHand);
  assert.equal(rising?.attackLevel, 'mid', 'the crouching anti-air is not a low');
});

// ------------------------------------------------------------ throws, duals

test('throws are real grapples with no block data', () => {
  for (const move of LUCKY_THROWS) {
    assert.notEqual(move.grapple, undefined, move.id);
    assert.equal(move.hitboxes[0]?.hit.block, undefined, move.id);
  }
  assert.equal(byId(LUCKY_MOVE_IDS.throw)?.grapple?.kind, 'normal');
  assert.equal(byId(LUCKY_MOVE_IDS.airThrow)?.grapple?.targetSize, 'airborne');
  assert.equal(byId(LUCKY_MOVE_IDS.backThrow)?.grapple?.kind, 'reposition');
});

test('J+I doubles as the throw escape', () => {
  const move = byId(LUCKY_MOVE_IDS.throw);
  assert.equal(move?.counter?.grappleOnly, true);
  assert.equal(move?.counter?.frames.toExclusive, move?.startup);
});

test('Dual Techniques are two-hit and cannot loop into themselves', () => {
  for (const move of LUCKY_DUAL_TECHNIQUES) {
    assert.equal(move.hitboxes.length, 2, move.id);
    const [first, second] = move.hitboxes;
    assert.equal(first?.hit.knockback.y, 0, 'only the second hit may launch');
    assert.ok(
      move.recovery > second.hit.hitstun,
      `${move.id} recovers slower than its own hitstun, so it cannot loop`,
    );
  }
});

// ---------------------------------------------------------------- defence

test('counter stances lose to throws', () => {
  for (const id of [
    LUCKY_MOVE_IDS.probabilityCounter,
    LUCKY_SPECIAL_IDS.riskyCounter,
    LUCKY_LUCK_IDS.guard,
  ]) {
    assert.equal(byId(id)?.counter?.strikeOnly, true, id);
  }
});

test('Lucky Guard is a read, not a shield', () => {
  const guard = byId(LUCKY_LUCK_IDS.guard);
  const window = guard.counter.frames.toExclusive - guard.counter.frames.from;
  assert.ok(window <= 3, 'the guard window must stay precise');
  assert.ok(
    guard.recovery > window * 4,
    'mashing Lucky Guard must leave a long vulnerable pose',
  );
  assert.equal(guard.hitboxes.length, 0, 'a successful read is not free damage');
  assert.equal(byId(LUCKY_LUCK_IDS.guardFailed)?.hitboxes.length, 0);
});

test('invulnerable windows are bounded and close before recovery does', () => {
  const invulnerable = ALL_MOVES.filter(
    (move) => move.hurtboxes?.some((window) => window.boxes.length === 0),
  );
  assert.ok(invulnerable.length >= 4, 'reversals should exist');
  for (const move of invulnerable) {
    const window = move.hurtboxes.find((entry) => entry.boxes.length === 0);
    const total = move.startup + move.active + move.recovery;
    assert.ok(window.frames.toExclusive < total, `${move.id} is never vulnerable`);
  }
});

// ----------------------------------------------------------------- resources

test('Luck is earned by playing well and never by being hit', () => {
  assert.equal(LUCKY_RESOURCE.damageTakenPercent, 0);
  assert.equal(LUCKY_RESOURCE.maximum, LUCK_MAX);
  assert.ok((LUCKY_RESOURCE.counterHitBonus ?? 0) > 0);
  assert.ok((LUCKY_RESOURCE.perfectBlockGain ?? 0) > 0);
  assert.ok(
    (LUCKY_RESOURCE.drainAtMaximumPerFrame ?? 0) > 0,
    'a parked Jackpot must not be permanently safe',
  );
});

test('the five Luck tiers cover 0 to 100 without a gap', () => {
  assert.equal(LUCK_TIERS.length, 5);
  assert.equal(luckTier(0).id, 'cold');
  assert.equal(luckTier(24).id, 'cold');
  assert.equal(luckTier(25).id, 'even');
  assert.equal(luckTier(74).id, 'warm');
  assert.equal(luckTier(75).id, 'loaded');
  assert.equal(luckTier(100).id, 'jackpot');
  for (let charge = 0; charge <= 100; charge += 1) {
    assert.notEqual(luckTier(charge), undefined, String(charge));
  }
});

test('no Lucky move generates the Luck it spends', () => {
  for (const id of luckySpendingMoves()) {
    const move = byId(id);
    assert.ok(
      (move?.resourceGainOnHit ?? 0) < (move?.resourceCost ?? 0),
      `${id} refunds its own cost`,
    );
  }
});

test('a move costs exactly what the move list prints', () => {
  for (const spec of LUCKY_CATALOGUE) {
    if (spec.luckCost === undefined) continue;
    assert.equal(
      luckyCostForMove(spec.moveId),
      spec.luckCost,
      `${spec.name} is printed at a price it does not charge`,
    );
  }
});

test('the engine spends Luck once and refuses an unpaid enhanced move', () => {
  assert.equal(startWith(LUCKY_SPECIAL_IDS.enhancedStrike, 24).action, null);
  const paid = startWith(LUCKY_SPECIAL_IDS.enhancedStrike, 25);
  assert.equal(paid.action?.moveId, LUCKY_SPECIAL_IDS.enhancedStrike);
  assert.equal(paid.resource, 0, 'the cost is deducted exactly once');

  const rich = startWith(LUCKY_SPECIAL_IDS.enhancedStrike, 100);
  assert.equal(rich.resource, 75);
});

test('the seeded generator replays identically and can be reset', () => {
  const first = new LuckRng(1234);
  const second = new LuckRng(1234);
  const draw = (rng) => Array.from({ length: 8 }, () => rng.next());
  assert.deepEqual(draw(first), draw(second));
  assert.notDeepEqual(draw(new LuckRng(1)), draw(new LuckRng(2)));

  const rng = new LuckRng(99);
  const before = draw(rng);
  rng.reset();
  assert.deepEqual(draw(rng), before);
  assert.equal(rng.seed, 99, 'the seed must be readable for the HUD');
});

test('a prepared modifier is visible, of the requested kind, and spent once', () => {
  const slot = new LuckModifierSlot(new LuckRng(7));
  assert.equal(slot.current, null);

  const defensive = slot.prepare('defense');
  assert.equal(defensive?.kind, 'defense', 'chance narrows, it never overrides');
  assert.equal(slot.current?.id, defensive?.id);
  assert.equal(slot.state(50).tier.id, 'warm');
  assert.equal(slot.state(50).prepared?.id, defensive?.id);
  assert.equal(slot.state(50).seed, 7);

  assert.equal(slot.consume()?.id, defensive?.id);
  assert.equal(slot.consume(), null, 'a modifier cannot be spent twice');

  slot.prepare('offense');
  slot.cancel();
  assert.equal(slot.current, null);
});

test('every Luck modifier states a bounded effect', () => {
  for (const modifier of LUCK_MODIFIERS) {
    assert.ok(modifier.label.length > 0, modifier.id);
    assert.ok(modifier.effect.length > 0, modifier.id);
    assert.ok(modifier.cost > 0, `${modifier.id} must not be free`);
  }
});

// ------------------------------------------------------- supers and ultimate

test('supers and the ultimate keep explicit, separate gates', () => {
  const house = byId(LUCKY_SUPER_IDS.houseAdvantage);
  assert.equal(house?.status?.recoveryPercent, 78);
  assert.ok((house?.status?.cancelInto?.length ?? 0) >= 6);
  assert.ok(byId(LUCKY_SUPER_IDS.winningStreak)?.hitboxes.length >= 5);
  assert.ok(byId(LUCKY_JACKPOT_STREAK_ID)?.hitboxes.length >= 5);
  assert.equal(byId(LUCKY_SUPER_IDS.impossibleOutcome)?.hitboxes.length, 7);
});

test('the ultimate is once per match and earns no meter back', () => {
  const meter = new MeterLedger();
  meter.accept([{
    type: 'moveStarted', frame: 1, fighterId: 'p1',
    moveId: LUCKY_SUPER_IDS.impossibleOutcome,
  }]);
  assert.equal(meter.ultimateUsed('p1'), true);
  assert.equal(meter.isUltimateReady('p1', 1, 100), false);
  for (const id of Object.values(LUCKY_SUPER_IDS)) {
    assert.equal(byId(id)?.resourceGainOnHit, 0, id);
  }
});

test('no Lucky move is an instant kill', () => {
  for (const move of ALL_MOVES) {
    const total = move.hitboxes.reduce((sum, box) => sum + box.hit.damage, 0);
    assert.ok(total < 900, `${move.id} deals ${String(total)} in one move`);
  }
});

// ----------------------------------------------------------------- engine

test('a round reset returns Luck to its starting value', () => {
  const engine = build(LUCKY_SPECIAL_IDS.enhancedStrike, 100);
  engine.tick({ p1: { move: LUCKY_SPECIAL_IDS.enhancedStrike } });
  const spent = engine.read().fighters[0].resource;
  assert.equal(spent, 75);
  const fresh = build(LUCKY_SPECIAL_IDS.enhancedStrike, 0);
  assert.equal(fresh.read().fighters[0].resource, 0);
});

test('holding the guard direction still walks backwards', () => {
  const engine = build(LUCKY_MOVE_IDS.quickDraw, 0);
  const start = engine.read().fighters[0].position.x;
  for (let i = 0; i < 10; i += 1) {
    engine.tick({ p1: { guard: true, guardWhileWalking: true, movement: -1 } });
  }
  const walked = engine.read().fighters[0].position.x;
  assert.ok(walked < start, 'a guarding Lucky must still retreat');

  // The default remains "guarding stands still" for every other character.
  const still = build(LUCKY_MOVE_IDS.quickDraw, 0);
  const from = still.read().fighters[0].position.x;
  for (let i = 0; i < 10; i += 1) {
    still.tick({ p1: { guard: true, movement: -1 } });
  }
  assert.equal(still.read().fighters[0].position.x, from);
});

// ---------------------------------------------------------------- helpers

function build(_moveId, resource) {
  const fighter = (id, team, x, facing, initial) => ({
    id,
    team,
    maxHealth: 900,
    spawn: { x: fixed(x), y: 0 },
    facing,
    hurtboxes: [{
      offset: { x: 0, y: fixed(0.8) },
      halfSize: { x: fixed(0.3), y: fixed(0.8) },
    }],
    resource: { ...LUCKY_RESOURCE, initial },
  });
  // The whole move set, because cancel targets are validated across it.
  return new CombatEngine({
    moves: ALL_MOVES,
    fighters: [fighter('p1', 1, -2, 1, resource), fighter('p2', 2, 2, -1, 0)],
    world: { leftWall: fixed(-5), rightWall: fixed(5) },
  });
}

function startWith(moveId, resource) {
  return build(moveId, resource)
    .tick({ p1: { move: moveId } })
    .state.fighters[0];
}
