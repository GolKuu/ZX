import assert from 'node:assert/strict';
import test from 'node:test';
import {
  photoDashEchoOpacity,
  photoImpactPose,
} from '../.sim-test-build/src/stage/photoSprite/photoCombatMotion.js';

test('a hit drives the whole body away and returns exactly to neutral', () => {
  const light = photoImpactPose(0.04, 18);
  const heavy = photoImpactPose(0.04, 110);
  assert.ok(light.x < 0 && light.rotation > 0);
  assert.ok(heavy.x < light.x, 'a heavy hit must carry more recoil');
  assert.ok(heavy.scaleX > 1 && heavy.scaleY < 1, 'impact must compress the body');
  assert.deepEqual(photoImpactPose(0.5, 110), {
    x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1,
  });
});

test('dash echoes form a fading trail and disappear outside a dash', () => {
  const trail = [0, 1, 2].map((index) => photoDashEchoOpacity(8, index));
  assert.ok(trail[0] > trail[1] && trail[1] > trail[2]);
  assert.deepEqual([0, 1, 2].map((index) => photoDashEchoOpacity(0, index)), [0, 0, 0]);
});
