import assert from 'node:assert/strict';
import test from 'node:test';
import { spriteAttackFrame } from '../.sim-test-build/src/stage/sprite2d/spriteAttackTimeline.js';
import {
  PHOTO_KICK_NORMAL_IDS,
  photoAttackKind,
  photoAttackMotion,
} from '../.sim-test-build/src/stage/photoSprite/photoKickAnimation.js';

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
    x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1,
  });
});
