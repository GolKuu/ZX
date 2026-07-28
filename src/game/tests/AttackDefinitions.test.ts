import { describe, expect, it } from 'vitest';
import { getCharacterAttacks } from '../data/attacks/characterAttacks';
import { circleFighters } from '../data/characters/circleFighters';

describe('character attacks', () => {
  it.each(circleFighters.map((fighter) => fighter.id))(
    'defines the complete base moveset for %s',
    (characterId) => {
    const set = getCharacterAttacks(characterId);
    expect(set.lightChain).toHaveLength(3);
    expect(set.heavy).toHaveLength(3);
    expect([
      set.low,
      set.lowHeavy,
      set.air,
      set.airHeavy,
      set.special,
      set.forwardSpecial,
      set.retreatSpecial,
      set.enhancedSpecial,
      set.grab,
      set.forwardThrow,
      set.backThrow,
    ]).toHaveLength(11);
    },
  );

  it('contains deterministic frame, collision and presentation metadata', () => {
    const attack = getCharacterAttacks('granite').special;
    expect(attack.startupFrames).toBeGreaterThan(0);
    expect(attack.activeFrames).toBeGreaterThan(0);
    expect(attack.recoveryFrames).toBeGreaterThan(0);
    expect(attack.hitboxes[0].startFrame).toBe(attack.startupFrames);
    expect(attack.animationId).toBeTruthy();
    expect(attack.effectId).toBeTruthy();
    expect(attack.soundId).toBeTruthy();
  });

  it('assigns a distinct effect id to every attack variant', () => {
    const set = getCharacterAttacks('granite');
    const attacks = [
      ...set.lightChain,
      ...set.heavy,
      set.low,
      set.lowHeavy,
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
      set.enhancedSpecial,
      set.grab,
      set.forwardThrow,
      set.backThrow,
      set.reversal,
      set.superAttack,
    ];
    expect(new Set(attacks.map((attack) => attack.effectId)).size).toBe(attacks.length);
  });

  it('uses 88% scaling for light and heavy auto combos', () => {
    const set = getCharacterAttacks('granite');
    expect(set.lightChain.every((attack) => attack.comboScaling === 0.88)).toBe(true);
    expect(set.heavy.every((attack) => attack.comboScaling === 0.88)).toBe(true);
  });

  it.each(['granite', 'shira'])('places standing strikes above low attacks for %s', (id) => {
    const set = getCharacterAttacks(id);
    [...set.lightChain, ...set.heavy].forEach((attack) => {
      const hitbox = attack.hitboxes[0];
      expect(hitbox.offsetY + hitbox.height / 2).toBeLessThanOrEqual(-60);
    });
    const lowHitbox = set.low.hitboxes[0];
    expect(lowHitbox.offsetY + lowHitbox.height / 2).toBeGreaterThan(-30);
  });

  it('uses different hit shapes and leg animations across the roster', () => {
    circleFighters.forEach((fighter) => {
      const set = getCharacterAttacks(fighter.id);
      const basics = [...set.lightChain, ...set.heavy, set.low, set.air, set.airHeavy];
      expect(new Set(basics.map((attack) => attack.visualShape)).size).toBeGreaterThan(1);
      expect(basics.some((attack) => attack.motion.includes('kick'))).toBe(true);
    });
  });
});
