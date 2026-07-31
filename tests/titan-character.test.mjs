import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BUTTON_BIT,
  InputBuffer,
  TITAN_COMMANDS,
  resolveCommand,
} from '../.sim-test-build/src/input/core.js';
import {
  TITAN_ALL_MOVES,
  TITAN_GRAPPLE_MOVES,
  TITAN_HURTBOXES,
  TITAN_MAX_HEALTH,
  TITAN_MOVEMENT,
} from '../.sim-test-build/src/data/titan/index.js';
import { TITAN_MOVE_IDS as ID } from '../.sim-test-build/src/data/titan/ids.js';
import {
  fighterDefinition,
  makeEngine,
  makeMove,
  readFighter,
} from './combat-test-utils.mjs';

test('Titan has four distinct J K I L silhouettes and exact brief frames', () => {
  const expected = {
    lp: [ID.pistonHammer, 7, 4, 12],
    lk: [ID.bulkheadBackfist, 12, 5, 16],
    hp: [ID.seismicStomp, 15, 5, 17],
    hk: [ID.siegeRam, 18, 6, 20],
  };
  for (const [button, [moveId, startup, active, recovery]] of Object.entries(expected)) {
    assert.equal(resolvePress(button)?.moveId, moveId);
    const move = TITAN_ALL_MOVES.find((row) => row.id === moveId);
    assert.deepEqual([move.startup, move.active, move.recovery], [
      startup, active, recovery,
    ]);
  }
  assert.equal(new Set(Object.values(expected).map(([id]) => id)).size, 4);
});

test('Titan meets heavyweight body and roster-stat contract', () => {
  assert.equal(TITAN_MAX_HEALTH, 1_200);
  assert.ok(TITAN_HURTBOXES.length >= 3);
  assert.ok(TITAN_MOVEMENT.forwardPerFrame < 50);
  assert.ok(TITAN_MOVEMENT.backwardPerFrame < TITAN_MOVEMENT.forwardPerFrame);
});

test('every Titan grab has a unique paired window and miss recovery exists', () => {
  const grabs = TITAN_GRAPPLE_MOVES.filter((move) => move.grapple !== undefined);
  assert.equal(grabs.length, 10);
  assert.equal(new Set(grabs.map((move) => move.id)).size, grabs.length);
  assert.ok(grabs.every((move) => move.grapple.pairedFrames >= 14));
  const miss = TITAN_ALL_MOVES.find((move) => move.id === ID.throwMiss);
  assert.ok(miss.recovery >= 30);
});

test('a missed grab enters the dedicated miss recovery clip', () => {
  const throwMove = TITAN_ALL_MOVES.find((move) => move.id === ID.normalThrow);
  const missMove = TITAN_ALL_MOVES.find((move) => move.id === ID.throwMiss);
  const engine = makeEngine(throwMove, {
    moves: [throwMove, missMove],
    fighters: [
      fighterDefinition('p1', 1, 0, 1),
      fighterDefinition('p2', 2, 4_000, -1),
    ],
  });
  engine.tick({ p1: { move: ID.normalThrow } });
  for (let frame = 0; frame < 34; frame += 1) engine.tick();
  assert.equal(readFighter(engine.read(), 'p1').action?.moveId, ID.throwMiss);
});

test('armour exists only in authored windows and never removes recovery', () => {
  const armoured = TITAN_ALL_MOVES.filter((move) => move.armour !== undefined);
  assert.ok(armoured.length >= 6);
  for (const move of armoured) {
    assert.ok(move.armour.frames.from >= 0);
    assert.ok(move.armour.frames.toExclusive <= move.startup + move.active);
    assert.ok(move.armour.hits >= 1);
    assert.ok(move.recovery >= 20);
  }
});

test('grapples defeat strike armour and publish paired presentation event', () => {
  const throwMove = TITAN_ALL_MOVES.find((move) => move.id === ID.normalThrow);
  const armourMove = makeMove({
    id: 'armour',
    active: 20,
    recovery: 1,
    hitboxes: [],
  });
  armourMove.armour = {
    frames: { from: 0, toExclusive: 20 },
    hits: 4,
    damagePercent: 10,
  };
  const engine = makeEngine(throwMove, { moves: [throwMove, armourMove] });
  let result = engine.tick({
    p1: { move: ID.normalThrow },
    p2: { move: 'armour' },
  });
  const events = [...result.events];
  for (let frame = 0; frame < 10; frame += 1) {
    result = engine.tick();
    events.push(...result.events);
  }
  assert.equal(events.some((event) => event.type === 'armourAbsorbed'), false);
  assert.equal(events.some((event) => event.type === 'grapple'), true);
  assert.ok(readFighter(result.state, 'p2').hitstun >= 20);
});

test('Supers and Ultimate are hit-confirmed and resource-gated', () => {
  const continental = TITAN_ALL_MOVES.find((move) => move.id === ID.continentalSlam);
  const ultimate = TITAN_ALL_MOVES.find((move) => move.id === ID.worldAnchor);
  assert.equal(continental.onHitFollowUp, ID.continentalFinish);
  assert.equal(ultimate.onHitFollowUp, ID.worldAnchorFinish);
  assert.equal(resolvePress('ultimate', 100, false)?.moveId, undefined);
  assert.equal(resolvePress('ultimate', 0, true)?.moveId, ID.worldAnchor);
});

function resolvePress(button, superMeter = 0, ultimateReady = false) {
  const buffer = new InputBuffer();
  buffer.push(5, 0);
  buffer.push(5, BUTTON_BIT[button]);
  return resolveCommand(buffer, TITAN_COMMANDS, {
    grounded: true,
    stanceId: null,
    gauge: 0,
    superMeter,
    ultimateReady,
  });
}
