import { describe, expect, it } from 'vitest';
import { SoloAiController } from '../ai/SoloAiController';
import { CombatSimulation } from '../core/CombatSimulation';

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
