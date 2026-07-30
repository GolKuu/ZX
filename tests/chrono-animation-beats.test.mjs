import assert from 'node:assert/strict';
import test from 'node:test';
import {
  chronoAnimationBeats,
} from '../.sim-test-build/src/stage/chrono/chronoAnimationBeats.js';

test('CHRONO attacks travel through five controlled animation beats', () => {
  const idle = chronoAnimationBeats(0);
  const anticipation = chronoAnimationBeats(0.2);
  const attack = chronoAnimationBeats(0.44);
  const impact = chronoAnimationBeats(0.56);
  const recovery = chronoAnimationBeats(0.82);
  const returnedIdle = chronoAnimationBeats(1);

  assert.deepEqual(idle, {
    anticipation: 0,
    attack: 0,
    impact: 0,
    recovery: 0,
  });
  assert.ok(anticipation.anticipation > 0);
  assert.ok(attack.attack > 0);
  assert.ok(impact.impact > 0.8);
  assert.ok(recovery.recovery > 0);
  assert.equal(returnedIdle.attack, 0);
  assert.equal(returnedIdle.recovery, 1);
});

test('CHRONO animation weights remain normalized and finite', () => {
  for (let frame = 0; frame <= 100; frame += 1) {
    const beats = chronoAnimationBeats(frame / 100);
    for (const value of Object.values(beats)) {
      assert.ok(Number.isFinite(value));
      assert.ok(value >= 0 && value <= 1);
    }
  }
});
