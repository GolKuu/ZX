import assert from 'node:assert/strict';
import test from 'node:test';
import { moveKindFor } from '../.sim-test-build/src/data/move-kind.js';
import { CHRONO_SUPER_MOVE_IDS } from '../.sim-test-build/src/data/chrono-super-moves.js';
import { ECHO_SUPER_MOVE_IDS } from '../.sim-test-build/src/data/echo-super-moves.js';
import { GLITCH_SUPER_MOVE_IDS } from '../.sim-test-build/src/data/glitch-super-moves.js';
import { IDOL_MOVE_IDS } from '../.sim-test-build/src/data/idol-move-ids.js';
import { MIM_MOVE_IDS } from '../.sim-test-build/src/data/mim-moves.js';
import { MIM_SUPER_MOVE_IDS } from '../.sim-test-build/src/data/mim-super-moves.js';
import { TAUNT_MOVE_ID, TAUNT_MOVES } from '../.sim-test-build/src/data/taunt-move.js';
import { DASH_FRAMES } from '../.sim-test-build/src/sim/dash.js';
import { spritePoseFor } from '../.sim-test-build/src/stage/sprite2d/spritePose.js';
import { mimAnimationBeat } from '../.sim-test-build/src/stage/mim/mimSpriteTimeline.js';
import { mimSpritePoseFor } from '../.sim-test-build/src/stage/mim/mimSpritePose.js';

const HINGES = ['forearm', 'farForearm', 'shin', 'farShin'];
const STRAIGHT = 0.2;
const STRIKE_PROGRESS = 0.58;

function fighter(overrides = {}) {
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
    dashFrames: 0,
    hitstop: 0,
    hitstun: 0,
    action: null,
    ...overrides,
  };
}

function acting(moveId) {
  return fighter({ action: { moveId, frame: 0, serial: 1 } });
}

function poseKey(pose) {
  return Object.values(pose).map((value) => value.toFixed(6)).join(',');
}

test('every tier of move is classified from the gameplay registries', () => {
  assert.equal(moveKindFor(MIM_MOVE_IDS.snap), 'normal');
  assert.equal(moveKindFor(MIM_SUPER_MOVE_IDS.prank), 'super');
  assert.equal(moveKindFor(MIM_SUPER_MOVE_IDS.hero), 'super');
  assert.equal(moveKindFor(MIM_SUPER_MOVE_IDS.altF4), 'ultimate');
  assert.equal(moveKindFor(ECHO_SUPER_MOVE_IDS.statistics), 'ultimate');
  assert.equal(moveKindFor(IDOL_MOVE_IDS.cancel), 'ultimate');
  assert.equal(moveKindFor(CHRONO_SUPER_MOVE_IDS.rewind), 'super');
  assert.equal(moveKindFor(GLITCH_SUPER_MOVE_IDS.patchNotes), 'ultimate');
  assert.equal(moveKindFor(TAUNT_MOVE_ID), 'taunt');
  assert.equal(moveKindFor('xray'), 'ultimate');
});

test('supers, ultimates and the taunt no longer animate as a jab', () => {
  const jab = poseKey(spritePoseFor(acting('idol.lp'), 0, STRIKE_PROGRESS));
  const keys = new Set([jab]);

  for (const moveId of [
    CHRONO_SUPER_MOVE_IDS.rewind,
    CHRONO_SUPER_MOVE_IDS.inevitability,
    TAUNT_MOVE_ID,
  ]) {
    const key = poseKey(spritePoseFor(acting(moveId), 0, STRIKE_PROGRESS));
    assert.ok(!keys.has(key), `${moveId} should have its own pose`);
    keys.add(key);
  }
});

test('the super lunges further than a heavy, the ultimate rises off the floor', () => {
  const heavy = spritePoseFor(acting('glitch.hp'), 0, STRIKE_PROGRESS);
  const superPose = spritePoseFor(
    acting(GLITCH_SUPER_MOVE_IDS.critical),
    0,
    STRIKE_PROGRESS,
  );
  const ultimate = spritePoseFor(
    acting(GLITCH_SUPER_MOVE_IDS.patchNotes),
    0,
    STRIKE_PROGRESS,
  );
  const stance = spritePoseFor(fighter(), 0, 0);

  assert.ok(superPose.drift > heavy.drift, 'super commits to a longer lunge');
  assert.ok(superPose.lift < heavy.lift, 'and drops the hips into it');
  assert.ok(ultimate.lift > stance.lift, 'the ultimate leaves the ground');
  assert.ok(
    ultimate.farUpperArm > superPose.farUpperArm,
    'and throws the far arm wide open',
  );
});

test('the taunt stands up out of the fighting crouch', () => {
  const stance = spritePoseFor(fighter(), 0, 0);
  const taunt = spritePoseFor(acting(TAUNT_MOVE_ID), 0, STRIKE_PROGRESS);

  assert.ok(taunt.shin > stance.shin, 'lead knee straightens');
  assert.ok(taunt.farShin > stance.farShin, 'rear knee straightens');
  assert.ok(taunt.lift > stance.lift, 'the fighter rises');
  assert.ok(taunt.upperArm > stance.upperArm + 0.5, 'lead hand comes up');
});

