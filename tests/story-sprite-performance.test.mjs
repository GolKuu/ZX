import assert from 'node:assert/strict';
import test from 'node:test';
import { storySpritePerformance } from '../.sim-test-build/src/story/spritePerformance.js';

const FIGHTERS = ['glitch', 'mim', 'lucky', 'titan', 'vorgh'];
const EXPRESSIONS = [
  'normal', 'determined', 'injured', 'frightened', 'angry',
  'unstable', 'influenced', 'liberated', 'other', 'fifth',
];

test('every story performance points at a real frame in the combat atlas', () => {
  for (const fighter of FIGHTERS) {
    for (const expression of EXPRESSIONS) {
      const performance = storySpritePerformance(fighter, expression, true);
      assert.ok(performance.frame >= 0 && performance.frame < 16);
      assert.equal(performance.column, performance.frame % 4);
      assert.equal(performance.row, Math.floor(performance.frame / 4));
      assert.equal(performance.sequence.length, 4);
      for (const frame of performance.sequence) {
        assert.ok(frame >= 0 && frame < 16);
      }
    }
  }
});

test('speaking performances have anticipation, action and follow-through drawings', () => {
  for (const fighter of FIGHTERS) {
    const performance = storySpritePerformance(fighter, 'angry', true);
    assert.ok(new Set(performance.sequence).size >= 3, fighter);
    assert.equal(performance.sequence[2], performance.frame);
  }
});

test('speaking rivals use their own signature action pose', () => {
  const frames = new Set(FIGHTERS.map((fighter) => (
    storySpritePerformance(fighter, 'angry', true).frame
  )));
  assert.ok(frames.size >= 2);
  for (const fighter of FIGHTERS) {
    assert.equal(storySpritePerformance(fighter, 'normal', false).frame, 0);
  }
});
