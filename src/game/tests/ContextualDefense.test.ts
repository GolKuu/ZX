import { describe, expect, it } from 'vitest';
import { BlockSystem } from '../combat/BlockSystem';
import { FIXED_STEP_SECONDS } from '../config/balanceConfig';
import { CombatSimulation } from '../core/CombatSimulation';
import { createFighter } from '../core/SimulationStateFactory';
import { getCharacterAttacks } from '../data/attacks/temporaryCharacterAttacks';
import { emptyInputFrame } from './testFixtures';

describe('contextual defense', () => {
  it('keeps block meter on a perfect block', () => {
    const fighter = createFighter('player1', 430);
    const blocks = new BlockSystem();
    const input = {
      held: ['BLOCK', 'PERFECT_BLOCK'] as const,
      pressed: [],
      released: [],
    };
    blocks.update(fighter, input);
    expect(blocks.tryBlock(
      fighter,
      input,
      getCharacterAttacks('shira').lightChain[0],
    )).toMatchObject({ blocked: true, kind: 'perfect' });
    expect(fighter.blockMeter).toBe(fighter.maxBlockMeter);
  });

  it('uses Combo Break instead of super while receiving a combo', () => {
    const simulation = activeSimulation();
    const snapshot = simulation.getSnapshot();
    snapshot.fighters.player1.mode = 'hitstun';
    snapshot.fighters.player1.modeTicksRemaining = 8;
    snapshot.fighters.player1.energy = 100;
    snapshot.combos.player2 = {
      hits: 2,
      damage: 15,
      targetId: 'player1',
      remainingTicks: 30,
      escapeWindowStartsInTicks: null,
      escapeWindowTicksRemaining: 0,
      breakWindowTicksRemaining: 10,
      breakAllowed: true,
    };
    simulation.restore(snapshot);

    const input = emptyInputFrame();
    input.player1 = {
      held: ['DEFENSE', 'SPECIAL_ATTACK'],
      pressed: ['DEFENSE', 'SPECIAL_ATTACK'],
      released: [],
    };
    simulation.step(input, FIXED_STEP_SECONDS);
    const result = simulation.getSnapshot();
    expect(result.fighters.player1.mode).not.toBe('hitstun');
    expect(result.fighters.player1.attack).toBeNull();
    expect(result.fighters.player1.defense.segments).toBe(1);
    expect(result.fighters.player1.defense.effect).toBe('combo-break');
    expect(result.combos.player2.hits).toBe(0);
  });

  it('spends energy on Combo Escape only inside its window', () => {
    const simulation = activeSimulation();
    const snapshot = simulation.getSnapshot();
    snapshot.fighters.player1.mode = 'hitstun';
    snapshot.fighters.player1.modeTicksRemaining = 5;
    snapshot.fighters.player1.energy = 100;
    snapshot.combos.player2 = {
      hits: 2,
      damage: 15,
      targetId: 'player1',
      remainingTicks: 30,
      escapeWindowStartsInTicks: null,
      escapeWindowTicksRemaining: 3,
      breakWindowTicksRemaining: 8,
      breakAllowed: true,
    };
    simulation.restore(snapshot);
    const input = emptyInputFrame();
    input.player1 = {
      held: ['DEFENSE', 'MOVE_LEFT'],
      pressed: ['DEFENSE', 'MOVE_LEFT'],
      released: [],
    };

    simulation.step(input, FIXED_STEP_SECONDS);
    const result = simulation.getSnapshot();
    expect(result.fighters.player1.mode).not.toBe('hitstun');
    expect(result.fighters.player1.energy).toBe(100);
    expect(result.fighters.player1.defense.segments).toBe(2);
    expect(result.fighters.player1.defense.effect).toBe('combo-escape');
    expect(Math.abs(
      result.fighters.player1.x - result.fighters.player2.x,
    )).toBe(210);
    expect(result.combos.player2.hits).toBe(0);
  });

  it('starts reversal and super only from their explicit combinations', () => {
    const reversal = activeSimulation();
    let input = emptyInputFrame();
    input.player1 = {
      held: ['DEFENSE', 'HEAVY_ATTACK'],
      pressed: ['DEFENSE', 'HEAVY_ATTACK'],
      released: [],
    };
    const charged = reversal.getSnapshot();
    charged.fighters.player1.energy = 100;
    reversal.restore(charged);
    reversal.step(input, FIXED_STEP_SECONDS);
    expect(reversal.getSnapshot().fighters.player1.attack?.id)
      .toBe('granite-momentum-reversal');

    const superMove = activeSimulation();
    const full = superMove.getSnapshot();
    full.fighters.player1.energy = 100;
    superMove.restore(full);
    input = emptyInputFrame();
    input.player1 = {
      held: ['DEFENSE', 'SPECIAL_ATTACK'],
      pressed: ['DEFENSE', 'SPECIAL_ATTACK'],
      released: [],
    };
    superMove.step(input, FIXED_STEP_SECONDS);
    expect(superMove.getSnapshot().fighters.player1.attack?.id).toBe('granite-super');
  });
});

function activeSimulation() {
  const simulation = new CombatSimulation();
  const snapshot = simulation.getSnapshot();
  snapshot.roundPhase = 'ACTIVE';
  snapshot.phaseTicksRemaining = 0;
  simulation.restore(snapshot);
  return simulation;
}
