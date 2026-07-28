import { describe, expect, it } from 'vitest';
import { getCharacterAttacks } from '../data/attacks/temporaryCharacterAttacks';

describe('temporary character attacks', () => {
  it.each(['comet', 'pulse'])('defines the complete moveset for %s', (characterId) => {
    const set = getCharacterAttacks(characterId);
    expect(set.lightChain).toHaveLength(3);
    expect(set.heavy).toHaveLength(2);
    expect([
      set.low,
      set.air,
      set.special,
      set.grab,
      set.forwardThrow,
      set.backThrow,
    ]).toHaveLength(6);
  });

  it('contains deterministic frame, collision and presentation metadata', () => {
    const attack = getCharacterAttacks('comet').special;
    expect(attack.startupFrames).toBeGreaterThan(0);
    expect(attack.activeFrames).toBeGreaterThan(0);
    expect(attack.recoveryFrames).toBeGreaterThan(0);
    expect(attack.hitboxes[0].startFrame).toBe(attack.startupFrames);
    expect(attack.animationId).toBeTruthy();
    expect(attack.effectId).toBeTruthy();
    expect(attack.soundId).toBeTruthy();
  });
});
