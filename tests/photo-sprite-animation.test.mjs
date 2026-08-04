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
  for (const [fighter, moves] of Object.entries(BASIC_ATTACKS)) {
    const sequences = moves.map((moveId) => photoAttackSequence(moveId).join(','));
    const motions = moves.map((moveId) => JSON.stringify([
      photoAttackMotion(moveId, 0.25),
      photoAttackMotion(moveId, 0.52),
    ]));
    assert.equal(
      new Set(sequences).size,
      4,
      `${fighter}: a complete frame cycle was reused`,
    );
    assert.equal(
      new Set(motions).size,
      4,
      `${fighter}: a body-motion cycle was reused`,
    );
  }
});

const IDLE = 0;

/**
 * The atlas draws both punches from the same side — the lead-hand and
 * rear-hand contact cells overlap by two thirds as silhouettes. So J and K may
 * not *also* wind up and recover through the same drawings, or the whole
 * nine-frame cycle is one picture played twice. Same for the two legs.
 */
test('J and K, and I and L, share no drawing but the idle they start from', () => {
  for (const [fighter, moves] of Object.entries(BASIC_ATTACKS)) {
    for (const [first, second] of [[0, 1], [2, 3]]) {
      const shared = photoAttackSequence(moves[first])
        .filter((drawing) => photoAttackSequence(moves[second]).includes(drawing));
      assert.deepEqual(
        [...new Set(shared)],
        [IDLE],
        `${fighter}: ${moves[first]} and ${moves[second]} reuse a drawing`,
      );
    }
  }
});

/**
 * Because the drawings cannot say which limb moved, the body has to. Each
 * button therefore owns a travel signature no other button shares: lead limbs
 * keep the hips square while rear limbs turn them, and hands stay level while
 * legs carry the fighter down or up.
 */
test('every fighter reads its four buttons off the body, not the drawing', () => {
  for (const [fighter, moves] of Object.entries(BASIC_ATTACKS)) {
    const [jab, rearHand, leadLeg, rearLeg] = moves.map(
      (moveId) => photoAttackMotion(moveId, 0.52),
    );

    assert.equal(jab.turnY, 0, `${fighter}: J must keep the hips square`);
    assert.equal(leadLeg.turnY, 0, `${fighter}: I must keep the hips square`);
    assert.ok(rearHand.turnY < 0, `${fighter}: K must turn the hips through`);
    assert.ok(rearLeg.turnY < 0, `${fighter}: L must turn the hips through`);

    assert.ok(
      rearHand.x > jab.x * 1.5,
      `${fighter}: K must commit visibly further than J, not ${rearHand.x}`,
    );
    assert.ok(
      Math.abs(jab.y) < 0.05 && Math.abs(rearHand.y) < 0.05,
      `${fighter}: a punch must stay at shoulder height`,
    );
    assert.ok(
      leadLeg.y < -0.08,
      `${fighter}: I must drop the hips into the lead leg, not ${leadLeg.y}`,
    );
    assert.ok(
      rearLeg.y > 0.08,
      `${fighter}: L must rise onto the rear leg, not ${rearLeg.y}`,
    );
  }
});

test('the standing normals move far enough to be seen', () => {
  // A drawing is 3.05 engine units tall, so travel under about 0.05 is under
  // two percent of the fighter and reads as no motion at all.
  for (const [fighter, moves] of Object.entries(BASIC_ATTACKS)) {
    for (const moveId of moves) {
      // The ends of the swing: the last frame of the chamber and the last
      // frame the strike is out, rather than two points somewhere inside it.
      const coil = photoAttackMotion(moveId, 0.33);
      const contact = photoAttackMotion(moveId, 0.57);
      const travel = Math.hypot(contact.x - coil.x, contact.y - coil.y);
      assert.ok(
        travel > 0.15,
        `${fighter}: ${moveId} travels ${travel.toFixed(3)}, too little to read`,
      );
    }
  }
});

test('specials and grabs keep the smaller generic travel', () => {
  for (const moveId of ['titan.grab.command', 'vorgh.special.rage-slash']) {
    const contact = photoAttackMotion(moveId, 0.52);
    assert.ok(
      Math.abs(contact.x) < 0.12,
      `${moveId} lunges ${contact.x}, further than its own hitbox`,
    );
  }
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
