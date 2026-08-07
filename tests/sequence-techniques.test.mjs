import assert from 'node:assert/strict';
import test from 'node:test';

import { ALL_COMBAT_MOVES } from '../.sim-test-build/src/data/allMoves.js';
import {
  SEQUENCE_TECHNIQUES,
  sequenceTechniquesFor,
} from '../.sim-test-build/src/data/sequenceTechniques.js';
import {
  BUTTON_BIT,
  InputBuffer,
  InputSampler,
  MIM_COMMANDS,
  commandsFor,
  resolveCommand,
} from '../.sim-test-build/src/input/core.js';
import { progressionMoveCommands } from '../.sim-test-build/src/progression/moveCommands.js';
import { nodeById } from '../.sim-test-build/src/progression/treeData.js';
import { validateMoves } from '../.sim-test-build/src/sim/move-validation.js';
import {
  WallField,
  applyWallAttackContacts,
  resolveWallCollisions,
} from '../.sim-test-build/src/sim/walls/index.js';

const neutralContext = (nodeId) => ({
  grounded: true,
  stanceId: null,
  gauge: 100,
  superMeter: 100,
  ultimateReady: true,
  activeProgressionNodes: new Set(nodeId === undefined ? [] : [nodeId]),
});

test('the roster owns exactly five distinct sequential techniques each', () => {
  assert.equal(SEQUENCE_TECHNIQUES.length, 25);
  for (const fighter of ['mim', 'glitch', 'lucky', 'vorgh', 'titan']) {
    const techniques = sequenceTechniquesFor(fighter);
    assert.equal(techniques.length, 5);
    assert.equal(new Set(techniques.map((entry) => entry.sequence.join('>'))).size, 5);
    assert.ok(techniques.every((entry) => entry.sequence.length === 2));
  }
});

test('all sequence frame data remains engine-valid', () => {
  assert.doesNotThrow(() => validateMoves(ALL_COMBAT_MOVES));
});

test('every technique has frame data, a real command, cancel route and Hub unlock', () => {
  for (const technique of SEQUENCE_TECHNIQUES) {
    assert.ok(ALL_COMBAT_MOVES.some((move) => move.id === technique.moveId));
    assert.ok(commandsFor(technique.characterId).some((row) => (
      row.moveId === technique.moveId
      && row.displayName === technique.name
      && row.attackSequence?.join('>') === technique.sequence.join('>')
    )));
    const starter = ALL_COMBAT_MOVES.find((move) => move.id === technique.starterMoveId);
    assert.ok(starter?.cancels?.some((window) => window.into.includes(technique.moveId)));
    assert.ok(nodeById(technique.unlockNodeId)?.affectedMoves.includes(technique.moveId));
  }
});

test('J then K resolves Invisible Wall only after its progression unlock', () => {
  const technique = sequenceTechniquesFor('mim')[0];
  assert.ok(technique);
  const locked = sequenceBuffer('lp', 'lk');
  assert.notEqual(
    resolveCommand(locked, MIM_COMMANDS, neutralContext(), { leeway: 24 })?.moveId,
    technique.moveId,
  );
  const unlocked = sequenceBuffer('lp', 'lk');
  assert.equal(
    resolveCommand(
      unlocked,
      MIM_COMMANDS,
      neutralContext(technique.unlockNodeId),
      { leeway: 24 },
    )?.moveId,
    technique.moveId,
  );
});

test('simultaneous J+K never counts as sequential Invisible Wall', () => {
  const technique = sequenceTechniquesFor('mim')[0];
  assert.ok(technique);
  const buffer = new InputBuffer();
  buffer.push(5, 0);
  buffer.push(5, BUTTON_BIT.lp | BUTTON_BIT.lk);
  assert.notEqual(
    resolveCommand(
      buffer,
      MIM_COMMANDS,
      neutralContext(technique.unlockNodeId),
      { leeway: 24 },
    )?.moveId,
    technique.moveId,
  );
});

test('the second press buffers while the first attack is still locked', () => {
  const technique = sequenceTechniquesFor('mim')[0];
  assert.ok(technique);
  const sampler = new InputSampler(MIM_COMMANDS);
  const context = neutralContext(technique.unlockNodeId);
  assert.equal(sampler.sample(5, BUTTON_BIT.lp, 1, false, context).move, 'mim.jab');
  sampler.sample(5, 0, 1, true, context);
  sampler.sample(5, 0, 1, true, context);
  assert.equal(sampler.sample(5, BUTTON_BIT.lk, 1, true, context).move, undefined);
  sampler.sample(5, 0, 1, true, context);
  assert.equal(sampler.sample(5, 0, 1, false, context).move, technique.moveId);
  assert.equal(sampler.sample(5, 0, 1, true, context).move, undefined);
});

