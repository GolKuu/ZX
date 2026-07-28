import { describe, expect, it } from 'vitest';
import { SoloAiController } from '../ai/SoloAiController';
import { CombatSimulation } from '../core/CombatSimulation';
import { AI_TUNING } from '../ai/AiDifficulty';
import { getCharacter } from '../data/characters/circleFighters';

describe('SoloAiController', () => {
  it('approaches an opponent outside attack range', () => {
    const simulation = activeSimulation(1, 250, 600);
    const input = new SoloAiController().frame('player2', simulation.getSnapshot());

    expect(input.held).toContain('MOVE_LEFT');
    expect(input.pressed).toHaveLength(0);
  });

  it('blocks a nearby incoming attack', () => {
    const simulation = activeSimulation(20, 400, 500);
    simulation.updateState((state) => {
      state.fighters.player1.mode = 'attackStartup';
    });

    const input = new SoloAiController().frame('player2', simulation.getSnapshot());
    expect(input.held).toEqual(['DEFENSE']);
  });

  it('uses deterministic attacks inside attack range', () => {
    const simulation = activeSimulation(31, 400, 490);
    const input = new SoloAiController().frame('player2', simulation.getSnapshot());

    expect(input.pressed).toContain('LIGHT_ATTACK');
  });

  it('keeps the current behavior as easy and attacks faster on medium', () => {
    const snapshot = activeSimulation(23, 400, 490).getSnapshot();

    expect(new SoloAiController('EASY').frame('player2', snapshot).pressed)
      .not.toContain('LIGHT_ATTACK');
    expect(new SoloAiController('MEDIUM').frame('player2', snapshot).pressed)
      .toContain('LIGHT_ATTACK');
  });

  it('applies very hard bonuses again after a rematch', () => {
    const modifier = AI_TUNING.VERY_HARD.fighterModifier;
    const simulation = new CombatSimulation(
      { player1: 'granite', player2: 'shira' },
      { fighterModifiers: { player2: modifier } },
    );
    const initial = simulation.getSnapshot().fighters.player2;

    expect(initial.maxHealth).toBe(
      Math.round(getCharacter('shira').stats.maxHealth * 1.25),
    );
    expect(initial.energy).toBe(35);
    simulation.updateState((state) => {
      state.fighters.player2.health = 1;
      state.fighters.player2.energy = 0;
    });
    simulation.rematch();
    expect(simulation.getSnapshot().fighters.player2).toMatchObject({
      health: initial.maxHealth,
      maxHealth: initial.maxHealth,
      energy: 35,
    });
  });
});

function activeSimulation(tick: number, playerOneX: number, playerTwoX: number) {
  const simulation = new CombatSimulation();
  simulation.updateState((state) => {
    state.tick = tick;
    state.roundPhase = 'ACTIVE';
    state.fighters.player1.x = playerOneX;
    state.fighters.player2.x = playerTwoX;
  });
  return simulation;
}
