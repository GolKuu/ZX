import assert from 'node:assert/strict';
import test from 'node:test';
import {
  KNOCKDOWN_DOWN_FRAMES,
  KNOCKDOWN_FRAMES,
  KNOCKDOWN_GETUP_FRAMES,
} from '../.sim-test-build/src/sim/knockdown.js';
import {
  isFalling,
  photoFallFrame,
  photoFallPose,
} from '../.sim-test-build/src/stage/photoSprite/photoFallAnimation.js';

const DOWN_FRAMES = KNOCKDOWN_DOWN_FRAMES + KNOCKDOWN_GETUP_FRAMES;
const STAGGER = 7;
const PRONE = 11;
const CROUCH = 5;
const FIGHTING_STANCE = 4;

function standing() {
  return {
    grounded: true,
    health: 100,
    knockdownFrames: 0,
    knockdownPhase: 'none',
  };
}

function launched(sinceHit) {
  return {
    grounded: false,
    health: 100,
    knockdownFrames: KNOCKDOWN_FRAMES - sinceHit,
    knockdownPhase: 'falling',
  };
}

function down(sinceLanding) {
  return {
    grounded: true,
    health: 100,
    knockdownFrames: DOWN_FRAMES - sinceLanding,
    knockdownPhase: 'down',
  };
}

function rising(sinceRise) {
  return {
    grounded: true,
    health: 100,
    knockdownFrames: KNOCKDOWN_GETUP_FRAMES - sinceRise,
    knockdownPhase: 'rising',
  };
}

function defeated() {
  return { ...standing(), health: 0 };
}

/** The whole fall, frame by frame, as the simulation would drive it. */
function fallTimeline(airborneFrames) {
  const poses = [];
  for (let frame = 0; frame < airborneFrames; frame += 1) {
    poses.push(photoFallPose(launched(frame), 0));
  }
  for (let frame = 0; frame <= DOWN_FRAMES - KNOCKDOWN_GETUP_FRAMES; frame += 1) {
    poses.push(photoFallPose(down(frame), 0));
  }
  for (let frame = 0; frame <= KNOCKDOWN_GETUP_FRAMES; frame += 1) {
    poses.push(photoFallPose(rising(frame), 0));
  }
  return poses;
}

test('a standing fighter has no fall pose at all', () => {
  assert.equal(isFalling(standing()), false);
  assert.equal(photoFallFrame(standing()), null);
  assert.deepEqual(photoFallPose(standing(), 3.5), {
    rotation: 0, drop: 0, slide: 0, scaleX: 1, scaleY: 1,
  });
});

test('the body tips over gradually instead of snapping flat', () => {
  const tilts = [0, 2, 4, 8, 14].map((frame) =>
    photoFallPose(launched(frame), 0).rotation);
  assert.equal(tilts[0], 0, 'the hit frame must still be upright');
  for (let index = 1; index < tilts.length; index += 1) {
    assert.ok(
      tilts[index] > tilts[index - 1],
      `tilt stalled between launch frames: ${tilts.join(', ')}`,
    );
  }
  assert.ok(tilts.at(-1) < photoFallPose(down(13), 0).rotation);
});

test('an airborne fighter is never pushed below its standing centre', () => {
  for (let frame = 0; frame < 40; frame += 1) {
    assert.equal(photoFallPose(launched(frame), 0).drop, 0);
  }
});

test('the landing squashes the body and rebounds before settling', () => {
  const landing = photoFallPose(down(0), 0);
  const squash = photoFallPose(down(2), 0);
  const deepest = photoFallPose(down(6), 0);
  const rebound = photoFallPose(down(9), 0);
  const settled = photoFallPose(down(20), 0);

  assert.ok(squash.scaleY < landing.scaleY, 'the impact must compress the body');
  assert.ok(squash.scaleX > landing.scaleX, 'a compressed body must spread');
  assert.ok(deepest.drop > landing.drop, 'the body must reach the floor');
  assert.ok(rebound.drop < deepest.drop, 'the body must rebound off the floor');
  assert.ok(settled.drop > rebound.drop, 'the body must then settle flat');
  assert.ok(
    Math.abs(settled.scaleY - 1) < 0.02,
    'a settled body must be back to its own proportions',
  );
});

