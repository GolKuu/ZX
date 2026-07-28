import { describe, expect, it } from 'vitest';
import { BlockSystem } from '../combat/BlockSystem';
import { CombatContactResolver } from '../combat/CombatContactResolver';
import { DamageSystem } from '../combat/DamageSystem';
import { createFighter, createInitialState } from '../core/SimulationStateFactory';
import type { ComboSnapshot, PlayerInputFrame } from '../core/types';
import { getCharacterAttacks } from '../data/attacks/characterAttacks';

describe('force advantage combat bonuses', () => {
  it('adds 4% damage and 5% energy without penalizing the reverse attacker', () => {
    const attack = getCharacterAttacks('adamant').heavy[0];
    const advantaged = createFighter('player1', 400, 'adamant');
    const defender = createFighter('player2', 500, 'vassa');
    new DamageSystem().apply(advantaged, defender, attack, emptyCombo(), noBlock());

    expect(defender.maxHealth - defender.health).toBe(Math.round(attack.damage * 1.04));
    expect(advantaged.energy).toBeCloseTo(attack.energyGain * 1.05);

    const reverseAttack = getCharacterAttacks('vassa').heavy[0];
    const disadvantaged = createFighter('player1', 400, 'vassa');
    const reverseDefender = createFighter('player2', 500, 'adamant');
    new DamageSystem().apply(
      disadvantaged,
      reverseDefender,
      reverseAttack,
      emptyCombo(),
      noBlock(),
    );

    expect(reverseDefender.maxHealth - reverseDefender.health).toBe(reverseAttack.damage);
    expect(disadvantaged.energy).toBe(reverseAttack.energyGain);
    expect(reverseDefender.energy)
      .toBeCloseTo(Math.round(reverseAttack.damage * 0.35) * 1.05);
  });

  it('adds 5% block damage through the contact resolver', () => {
    const state = createInitialState({ player1: 'adamant', player2: 'vassa' });
    const attack = getCharacterAttacks('adamant').heavy[0];
    state.fighters.player2.guard = 'standing';
    new CombatContactResolver().resolve(
      state,
      new BlockSystem(),
      'player1',
      'player2',
      { definition: attack, hitboxIndex: 0 },
      blockingInput(),
    );

    expect(state.fighters.player2.blockMeter)
      .toBeCloseTo(state.fighters.player2.maxBlockMeter - attack.blockDamage * 1.05);
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

function noBlock() {
  return { kind: 'none' as const, blocked: false };
}

function blockingInput(): PlayerInputFrame {
  return { held: ['BLOCK'], pressed: [], released: [] };
}
