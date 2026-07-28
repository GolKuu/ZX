import { describe, expect, it } from 'vitest';
import { getCharacterAttacks } from '../data/attacks/temporaryCharacterAttacks';

describe('temporary character attacks', () => {
  it.each(['comet', 'pulse'])('defines the complete moveset for %s', (characterId) => {
    const set = getCharacterAttacks(characterId);
    expect(set.lightChain).toHaveLength(4);
    expect(set.heavy).toHaveLength(3);
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

  it('assigns a distinct effect id to every attack variant', () => {
    const set = getCharacterAttacks('comet');
    const attacks = [
      ...set.lightChain,
      ...set.heavy,
      set.low,
      set.air,
      set.airHeavy,
      set.forwardLight,
      set.retreatLight,
      set.dashLight,
      set.forwardHeavy,
      set.retreatHeavy,
      set.dashHeavy,
      set.special,
      set.forwardSpecial,
      set.retreatSpecial,
      set.airSpecial,
      set.grab,
      set.forwardThrow,
      set.backThrow,
      set.reversal,
      set.superAttack,
    ];
    expect(new Set(attacks.map((attack) => attack.effectId)).size).toBe(attacks.length);
  });

  it('uses 88% scaling for light and heavy auto combos', () => {
    const set = getCharacterAttacks('comet');
    expect(set.lightChain.every((attack) => attack.comboScaling === 0.88)).toBe(true);
    expect(set.heavy.every((attack) => attack.comboScaling === 0.88)).toBe(true);
  });
});
