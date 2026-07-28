import { describe, expect, it } from 'vitest';
import { ArenaTrapSystem } from '../combat/ArenaTrapSystem';
import { AttackSelector } from '../combat/AttackSelector';
import { DamageSystem } from '../combat/DamageSystem';
import { createFighter } from '../core/SimulationStateFactory';
import type { ComboSnapshot, PlayerInputFrame } from '../core/types';
import { getCharacterAttacks } from '../data/attacks/characterAttacks';
import { circleFighters } from '../data/characters/circleFighters';
import { validateHitboxAlignment } from '../diagnostics/HitboxAlignment';

describe('Granite and Shira prototypes', () => {
  it('ships at least 30 shared replaceable animation states per fighter', () => {
    circleFighters.forEach((fighter) => {
      expect(fighter.animationStates.length).toBeGreaterThanOrEqual(30);
      expect(new Set(fighter.animationStates).size).toBe(fighter.animationStates.length);
      expect(fighter.animationStates).toContain('victory');
      expect(fighter.animationStates).toContain('perfect-block');
    });
  });

  it('keeps every generated attack visual aligned to its gameplay hitbox', () => {
    const report = validateHitboxAlignment();
    expect(report.checked).toBeGreaterThanOrEqual(40);
    expect(report.errors).toEqual([]);
  });

  it('spends a Granite armor plate to reduce a light strike and avoid hit reaction', () => {
    const attacker = createFighter('player2', 430, 'shira');
    const defender = createFighter('player1', 500, 'granite');
    const attack = getCharacterAttacks('shira').lightChain[0];
    const startingHealth = defender.health;

    new DamageSystem().apply(attacker, defender, attack, emptyCombo(), {
      kind: 'none',
      blocked: false,
    });

    expect(defender.armorPlates).toBe(2);
    expect(defender.health).toBeGreaterThan(startingHealth - attack.damage);
    expect(defender.mode).toBe('idle');
  });

  it('builds sharpness from hits and spends a full gauge on the enhanced special', () => {
    const shira = createFighter('player1', 430, 'shira');
    const defender = createFighter('player2', 500, 'granite');
    const attack = getCharacterAttacks('shira').lightChain[0];
    new DamageSystem().apply(shira, defender, attack, emptyCombo(), {
      kind: 'none',
      blocked: false,
    });
    expect(shira.passiveValue).toBeGreaterThan(0);

    shira.passiveValue = shira.maxPassiveValue;
    const input: PlayerInputFrame = {
      held: ['HEAVY_ATTACK', 'SPECIAL_ATTACK'],
      pressed: ['SPECIAL_ATTACK'],
      released: [],
    };
    expect(new AttackSelector().select(shira, input)?.id).toBe('shira-enhanced-special');
  });

  it('lets only Shira cut marked arena traps and gain sharpness', () => {
    const fighter = createFighter('player1', 430, 'shira');
    const definition = getCharacterAttacks('shira').lightChain[0];
    fighter.attack = {
      id: definition.id,
      frame: definition.startupFrames,
      phase: 'active',
      hitHitboxes: [],
      connected: false,
    };
    const traps = [{ id: 'test-ribbon', x: 500, active: true, cuttable: true }];
    new ArenaTrapSystem().tryCut(fighter, definition, traps);
    expect(traps[0].active).toBe(false);
    expect(fighter.passiveValue).toBe(24);
  });
});

function emptyCombo(): ComboSnapshot {
  return {
    hits: 0,
    damage: 0,
    targetId: null,
    remainingTicks: 0,
    escapeWindowStartsInTicks: null,
    escapeWindowTicksRemaining: 0,
    breakWindowTicksRemaining: 0,
    breakAllowed: false,
  };
}
