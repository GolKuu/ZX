import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  BUTTON_BIT,
} from '../.sim-test-build/src/input/bindings.js';
import { InputBuffer } from '../.sim-test-build/src/input/buffer.js';
import { resolveCommand } from '../.sim-test-build/src/input/command.js';
import {
  ELASTIC_BRAWLER_COMMANDS,
  VELOCITY_KING_COMMANDS,
} from '../.sim-test-build/src/input/rosterCommands.js';
import {
  ELASTIC_BRAWLER_MOVES,
  VELOCITY_KING_MOVES,
} from '../.sim-test-build/src/data/roster-moves.js';
import { effectiveMoveFrames } from '../.sim-test-build/src/sim/frame-data.js';
import * as inertia from '../.sim-test-build/src/game/mechanics/frameInertia.js';
import * as gear from '../.sim-test-build/src/game/mechanics/gearShift.js';
import * as thrown from '../.sim-test-build/src/game/mechanics/commandThrow.js';

const NEUTRAL = 5;
const DOWN = 2;
const DOWN_FORWARD = 3;
const FORWARD = 6;
const DOWN_BACK = 1;
const BACK = 4;

function mask(...buttons) {
  return buttons.reduce((total, button) => total | BUTTON_BIT[button], 0);
}

/** Feed directions with no buttons, then the committing press. */
function play(directions, press = 0) {
  const buffer = new InputBuffer();
  buffer.push(NEUTRAL, 0);
  for (const direction of directions) {
    buffer.push(direction, 0);
  }
  buffer.push(directions.at(-1) ?? NEUTRAL, press);
  return buffer;
}

/* ---------------------------------------------------------------- */
/* Velocity King                                                     */
/* ---------------------------------------------------------------- */

test('Projection Sorcery resolves on QCF + kick', () => {
  const buffer = play([DOWN, DOWN_FORWARD, FORWARD], mask('lk'));
  const command = resolveCommand(buffer, VELOCITY_KING_COMMANDS);
  assert.equal(command?.moveId, 'vk.projection');
});

test('Projection Sorcery does not fire on a punch', () => {
  const buffer = play([DOWN, DOWN_FORWARD, FORWARD], mask('lp'));
  const command = resolveCommand(buffer, VELOCITY_KING_COMMANDS);
  assert.notEqual(command?.moveId, 'vk.projection');
});

test('Command throw needs both LP and LK, not either alone', () => {
  const motion = [FORWARD, DOWN_FORWARD, DOWN, DOWN_BACK, BACK];

  const single = resolveCommand(play(motion, mask('lp')), VELOCITY_KING_COMMANDS);
  assert.notEqual(single?.moveId, 'vk.throw');

  const both = resolveCommand(
    play(motion, mask('lp', 'lk')),
    VELOCITY_KING_COMMANDS,
  );
  assert.equal(both?.moveId, 'vk.throw');
});

test('Command throw is unblockable — no block data reaches the engine', () => {
  const move = VELOCITY_KING_MOVES.find(({ id }) => id === 'vk.throw');
  assert.ok(move);
  assert.equal(move.hitboxes[0].hit.block, undefined);
});

test('Projection Sorcery has no hitbox — it is movement only', () => {
  const move = VELOCITY_KING_MOVES.find(({ id }) => id === 'vk.projection');
  assert.ok(move);
  assert.equal(move.hitboxes.length, 0);
});

/* ---------------------------------------------------------------- */
/* Frame Inertia                                                     */
/* ---------------------------------------------------------------- */

test('Frame Inertia removes 15% of recovery per stack', () => {
  assert.equal(inertia.recoveryPercentFor(0), 100);
  assert.equal(inertia.recoveryPercentFor(1), 85);
  assert.equal(inertia.recoveryPercentFor(2), 70);
  assert.equal(inertia.recoveryPercentFor(3), 55);
});

test('Frame Inertia caps at the maximum stack count', () => {
  let state = inertia.INITIAL_FRAME_INERTIA;
  for (let index = 0; index < 10; index += 1) {
    state = inertia.onConnect(state);
  }
  assert.equal(state.stacks, inertia.MAX_STACKS);
});

test('Being hit clears every stack', () => {
  const stacked = inertia.onConnect(inertia.onConnect(inertia.INITIAL_FRAME_INERTIA));
  assert.equal(stacked.stacks, 2);
  assert.equal(inertia.onPunished().stacks, 0);
});