test('the fall always lays a fighter down away from its opponent', () => {
  // The parent group carries the mirror, so both sides share one sign: a facing
  // term here would cancel it out and drop one side onto its face.
  for (const pose of fallTimeline(20)) {
    assert.ok(pose.rotation >= -0.1, `a fall tipped forwards: ${pose.rotation}`);
    assert.ok(pose.slide <= 0, `a fall slid toward the opponent: ${pose.slide}`);
  }
});

test('the fall never jumps between neighbouring frames', () => {
  // A launch of 170 to 260 fixed units against 24 per frame of gravity puts the
  // landing anywhere in this range, and every one of them must read as one move.
  for (const airborneFrames of [14, 18, 22]) {
    const poses = fallTimeline(airborneFrames);
    for (let index = 1; index < poses.length; index += 1) {
      const previous = poses[index - 1];
      const current = poses[index];
      assert.ok(
        Math.abs(current.rotation - previous.rotation) < 0.28,
        `${airborneFrames}f airtime: rotation jumped at ${index}`
        + ` (${previous.rotation} → ${current.rotation})`,
      );
      assert.ok(
        Math.abs(current.drop - previous.drop) < 0.14,
        `${airborneFrames}f airtime: height jumped at ${index}`
        + ` (${previous.drop} → ${current.drop})`,
      );
    }
  }
});

test('the get-up returns the fighter exactly to standing', () => {
  const finished = photoFallPose(rising(KNOCKDOWN_GETUP_FRAMES), 0);
  assert.deepEqual(finished, {
    rotation: 0, drop: 0, slide: 0, scaleX: 1, scaleY: 1,
  });
  const midway = photoFallPose(rising(13), 0);
  assert.ok(midway.drop < photoFallPose(down(20), 0).drop, 'the rise must lift');
  assert.ok(
    photoFallPose(rising(19), 0).rotation < 0,
    'the rise must cross past standing so it arrives with momentum',
  );
});

test('the fall walks the sheet out of the floor and back onto guard', () => {
  assert.equal(photoFallFrame(launched(4)), STAGGER);
  assert.equal(photoFallFrame(down(0)), PRONE);
  assert.equal(photoFallFrame(down(20)), PRONE);
  assert.equal(photoFallFrame(rising(1)), PRONE);
  assert.equal(photoFallFrame(rising(8)), CROUCH);
  assert.equal(
    photoFallFrame(rising(KNOCKDOWN_GETUP_FRAMES - 2)),
    FIGHTING_STANCE,
  );
});

test('a defeated fighter collapses on its own clock and stays down', () => {
  assert.ok(isFalling(defeated()));
  assert.equal(photoFallPose(defeated(), 0, 0).rotation, 0);
  const collapse = [0, 6, 12, 18].map((frame) =>
    photoFallPose(defeated(), 0, frame));
  for (let index = 1; index < collapse.length; index += 1) {
    assert.ok(
      collapse[index].rotation > collapse[index - 1].rotation
      && collapse[index].drop > collapse[index - 1].drop,
      'the collapse must keep folding toward the floor',
    );
  }
  const settled = photoFallPose(defeated(), 0, 60);
  const muchLater = photoFallPose(defeated(), 0, 600);
  assert.ok(Math.abs(settled.rotation - muchLater.rotation) < 0.01);
  assert.equal(photoFallFrame(defeated(), 0), STAGGER);
  assert.equal(photoFallFrame(defeated(), 20), PRONE);
});

test('a fighter that dies while knocked down never gets back up', () => {
  const dyingWhileRising = { ...rising(4), health: 0 };
  const alive = photoFallPose(rising(4), 0);
  const dead = photoFallPose(dyingWhileRising, 0, 40);
  assert.ok(dead.drop > alive.drop, 'a dead fighter must stay on the floor');
  assert.equal(photoFallFrame(dyingWhileRising, 40), PRONE);
});

test('only a resting body breathes, so the fall itself stays deterministic', () => {
  for (const fighter of [launched(6), down(2), rising(6)]) {
    assert.deepEqual(photoFallPose(fighter, 0), photoFallPose(fighter, 7.3));
  }
  assert.notDeepEqual(photoFallPose(down(25), 0), photoFallPose(down(25), 0.7));
});