test('Progression Hub prints sequential techniques as animated steps', () => {
  const technique = sequenceTechniquesFor('mim')[0];
  assert.ok(technique);
  const [command] = progressionMoveCommands('mim', [technique.moveId]);
  assert.equal(command?.name, 'Invisible Wall');
  assert.equal(command?.notation, 'J → K');
  assert.deepEqual(command?.steps.map((step) => step.keys), [['J'], ['K']]);
});

test('MIM sequence walls keep authored lifetime, prison and impact contracts', () => {
  const byName = Object.fromEntries(sequenceTechniquesFor('mim').map((entry) => [
    entry.name,
    ALL_COMBAT_MOVES.find((move) => move.id === entry.moveId),
  ]));
  assert.equal(byName['Invisible Wall']?.walls?.[0]?.lifetimeFrames, 190);
  assert.equal(byName['Boxed In']?.walls?.length, 2);
  assert.equal(byName['Wall Smash']?.walls?.[0]?.impactDamage, 36);
  assert.equal(byName['Wall Smash']?.walls?.[0]?.impactHitstun, 14);
  assert.equal(byName['Wall Bounce']?.hitboxes[0]?.hit.wallBounce?.count, 1);
});

test('a stunned fighter rebounds from a solid MIM wall and takes impact damage', () => {
  const field = new WallField();
  const owner = {
    id: 'p1', team: 1, facing: 1,
    position: { x: 0, y: 0 },
  };
  field.create(owner, {
    kind: 'rear', offset: { x: 1_000, y: 500 }, halfSize: { x: 50, y: 700 },
    spawnFrame: 0, materializeFrames: 0, lifetimeFrames: 120, integrity: 1,
    impactDamage: 20, impactHitstun: 14,
  });
  const fighter = {
    id: 'p2', team: 2, health: 100,
    position: { x: 1_000, y: 0 }, previousPosition: { x: 900, y: 0 },
    velocity: { x: 180, y: 0 }, hitstun: 8, hitstop: 0, grounded: true,
    bounce: {
      wallRemaining: 1, wallHorizontalSpeed: 126, wallVerticalSpeed: 90,
      wallMinimumHitstun: 25, groundRemaining: 0, groundVerticalSpeed: 0,
      groundHorizontalNumerator: 1, groundHorizontalDenominator: 1,
      groundMinimumHitstun: 0,
    },
  };
  const events = [];
  resolveWallCollisions(field, [fighter], 12, events);
  assert.equal(fighter.health, 80);
  assert.equal(fighter.velocity.x, -126);
  assert.equal(fighter.velocity.y, 90);
  assert.equal(fighter.bounce.wallRemaining, 0);
  assert.ok(events.some((event) => event.type === 'wallBounce'));
  assert.ok(events.some((event) => event.type === 'hit' && event.hitId === 'wallImpact'));
});

test('Mirror Wall consumes a ranged hitbox before it reaches the fighter behind it', () => {
  const field = new WallField();
  const owner = { id: 'p1', team: 1, facing: 1, position: { x: 0, y: 0 } };
  field.create(owner, {
    kind: 'shield', offset: { x: 1_000, y: 500 }, halfSize: { x: 60, y: 700 },
    spawnFrame: 0, materializeFrames: 0, lifetimeFrames: 46, integrity: 1,
  });
  const attacker = {
    id: 'p2', team: 2, facing: -1, position: { x: 2_000, y: 0 },
    velocity: { x: -100, y: 0 },
    action: { moveId: 'projectile', frame: 0, serial: 1, hitLedger: [], armourHitsUsed: 0 },
  };
  const projectile = {
    id: 'projectile', startup: 0, active: 1, recovery: 10,
    hitboxes: [{
      hitId: 'shot', frames: { from: 0, toExclusive: 1 },
      boxes: [{ offset: { x: 1_000, y: 500 }, halfSize: { x: 120, y: 120 } }],
      hit: { damage: 20, hitstop: { attacker: 0, defender: 0 }, hitstun: 10,
        knockback: { x: 0, y: 0 } },
    }],
  };
  const events = [];
  applyWallAttackContacts(field, [attacker], new Map([['projectile', projectile]]), 4, events);
  assert.equal(attacker.action, null);
  assert.equal(attacker.velocity.x, 0);
  assert.ok(events.some((event) => event.type === 'wallContact'));
});

function sequenceBuffer(first, second) {
  const buffer = new InputBuffer();
  buffer.push(5, 0);
  buffer.push(5, BUTTON_BIT[first]);
  buffer.push(5, 0);
  buffer.push(5, 0);
  buffer.push(5, BUTTON_BIT[second]);
  return buffer;
}
