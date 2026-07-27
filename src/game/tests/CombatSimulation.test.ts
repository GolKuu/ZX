import { describe, expect, it } from 'vitest';
import { balanceConfig, FIXED_STEP_SECONDS } from '../config/balanceConfig';
import { CombatSimulation } from '../core/CombatSimulation';
import type { InputFrame } from '../core/types';

const idle: InputFrame = { player1: [], player2: [] };

describe('CombatSimulation', () => {
  it('moves by fixed simulation time and exposes serializable state', () => {
    const simulation = new CombatSimulation();
    const moving: InputFrame = { player1: ['moveRight'], player2: [] };

    for (let tick = 0; tick < 60; tick += 1) {
      simulation.step(moving, FIXED_STEP_SECONDS);
    }

    const snapshot = simulation.getSnapshot();
    expect(snapshot.fighters.player1.x).toBeCloseTo(260 + balanceConfig.walkSpeed, 4);
    expect(() => JSON.stringify(snapshot)).not.toThrow();
  });

  it('restores a snapshot without sharing mutable fighter objects', () => {
    const simulation = new CombatSimulation();
    const snapshot = simulation.getSnapshot();
    snapshot.fighters.player1.x = 410;
    snapshot.fighters.player2.x = 490;
    simulation.restore(snapshot);
    snapshot.fighters.player1.x = 0;

    expect(simulation.getSnapshot().fighters.player1.x).toBe(410);
  });

  it('applies a nearby attack and reduces damage while blocking', () => {
    const simulation = new CombatSimulation();
    const close = simulation.getSnapshot();
    close.fighters.player1.x = 430;
    close.fighters.player2.x = 500;
    simulation.restore(close);

    simulation.step(
      { player1: ['lightAttack'], player2: ['block'] },
      FIXED_STEP_SECONDS,
    );

    expect(simulation.getSnapshot().fighters.player2.health).toBe(98);
    simulation.step(idle, FIXED_STEP_SECONDS);
  });
});
