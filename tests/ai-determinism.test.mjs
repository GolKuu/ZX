import assert from 'node:assert/strict';
import test from 'node:test';
import { makeAgent, world } from './ai-test-utils.mjs';

test('AI decisions are identical for the same seed and snapshots', () => {
  const first = makeAgent('normal', 42);
  const second = makeAgent('normal', 42);
  const firstDecisions = [];
  const secondDecisions = [];

  for (let frame = 0; frame < 180; frame += 1) {
    const snapshot = world(frame, {
      playerX: 900 + (frame % 40) * 10,
    });
    firstDecisions.push(first.decide(snapshot));
    secondDecisions.push(second.decide(snapshot));
  }
  assert.deepEqual(firstDecisions, secondDecisions);
});

test('difficulty profiles scale reaction, telegraph, and combo depth', async () => {
  const { AI_DIFFICULTY_PROFILES } = await import(
    '../.sim-test-build/src/ai/index.js'
  );
  const easy = AI_DIFFICULTY_PROFILES.easy;
  const normal = AI_DIFFICULTY_PROFILES.normal;
  const hard = AI_DIFFICULTY_PROFILES.hard;
  assert.ok(easy.reactionFrames > normal.reactionFrames);
  assert.ok(normal.reactionFrames > hard.reactionFrames);
  assert.ok(easy.telegraphFrames > normal.telegraphFrames);
  assert.ok(normal.telegraphFrames > hard.telegraphFrames);
  assert.ok(easy.comboDepth < normal.comboDepth);
  assert.ok(normal.comboDepth < hard.comboDepth);
});
