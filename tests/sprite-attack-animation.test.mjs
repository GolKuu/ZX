import assert from 'node:assert/strict';
import test from 'node:test';
import { CHRONO_MOVES } from '../.sim-test-build/src/data/chrono-combat-moves.js';
import { ECHO_MOVES } from '../.sim-test-build/src/data/echo-combat-moves.js';
import { GLITCH_MOVES } from '../.sim-test-build/src/data/glitch-combat-moves.js';
import { IDOL_MOVES } from '../.sim-test-build/src/data/idol-combat-moves.js';
import { spritePoseFor } from '../.sim-test-build/src/stage/sprite2d/spritePose.js';
import {
  spriteAttackBeat,
} from '../.sim-test-build/src/stage/sprite2d/spriteAttackTimeline.js';

const SPRITE_MOVES = [
  ...CHRONO_MOVES,
  ...ECHO_MOVES,
  ...IDOL_MOVES,
  ...GLITCH_MOVES.filter((move) => {
    const button = move.id.slice(move.id.lastIndexOf('.') + 1);
    return ['lp', 'hp', 'lk', 'hk'].includes(button);
  }),
];

test('every sheet attack has four approach poses, impact, and four return poses', () => {
  for (const move of SPRITE_MOVES) {
    const beats = timeline(move);

    assert.deepEqual(
      uniqueAmounts(beats, 'approach'),
      [0.25, 0.5, 0.75, 1],
      `${move.id} approach`,
    );
    assert.deepEqual(
      uniqueAmounts(beats, 'return'),
      [0.75, 0.5, 0.25, 0],
      `${move.id} return`,
    );
    assert.equal(
      beats.filter((beat) => beat.phase === 'strike').length,
      move.active,
      `${move.id} clean strike hold`,
    );
  }
});

test('the fourth return pose is the guarded fighting stance, not standing idle', () => {
  for (const move of SPRITE_MOVES) {
    const lastFrame = move.startup + move.active + move.recovery - 1;
    const beat = spriteAttackBeat(lastFrame, move);
    const progress = progressFor(beat);
    const actionPose = spritePoseFor(fighter(move.id), 0, progress);
    const fightingStance = spritePoseFor(fighter(null), 0, 0);

    assert.equal(beat.phase, 'return', move.id);
    assert.equal(beat.amount, 0, move.id);
    for (const name of Object.keys(fightingStance)) {
      assert.ok(
        Math.abs(actionPose[name] - fightingStance[name]) < 1e-10,
        `${move.id} ${name} returns to guard`,
      );
    }
    assert.ok(actionPose.forearm < -0.4, `${move.id} near hand guard`);
    assert.ok(actionPose.farForearm < -0.4, `${move.id} far hand guard`);
    assert.ok(actionPose.shin < -0.25, `${move.id} bent lead knee`);
    assert.ok(actionPose.farShin < -0.25, `${move.id} bent rear knee`);
  }
});

test('the four transition drawings are distinct and evenly spaced', () => {
  for (const move of SPRITE_MOVES) {
    const poseAt = (amount, phase) => spritePoseFor(
      fighter(move.id),
      0,
      progressFor({ amount, phase }),
    );
    const stance = spritePoseFor(fighter(null), 0, 0);
    const approach = [0.25, 0.5, 0.75, 1]
      .map((amount) => poseAt(amount, 'approach'));
    const returning = [0.75, 0.5, 0.25, 0]
      .map((amount) => poseAt(amount, 'return'));

    assert.equal(new Set(approach.map(poseKey)).size, 4, `${move.id} approach`);
    assert.equal(new Set(returning.map(poseKey)).size, 4, `${move.id} return`);

    // Linear pose blending makes the same joint travel the same distance on
    // each drawing instead of snapping on frame one and stalling on frame four.
    const joint = mostTravelledJoint(stance, approach[3]);
    assertEvenSteps([stance, ...approach], joint, `${move.id} approach`);
    assertEvenSteps(returning, joint, `${move.id} return`);
  }
});

function timeline(move) {
  return Array.from(
    { length: move.startup + move.active + move.recovery },
    (_, frame) => spriteAttackBeat(frame, move),
  );
}

function uniqueAmounts(beats, phase) {
  return [...new Set(
    beats
      .filter((beat) => beat.phase === phase)
      .map((beat) => beat.amount),
  )];
}

function progressFor(beat) {
  if (beat.phase === 'approach') return 0.34 * beat.amount;
  if (beat.phase === 'strike') return 0.58;
  return 0.58 + (1 - 0.58) * (1 - beat.amount);
}

function poseKey(pose) {
  return Object.values(pose).map((value) => value.toFixed(6)).join(',');
}

function mostTravelledJoint(from, to) {
  return Object.keys(from).reduce((best, name) => (
    Math.abs(to[name] - from[name]) > Math.abs(to[best] - from[best])
      ? name
      : best
  ));
}

function assertEvenSteps(poses, joint, label) {
  const distances = poses.slice(1).map(
    (pose, index) => Math.abs(pose[joint] - poses[index][joint]),
  );
  const first = distances[0];
  for (const distance of distances.slice(1)) {
    assert.ok(Math.abs(distance - first) < 1e-10, `${label} ${joint}`);
  }
}

function fighter(moveId) {
  return {
    id: 'p1',
    team: 0,
    health: 1_000,
    maxHealth: 1_000,
    position: { x: 0, y: 0 },
    previousPosition: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    facing: 1,
    grounded: true,
    guarding: false,
    hitstop: 0,
    hitstun: 0,
    action: moveId === null ? null : { moveId, frame: 0, serial: 1 },
  };
}
