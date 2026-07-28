import { describe, expect, it } from 'vitest';
import { BlockSystem } from '../combat/BlockSystem';
import { ComboSystem } from '../combat/ComboSystem';
import { DamageSystem } from '../combat/DamageSystem';
import { DefensiveActionSystem } from '../combat/DefensiveActionSystem';
import { balanceConfig } from '../config/balanceConfig';
import { createFighter } from '../core/SimulationStateFactory';
import type {
  ComboSnapshot,
  CombatAction,
  PlayerInputFrame,
} from '../core/types';
import { getCharacterAttacks } from '../data/attacks/temporaryCharacterAttacks';

describe('complete defense system', () => {
  it('supports high and low guard while throws pass through both', () => {
    const attacks = getCharacterAttacks('pulse');
    expect(block(attacks.air, ['BLOCK']).blocked).toBe(true);
    expect(block(attacks.low, ['BLOCK']).blocked).toBe(false);
    expect(block(attacks.low, ['BLOCK', 'CROUCH']).blocked).toBe(true);
    expect(block(attacks.grab, ['BLOCK', 'CROUCH']).blocked).toBe(false);
  });

  it('scales gauge and block stun for normal, precise and perfect blocks', () => {
    const attack = getCharacterAttacks('pulse').special;
    const normal = applyBlockedAttack(attack, ['BLOCK']);
    const precise = applyBlockedAttack(attack, ['BLOCK', 'PRECISE_BLOCK']);
    const perfect = applyBlockedAttack(attack, ['BLOCK', 'PERFECT_BLOCK']);

    expect(normal.defender.health).toBeLessThan(normal.defender.maxHealth);
    expect(normal.defender.blockMeter).toBeLessThan(precise.defender.blockMeter);
    expect(precise.defender.modeTicksRemaining).toBeLessThan(normal.defender.modeTicksRemaining);
    expect(perfect.defender.health).toBe(perfect.defender.maxHealth);
    expect(perfect.defender.blockMeter).toBe(perfect.defender.maxBlockMeter);
    expect(perfect.defender.mode).toBe('blocking');
    expect(perfect.attacker.attack?.frame).toBe(
      10 - balanceConfig.perfectBlockAdvantageFrames,
    );
  });

  it('allows chip damage only on special and super attacks', () => {
    const attacks = getCharacterAttacks('pulse');
    expect(attacks.lightChain[0].chipDamage).toBe(0);
    expect(attacks.heavy[0].chipDamage).toBe(0);
    expect(attacks.special.chipDamage).toBeGreaterThan(0);
    expect(attacks.superAttack.chipDamage).toBeGreaterThan(0);
  });

  it('opens a narrow Escape window and applies cooldown to early or late attempts', () => {
    const actions = new DefensiveActionSystem();
    const fighter = stunnedFighter();
    const opponent = createFighter('player2', 520);
    const early = combo({ escapeWindowStartsInTicks: 2 });

    expect(actions.apply(fighter, opponent, pressed('COMBO_ESCAPE'), early)).toBe(false);
    expect(fighter.defense.feedback).toBe('too-early');
    expect(fighter.defense.comboEscapeCooldownTicks).toBe(
      balanceConfig.comboEscapeFailureCooldownFrames,
    );

    const lateFighter = stunnedFighter();
    const late = combo();
    expect(actions.apply(lateFighter, opponent, pressed('COMBO_ESCAPE'), late)).toBe(false);
    expect(lateFighter.defense.feedback).toBe('too-late');
  });

  it('escapes to neutral for free only during the marked window', () => {
    const actions = new DefensiveActionSystem();
    const fighter = stunnedFighter();
    const opponent = createFighter('player2', 540);
    fighter.energy = 37;
    const incoming = combo({ escapeWindowTicksRemaining: 2 });

    expect(actions.apply(fighter, opponent, pressed('COMBO_ESCAPE'), incoming)).toBe(true);
    expect(fighter.energy).toBe(37);
    expect(fighter.defense.segments).toBe(fighter.defense.maxSegments);
    expect(Math.abs(fighter.x - opponent.x)).toBe(balanceConfig.comboEscapeNeutralDistance);
    expect(incoming.hits).toBe(0);
  });

  it('spends one segment on a broad Combo Break shockwave without damage', () => {
    const actions = new DefensiveActionSystem();
    const fighter = stunnedFighter();
    const opponent = createFighter('player2', 520);
    const health = [fighter.health, opponent.health];
    const incoming = combo({ breakWindowTicksRemaining: 10, breakAllowed: true });

    expect(actions.apply(fighter, opponent, pressed('COMBO_BREAK'), incoming)).toBe(true);
    expect(fighter.defense.segments).toBe(fighter.defense.maxSegments - 1);
    expect(fighter.defense.effect).toBe('combo-break');
    expect(fighter.velocityX * opponent.velocityX).toBeLessThan(0);
    expect([fighter.health, opponent.health]).toEqual(health);
  });

  it('forbids Combo Break during throws, supers and finishers', () => {
    const attacks = getCharacterAttacks('pulse');
    const combos = new ComboSystem();
    for (const attack of [attacks.grab, attacks.superAttack, attacks.lightChain[3]]) {
      const incoming = combo();
      combos.register(incoming, 'player1', attack.damage, attack);
      expect(incoming.breakAllowed).toBe(false);
    }
    expect(balanceConfig.comboBreakWindowFrames)
      .toBeGreaterThan(balanceConfig.comboEscapeWindowFrames);
  });
});

function block(attack: ReturnType<typeof getCharacterAttacks>['low'], held: CombatAction[]) {
  const fighter = createFighter('player1', 450);
  const blocks = new BlockSystem();
  const input = frame(held);
  blocks.update(fighter, input);
  return blocks.tryBlock(fighter, input, attack);
}

function applyBlockedAttack(
  attack: ReturnType<typeof getCharacterAttacks>['special'],
  held: CombatAction[],
) {
  const attacker = createFighter('player2', 510);
  const defender = createFighter('player1', 450);
  attacker.attack = {
    id: attack.id, frame: 10, phase: 'active', hitHitboxes: [0], connected: true,
  };
  const blocks = new BlockSystem();
  const input = frame(held);
  blocks.update(defender, input);
  const result = blocks.tryBlock(defender, input, attack);
  new DamageSystem().apply(attacker, defender, attack, combo(), result);
  return { attacker, defender };
}

function stunnedFighter() {
  const fighter = createFighter('player1', 440);
  fighter.mode = 'hitstun';
  fighter.modeTicksRemaining = 12;
  return fighter;
}

function combo(overrides: Partial<ComboSnapshot> = {}): ComboSnapshot {
  return {
    hits: 2, damage: 12, targetId: 'player1', remainingTicks: 30,
    escapeWindowStartsInTicks: null, escapeWindowTicksRemaining: 0,
    breakWindowTicksRemaining: 0, breakAllowed: false, ...overrides,
  };
}

function frame(held: CombatAction[]): PlayerInputFrame {
  return { held, pressed: [], released: [] };
}

function pressed(action: CombatAction): PlayerInputFrame {
  return { held: [action], pressed: [action], released: [] };
}
