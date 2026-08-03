import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AI_DIFFICULTY_PROFILES,
  applyAiStrategy,
} from '../.sim-test-build/src/ai/index.js';

test('Gemini aggressive strategy increases pressure without changing reaction fairness', () => {
  const base = AI_DIFFICULTY_PROFILES.normal;
  const result = applyAiStrategy(base, { style: 'aggressive', range: 'close' });

  assert.equal(result.neutralAttackPercent, base.neutralAttackPercent + 14);
  assert.equal(result.defensePercent, base.defensePercent - 8);
  assert.equal(result.preferredMinimumDistance, base.preferredMinimumDistance - 180);
  assert.equal(result.reactionFrames, base.reactionFrames);
  assert.equal(result.comboDepth, base.comboDepth);
});

test('Gemini defensive strategy remains inside valid percentage bounds', () => {
  const result = applyAiStrategy(
    AI_DIFFICULTY_PROFILES.impossible,
    { style: 'defensive', range: 'long' },
  );
  assert.equal(result.defensePercent, 100);
  assert.equal(result.neutralAttackPercent, 80);
});