test('a dash reads as a dash rather than a fast walk', () => {
  const forward = spritePoseFor(
    fighter({ dashFrames: 4, velocity: { x: 195, y: 0 } }),
    0,
    0,
  );
  const back = spritePoseFor(
    fighter({ dashFrames: 4, velocity: { x: -159, y: 0 } }),
    0,
    0,
  );
  const walking = spritePoseFor(fighter({ velocity: { x: 65, y: 0 } }), 0, 0);

  assert.notEqual(poseKey(forward), poseKey(walking));
  assert.notEqual(poseKey(forward), poseKey(back));
  assert.ok(forward.torso > walking.torso, 'a forward dash pitches in');
  assert.ok(forward.lift < walking.lift, 'and stays low');
  assert.ok(back.lift > forward.lift, 'a back dash hops instead');
  assert.ok(back.forearm < -0.4, 'a back dash keeps the guard up');
});

test('the dash animation moves through its eight frames', () => {
  const keys = new Set();
  for (let remaining = DASH_FRAMES - 1; remaining >= 1; remaining -= 1) {
    keys.add(poseKey(spritePoseFor(
      fighter({ dashFrames: remaining, velocity: { x: 195, y: 0 } }),
      0,
      0,
    )));
  }
  assert.ok(keys.size >= 4, `expected a moving dash, saw ${keys.size} poses`);
});

test('no new pose bends a knee or an elbow backwards', () => {
  const moves = [
    MIM_SUPER_MOVE_IDS.prank,
    MIM_SUPER_MOVE_IDS.altF4,
    ECHO_SUPER_MOVE_IDS.analysis,
    IDOL_MOVE_IDS.cancel,
    TAUNT_MOVE_ID,
  ];
  for (let step = 0; step <= 20; step += 1) {
    const progress = step / 20;
    for (const moveId of moves) {
      const pose = spritePoseFor(acting(moveId), step * 0.37, progress);
      for (const hinge of HINGES) {
        assert.ok(
          pose[hinge] <= STRAIGHT,
          `${moveId} @ ${progress.toFixed(2)}: ${hinge} at ${String(pose[hinge])}`,
        );
      }
    }
    for (const velocity of [195, -159]) {
      for (let remaining = 1; remaining < DASH_FRAMES; remaining += 1) {
        const pose = spritePoseFor(
          fighter({ dashFrames: remaining, velocity: { x: velocity, y: 0 } }),
          step * 0.37,
          0,
        );
        for (const hinge of HINGES) {
          assert.ok(pose[hinge] <= STRAIGHT, `dash ${velocity}: ${hinge}`);
        }
      }
    }
  }
});

test('MIM has authored frames for her supers, ultimate and taunt', () => {
  const taunt = TAUNT_MOVES[0];
  assert.equal(mimAnimationBeat(MIM_SUPER_MOVE_IDS.prank, 0)?.kind, 'super');
  assert.equal(mimAnimationBeat(MIM_SUPER_MOVE_IDS.hero, 0)?.kind, 'super');
  assert.equal(mimAnimationBeat(MIM_SUPER_MOVE_IDS.altF4, 0)?.kind, 'ultimate');
  assert.equal(mimAnimationBeat(TAUNT_MOVE_ID, 0)?.kind, 'taunt');
  assert.equal(mimAnimationBeat(MIM_MOVE_IDS.snap, 0)?.kind, 'lp');
  assert.equal(mimAnimationBeat('nothing.at.all', 0), null);

  // Only the four normals have a sliced drawing; the rest stay on the rig.
  assert.equal(mimAnimationBeat(MIM_MOVE_IDS.snap, 0)?.button, 'lp');
  assert.equal(mimAnimationBeat(MIM_SUPER_MOVE_IDS.hero, 0)?.button, null);
  assert.equal(mimAnimationBeat(TAUNT_MOVE_ID, taunt.startup)?.button, null);
});

test('MIM moves through her supers instead of standing in idle', () => {
  const idle = mimSpritePoseFor(fighter(), 0, null);
  const held = (moveId, frame) => mimSpritePoseFor(
    acting(moveId),
    0,
    mimAnimationBeat(moveId, frame),
  );
  const superFrame = held(MIM_SUPER_MOVE_IDS.hero, 24);
  const ultimateFrame = held(MIM_SUPER_MOVE_IDS.altF4, 14);
  const tauntFrame = held(TAUNT_MOVE_ID, 10);

  for (const [label, pose] of [
    ['super', superFrame],
    ['ultimate', ultimateFrame],
    ['taunt', tauntFrame],
  ]) {
    assert.notEqual(poseKey(pose), poseKey(idle), `${label} should animate`);
  }
  assert.ok(ultimateFrame.lift > idle.lift, 'ALT+F4 leaves the floor');
  assert.ok(superFrame.drift > 0.2, 'the super lunges in');
});

test('MIM dashes with her own pose', () => {
  const dashing = mimSpritePoseFor(
    fighter({ dashFrames: 4, velocity: { x: 195, y: 0 } }),
    0,
    null,
  );
  const walking = mimSpritePoseFor(
    fighter({ velocity: { x: 65, y: 0 } }),
    0,
    null,
  );
  assert.notEqual(poseKey(dashing), poseKey(walking));
  assert.ok(dashing.torso > walking.torso, 'MIM pitches into a dash');
});
