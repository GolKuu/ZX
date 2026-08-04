import assert from 'node:assert/strict';
import test from 'node:test';
import { CHARACTER_ROSTER } from '../.sim-test-build/src/data/characterRoster.js';
import { VICTORY_CINEMATICS, victoryCinematicFor } from '../.sim-test-build/src/data/victoryCinematics.js';

test('every selectable fighter has a complete victory cinematic', () => {
  assert.deepEqual(Object.keys(VICTORY_CINEMATICS).sort(), CHARACTER_ROSTER.map(({ id }) => id).sort());
  for (const fighter of CHARACTER_ROSTER) {
    const cinematic = victoryCinematicFor(fighter.id);
    assert.equal(cinematic.characterId, fighter.id);
    assert.ok(cinematic.title.length > 3);
    assert.ok(cinematic.subtitle.includes('//'));
    assert.ok(cinematic.quote.length > 10);
    assert.match(cinematic.accent, /^#[\da-f]{6}$/i);
  }
});
