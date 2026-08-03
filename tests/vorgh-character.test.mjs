import assert from 'node:assert/strict';
import test from 'node:test';

import {
  VORGH_MOVE_SPECS,
  VORGH_DAMAGE_PERCENT,
  VORGH_RESOURCE,
  VORGH_NORMAL_IDS,
  VORGH_SPECIAL_IDS,
  VORGH_SUPER_IDS,
  VORGH_TECHNIQUE_IDS,
  VORGH_AI_LOADOUTS,
  VORGH_MOVES,
} from '../.sim-test-build/src/data/vorgh/index.js';
import { VORGH_COMMANDS } from '../.sim-test-build/src/input/vorghCommands.js';
import { VORGH_ANIMATION_CLIPS } from '../.sim-test-build/src/stage/vorgh/vorghAnimationData.js';
import { rageTier } from '../.sim-test-build/src/stage/vorgh/vorghPose.js';
import {
  advanceVorghAnimation,
  createVorghAnimationState,
} from '../.sim-test-build/src/stage/vorgh/VorghAnimationController.js';

test('Vorgh meets the authored Mim-width baseline', () => {
  assert.equal(VORGH_DAMAGE_PERCENT, 115);
  assert.ok(VORGH_MOVE_SPECS.length >= 27);
  assert.equal(VORGH_MOVES.length, VORGH_MOVE_SPECS.length);
  assert.equal(new Set(VORGH_MOVES.map(({ id }) => id)).size, VORGH_MOVES.length);
  for (const spec of VORGH_MOVE_SPECS) {
    assert.ok(spec.presentation.animation.length > 0);
    assert.ok(spec.presentation.vfx.length > 0);
    assert.ok(spec.presentation.sounds.length > 0);
    assert.ok(spec.presentation.camera.length > 0);
  }
});

test('throws have target rules and air throw wins command resolution in air', () => {
  const groundThrow = VORGH_MOVES.find(({ id }) => id === VORGH_TECHNIQUE_IDS.throw);
  const airThrow = VORGH_MOVES.find(({ id }) => id === VORGH_TECHNIQUE_IDS.airThrow);
  assert.equal(groundThrow?.grapple?.targetSize, 'grounded');
  assert.equal(airThrow?.grapple?.targetSize, 'airborne');
  const airIndex = VORGH_COMMANDS.findIndex(({ moveId }) => moveId === VORGH_TECHNIQUE_IDS.airThrow);
  const groundIndex = VORGH_COMMANDS.findIndex(({ moveId }) => moveId === VORGH_TECHNIQUE_IDS.throw);
  assert.ok(airIndex >= 0 && airIndex < groundIndex);
});

test('Dual Techniques are blockable authored strikes', () => {
  for (const id of [
    VORGH_TECHNIQUE_IDS.dualFang,
    VORGH_TECHNIQUE_IDS.dualRend,
    VORGH_TECHNIQUE_IDS.dualBreak,
  ]) {
    const move = VORGH_MOVES.find((candidate) => candidate.id === id);
    assert.ok(move?.hitboxes.every(({ hit }) => (hit.block?.blockstun ?? 0) > 0));
  }
});

test('every Vorgh move has attack level and authored hurtbox timeline', () => {
  for (const move of VORGH_MOVES) {
    assert.ok(move.attackLevel);
    assert.ok((move.hurtboxes?.length ?? 0) >= 3);
  }
});

test('Unchained has bounded armour, cancel whitelist and gradual drain', () => {
  const move = VORGH_MOVES.find(({ id }) => id === VORGH_SUPER_IDS.unchained);
  assert.equal(move?.status?.durationFrames, 300);
  assert.equal(move?.status?.armourHits, 1);
  assert.ok((move?.status?.cancelInto?.length ?? 0) >= 8);
  assert.equal(
    20 + (move?.status?.durationFrames ?? 0)
      / (move?.status?.resourceDrainIntervalFrames ?? 1)
      * (move?.status?.resourceDrainAmount ?? 0),
    35,
  );
});

test('Rage tiers author pressure, damage and recovery tradeoffs', () => {
  assert.equal(VORGH_RESOURCE.pressureThreshold, 25);
  assert.equal(VORGH_RESOURCE.pushbackPercentAtPressure, 108);
  assert.equal(VORGH_RESOURCE.highRageThreshold, 75);
  assert.equal(VORGH_RESOURCE.damagePercentAtHighRage, 110);
  assert.equal(VORGH_RESOURCE.recoveryPercentAtHighRage, 115);
  assert.ok((VORGH_RESOURCE.tierCancelInto?.length ?? 0) >= 3);
});

test('Hard and Story AI opt into resource-aware Pain Guard', () => {
  assert.equal(VORGH_AI_LOADOUTS.hard.painGuardThreshold, 58);
  assert.equal(VORGH_AI_LOADOUTS.story.painGuardThreshold, 58);
  assert.equal(VORGH_AI_LOADOUTS.easy.painGuardThreshold, undefined);
});

test('J K I L normals keep exact requested timing and unique geometry', () => {
  const expected = [
    [VORGH_NORMAL_IDS.predatorRake, 6, 4, 10, 'high'],
    [VORGH_NORMAL_IDS.skullRam, 9, 4, 14, 'mid'],
    [VORGH_NORMAL_IDS.huntingSweep, 12, 5, 15, 'low'],
    [VORGH_NORMAL_IDS.risingMaul, 16, 5, 18, 'mid'],
  ];
  const boxes = new Set();
  for (const [id, startup, active, recovery, level] of expected) {
    const spec = VORGH_MOVE_SPECS.find(({ move }) => move.id === id);
    assert.ok(spec);
    assert.deepEqual(
      [spec.move.startup, spec.move.active, spec.move.recovery, spec.attackLevel],
      [startup, active, recovery, level],
    );
    boxes.add(JSON.stringify(spec.move.hitboxes[0].boxes[0]));
  }
  assert.equal(boxes.size, 4);
  assert.equal(damageOf(VORGH_NORMAL_IDS.huntingSweep), 70);
  assert.equal(damageOf(VORGH_NORMAL_IDS.risingMaul), 83);
});