test('Stacks decay after the idle window, one at a time', () => {
  let state = inertia.onConnect(inertia.onConnect(inertia.INITIAL_FRAME_INERTIA));
  for (let frame = 0; frame < inertia.DECAY_FRAMES - 1; frame += 1) {
    state = inertia.advance(state);
  }
  assert.equal(state.stacks, 2, 'holds until the window elapses');
  state = inertia.advance(state);
  assert.equal(state.stacks, 1);
});

test('Recovery shortens in the engine, and startup never does', () => {
  const move = { id: 'x', startup: 10, active: 4, recovery: 20, hitboxes: [] };

  assert.equal(effectiveMoveFrames(move, 100), 34);
  // 20 * 85% = 17 → 10 + 4 + 17
  assert.equal(effectiveMoveFrames(move, 85), 31);
  // 20 * 55% = 11 → 10 + 4 + 11
  assert.equal(effectiveMoveFrames(move, 55), 25);
});

test('Recovery can never reach zero frames', () => {
  const move = { id: 'x', startup: 3, active: 1, recovery: 1, hitboxes: [] };
  assert.equal(effectiveMoveFrames(move, 1), 5, 'one recovery frame survives');
});

/* ---------------------------------------------------------------- */
/* Elastic Brawler                                                   */
/* ---------------------------------------------------------------- */

test('Pistol resolves on QCF + punch', () => {
  const buffer = play([DOWN, DOWN_FORWARD, FORWARD], mask('lp'));
  assert.equal(
    resolveCommand(buffer, ELASTIC_BRAWLER_COMMANDS)?.moveId,
    'eb.pistol',
  );
});

test('Axe resolves on QCB + kick', () => {
  const buffer = play([DOWN, DOWN_BACK, BACK], mask('hk'));
  assert.equal(
    resolveCommand(buffer, ELASTIC_BRAWLER_COMMANDS)?.moveId,
    'eb.axe',
  );
});

test('Axe is slow enough to react to — an overhead has to be', () => {
  const move = ELASTIC_BRAWLER_MOVES.find(({ id }) => id === 'eb.axe');
  assert.ok(move);
  assert.ok(move.startup >= 20, `startup ${move.startup} is reactable`);
});

test('Gear Shift resolves on Down, Down + P+K', () => {
  const buffer = play([DOWN, NEUTRAL, DOWN], mask('lp', 'lk'));
  assert.equal(
    resolveCommand(buffer, ELASTIC_BRAWLER_COMMANDS)?.moveId,
    'eb.gear',
  );
});

test('Gear Shift cycles base to Gear 2 to Gear 4 and back', () => {
  const two = gear.shift(gear.INITIAL_GEAR);
  assert.equal(two.gear, 'gear2');
  const four = gear.shift(two);
  assert.equal(four.gear, 'gear4');
  assert.equal(gear.shift(four).gear, 'base');
});

test('Gear 2 is speed only, Gear 4 is armor only', () => {
  const two = gear.enter('gear2');
  const four = gear.enter('gear4');

  assert.equal(gear.speedPercentFor(two), gear.GEAR_TWO_SPEED_PERCENT);
  assert.equal(gear.speedPercentFor(four), 100);
  assert.equal(gear.takeHit(two).absorbed, false);
  assert.equal(gear.takeHit(four).absorbed, true);
});

test('Hyper-armor is consumed by hits and then stops absorbing', () => {
  let state = gear.enter('gear4');
  for (let index = 0; index < gear.GEAR_FOUR_ARMOR_HITS; index += 1) {
    const result = gear.takeHit(state);
    assert.equal(result.absorbed, true, `hit ${index + 1} absorbed`);
    state = result.state;
  }
  assert.equal(gear.takeHit(state).absorbed, false, 'armor is spent');
});

test('Armor absorbs hitstun but not damage', () => {
  assert.equal(gear.damageTakenPercentFor(gear.enter('gear4')), 120);
});

test('A gear expires back to base', () => {
  let state = gear.enter('gear2');
  for (let frame = 0; frame < gear.GEAR_TWO_FRAMES; frame += 1) {
    state = gear.advance(state);
  }
  assert.equal(state.gear, 'base');
});

/* ---------------------------------------------------------------- */
/* Meter drain                                                       */
/* ---------------------------------------------------------------- */

test('The command throw drains a flat amount and floors at zero', () => {
  assert.equal(thrown.drainMeter(100), 75);
  assert.equal(thrown.drainMeter(30), 5);
  assert.equal(thrown.drainMeter(10), 0);
  assert.equal(thrown.drainMeter(0), 0);
});

test('Reported drain matches what was actually removed', () => {
  assert.equal(thrown.drainedAmount(100), 25);
  assert.equal(thrown.drainedAmount(10), 10, 'never over-reports');
});
