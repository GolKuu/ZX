import assert from 'node:assert/strict';
import test from 'node:test';
import { spriteAttackFrame } from '../.sim-test-build/src/stage/sprite2d/spriteAttackTimeline.js';
import { photoAttackSequence } from '../.sim-test-build/src/stage/photoSprite/photoAttackSequences.js';
import {
  MAX_HIP_TURN,
  PHOTO_KICK_NORMAL_IDS,
  PHOTO_NORMAL_ATTACK_KINDS,
  photoAttackKind,
  photoAttackMotion,
} from '../.sim-test-build/src/stage/photoSprite/photoKickAnimation.js';

const BASIC_ATTACKS = {
  mim: ['mim.jab', 'mim.elbow', 'mim.capoeira', 'mim.spin'],
  glitch: [
    'glitch.phase-jab',
    'glitch.rift-elbow',
    'glitch.low-vector-sweep',
    'glitch.breakpoint-axe',
  ],
  lucky: [
    'lucky.quick-draw',
    'lucky.loaded-shoulder',
    'lucky.sliding-bet',
    'lucky.fortune-heel',
  ],
  titan: [
    'titan.normal.piston-hammer',
    'titan.normal.bulkhead-backfist',
    'titan.normal.seismic-stomp',
    'titan.normal.siege-ram',
  ],
  vorgh: [
    'vorgh.normal.predator-rake',
    'vorgh.normal.skull-ram',
    'vorgh.normal.hunting-sweep',
    'vorgh.normal.rising-maul',
  ],
};

test('J K I L use four different basic attack animations for every fighter', () => {
  for (const [fighter, moves] of Object.entries(BASIC_ATTACKS)) {
    const kinds = moves.map((moveId) => PHOTO_NORMAL_ATTACK_KINDS[moveId]);
    assert.deepEqual(
      kinds.slice(0, 2),
      ['jab', 'heavy'],
      `${fighter}: J must use the lead hand and K the rear hand`,
    );
    assert.ok(
      ['kick', 'sweep'].includes(kinds[2]),
      `${fighter}: I must use the lead leg`,
    );
    assert.equal(kinds[3], 'highKick', `${fighter}: L must use the rear leg`);
    assert.equal(new Set(kinds).size, 4, `${fighter}: an animation was reused`);
  }
});

test('the four attack buttons have separate full animation cycles', () => {
  const moves = BASIC_ATTACKS.glitch;
  const sequences = moves.map((moveId) => photoAttackSequence(moveId).join(','));
  const motions = moves.map((moveId) => JSON.stringify([
    photoAttackMotion(moveId, 0.25),
    photoAttackMotion(moveId, 0.52),
  ]));
  assert.equal(new Set(sequences).size, 4, 'a complete frame cycle was reused');
  assert.equal(new Set(motions).size, 4, 'a body-motion cycle was reused');
});

test('no attack on any fighter ever turns its back to the opponent', () => {
  for (const moves of Object.values(BASIC_ATTACKS)) {
    for (const moveId of moves) {
      for (let step = 0; step <= 40; step += 1) {
        const { turnY } = photoAttackMotion(moveId, step / 40);
        assert.ok(
          Math.abs(turnY) <= MAX_HIP_TURN,
          `${moveId} yaws ${turnY} at ${step / 40}, past a readable hip turn`,
        );
      }
    }
  }
});

test('K and L turn the hips through the strike and finish square', () => {
  for (const moveId of ['glitch.rift-elbow', 'glitch.breakpoint-axe']) {
    const coil = photoAttackMotion(moveId, 0.25).turnY;
    const contact = photoAttackMotion(moveId, 0.52).turnY;
    assert.ok(coil > 0, `${moveId} must close the lead shoulder first`);
    assert.ok(contact < 0, `${moveId} must swing back open through contact`);
    assert.equal(photoAttackMotion(moveId, 1).turnY, 0);
  }
});

test('K visibly coils and drives from the rear shoulder', () => {
  const windup = photoAttackMotion('glitch.rift-elbow', 0.25);
  const contact = photoAttackMotion('glitch.rift-elbow', 0.52);
  const recovery = photoAttackMotion('glitch.rift-elbow', 1);
  assert.ok(windup.x < 0 && windup.rotation > 0, 'rear shoulder must coil first');
  assert.ok(contact.x > 0 && contact.rotation < 0, 'rear hand must cross through');
  assert.deepEqual(recovery, {
    x: 0, y: 0, rotation: 0, turnY: 0, scaleX: 1, scaleY: 1,
  });
});

test('L visibly chambers and strikes with the rear leg', () => {
  const windup = photoAttackMotion('glitch.breakpoint-axe', 0.25);
  const contact = photoAttackMotion('glitch.breakpoint-axe', 0.52);
  const recovery = photoAttackMotion('glitch.breakpoint-axe', 1);
  assert.ok(windup.x < 0 && windup.rotation > 0, 'rear hip must coil first');
  assert.ok(contact.x > 0 && contact.y > 0, 'rear leg must cross forward and rise');
  assert.ok(contact.rotation < 0, 'rear hip must turn through the strike');
  assert.deepEqual(recovery, {
    x: 0, y: 0, rotation: 0, turnY: 0, scaleX: 1, scaleY: 1,
  });
});

test('Lucky attacks expose all nine readable animation beats', () => {
  const move = { startup: 10, active: 4, recovery: 14 };
  const frames = Array.from(
    { length: move.startup + move.active + move.recovery },
    (_, frame) => spriteAttackFrame(frame, move),
  );

  assert.deepEqual([...new Set(frames)], [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  assert.equal(frames.filter((frame) => frame === 4).length, move.active);
});

test('I and L normals for every fighter use leg animation silhouettes', () => {
  assert.equal(PHOTO_KICK_NORMAL_IDS.length, 10);
  for (const moveId of PHOTO_KICK_NORMAL_IDS) {
    assert.ok(
      ['kick', 'highKick', 'sweep'].includes(photoAttackKind(moveId)),
      `${moveId} still resolves to an upper-body animation`,
    );
  }
});

test('kick animation has anticipation, contact travel and a neutral return', () => {
  const windup = photoAttackMotion('titan.normal.siege-ram', 0.25);
  const contact = photoAttackMotion('titan.normal.siege-ram', 0.52);
  const recovery = photoAttackMotion('titan.normal.siege-ram', 1);
  assert.ok(windup.x < 0, 'the fighter must coil before the kick');
  assert.ok(contact.x > 0 && contact.y > 0, 'the heel must drive forward and rise');
  assert.deepEqual(recovery, {
    x: 0, y: 0, rotation: 0, turnY: 0, scaleX: 1, scaleY: 1,
  });
});