function damageOf(moveId) {
  return VORGH_MOVES.find(({ id }) => id === moveId)?.hitboxes[0]?.hit.damage;
}

test('three Rage idles are 18-frame loops and transitions are authored clips', () => {
  for (const id of ['idle-low', 'idle-medium', 'idle-high']) {
    const clip = VORGH_ANIMATION_CLIPS.find((candidate) => candidate.id === id);
    assert.deepEqual(clip, { id, frames: 18, loop: true, category: 'idle' });
  }
  assert.equal(
    VORGH_ANIMATION_CLIPS.filter(({ category }) => category === 'transition').length,
    4,
  );
  assert.equal(rageTier(0), 'low');
  assert.equal(rageTier(25), 'medium');
  assert.equal(rageTier(50), 'charged');
  assert.equal(rageTier(75), 'high');
  assert.equal(rageTier(100), 'berserk');
});

test('runtime controller samples all three idles and directional transitions', () => {
  const state = createVorghAnimationState();
  const fighter = snapshot();
  const lowFrames = Array.from({ length: 18 }, () =>
    advanceVorghAnimation(state, fighter).frame);
  assert.deepEqual(lowFrames, [...Array(18).keys()].map((frame) => frame + 1).map((frame) => frame % 18));
  fighter.resource = 30;
  assert.equal(advanceVorghAnimation(state, fighter).clipId, 'rage-low-medium');
  for (let frame = 0; frame < 13; frame += 1) advanceVorghAnimation(state, fighter);
  assert.equal(advanceVorghAnimation(state, fighter).clipId, 'idle-medium');
  fighter.resource = 80;
  assert.equal(advanceVorghAnimation(state, fighter).clipId, 'rage-medium-high');
});

test('runtime controller selects authored defense and reaction clips', () => {
  const state = createVorghAnimationState();
  const fighter = snapshot();
  fighter.guarding = true;
  fighter.guardFrames = 1;
  assert.equal(advanceVorghAnimation(state, fighter).clipId, 'stand-block-start');
  fighter.crouching = true;
  fighter.guardFrames = 8;
  assert.equal(advanceVorghAnimation(state, fighter).clipId, 'crouch-block-hold');
  fighter.guardMode = 'pain';
  assert.equal(advanceVorghAnimation(state, fighter).clipId, 'pain-guard');
  fighter.guarding = false;
  advanceVorghAnimation(state, fighter);
  fighter.hitstun = 28;
  assert.equal(advanceVorghAnimation(state, fighter).clipId, 'pain-to-power');
});

test('animation controller advances once per fixed simulation frame', () => {
  const state = createVorghAnimationState();
  const fighter = snapshot();
  const first = advanceVorghAnimation(state, fighter, 10);
  const repeatedRender = advanceVorghAnimation(state, fighter, 10);
  const nextTick = advanceVorghAnimation(state, fighter, 11);
  assert.deepEqual(repeatedRender, first);
  assert.equal(nextTick.frame, (first.frame + 1) % 18);
  const skippedTicks = advanceVorghAnimation(state, fighter, 14);
  assert.equal(skippedTicks.frame, (nextTick.frame + 3) % 18);
});

test('enhanced moves and Last Beast are resource-gated', () => {
  const enhanced = VORGH_MOVES.filter(({ id }) => id.endsWith('.ex'));
  assert.equal(enhanced.length, 6);
  assert.ok(enhanced.every(({ minimumResource }) =>
    (minimumResource ?? 0) >= 25));
  assert.ok(enhanced
    .filter(({ id }) => id !== VORGH_SPECIAL_IDS.painCounterEx)
    .every(({ resourceCost }) => (resourceCost ?? 0) > 0));
  const ultimate = VORGH_MOVES.find(({ id }) => id === VORGH_SUPER_IDS.lastBeast);
  assert.equal(ultimate?.minimumResource, 80);
  assert.equal(ultimate?.resourceCost, 80);
  assert.equal(ultimate?.onHitFollowUp, VORGH_SUPER_IDS.lastBeastSequence);
  const command = VORGH_COMMANDS.find(({ moveId }) => moveId === VORGH_SUPER_IDS.lastBeast);
  assert.equal(command?.available?.({
    grounded: true, stanceId: null, gauge: 80, superMeter: 66, ultimateReady: true,
  }), true);
  assert.equal(command?.available?.({
    grounded: true, stanceId: null, gauge: 79, superMeter: 100, ultimateReady: true,
  }), false);
  assert.ok(VORGH_MOVES.some(({ id }) => id === VORGH_SPECIAL_IDS.painCounter));
});

function snapshot() {
  return {
    id: 'vorgh', team: 1, health: 1050, maxHealth: 1050,
    position: { x: 0, y: 0 }, previousPosition: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 }, facing: 1, grounded: true,
    guarding: false, crouching: false, guardFrames: 0,
    guardMode: 'normal', guardHealth: 100, resource: 0,
    resourceMaximum: 100, resourceLockFrames: 0, resourceOverdrive: false,
    statusId: null, statusFrames: 0, dashFrames: 0, hitstop: 0,
    hitstun: 0, action: null,
    wallRun: { phase: 'none', wallId: null, frame: 0, climb: 0 },
  };
}
