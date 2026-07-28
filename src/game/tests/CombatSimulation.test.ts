import { describe, expect, it } from 'vitest';
import { balanceConfig, FIXED_STEP_SECONDS } from '../config/balanceConfig';
import { CombatSimulation } from '../core/CombatSimulation';
import type { CombatAction } from '../core/types';
import { emptyInputFrame, inputFrame } from './testFixtures';

function activate(simulation: CombatSimulation) {
  const snapshot = simulation.getSnapshot();
  snapshot.roundPhase = 'ACTIVE';
  snapshot.phaseTicksRemaining = 0;
  simulation.restore(snapshot);
}

describe('CombatSimulation', () => {
  it('moves by fixed simulation time and exposes serializable state', () => {
    const simulation = new CombatSimulation();
    activate(simulation);

    for (let tick = 0; tick < 60; tick += 1) {
      simulation.step(inputFrame('player1', ['MOVE_RIGHT'], []), FIXED_STEP_SECONDS);
    }

    const snapshot = simulation.getSnapshot();
    expect(snapshot.fighters.player1.x).toBeCloseTo(250 + balanceConfig.walkSpeed, 4);
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

  it('applies an attack only after startup and deals chip damage while blocking', () => {
    const simulation = new CombatSimulation();
    const close = simulation.getSnapshot();
    close.roundPhase = 'ACTIVE';
    close.phaseTicksRemaining = 0;
    close.fighters.player1.x = 430;
    close.fighters.player2.x = 500;
    simulation.restore(close);

    simulation.step(combatFrame(['LIGHT_ATTACK'], ['LIGHT_ATTACK'], ['BLOCK']), FIXED_STEP_SECONDS);
    expect(simulation.getSnapshot().fighters.player2.health).toBe(100);
    for (let frame = 0; frame < 4; frame += 1) {
      simulation.step(combatFrame([], [], ['BLOCK']), FIXED_STEP_SECONDS);
    }

    const defender = simulation.getSnapshot().fighters.player2;
    expect(defender.health).toBe(99);
    expect(defender.mode).toBe('blockstun');
    expect(defender.blockMeter).toBeLessThan(defender.maxBlockMeter);
  });

  it('locks movement during 3, 2, 1, FIGHT countdown', () => {
    const simulation = new CombatSimulation();
    const initialX = simulation.getSnapshot().fighters.player1.x;

    for (let tick = 0; tick < balanceConfig.countdownTicks; tick += 1) {
      simulation.step(inputFrame('player1', ['MOVE_RIGHT'], []), FIXED_STEP_SECONDS);
    }

    expect(simulation.getSnapshot().roundPhase).toBe('ACTIVE');
    expect(simulation.getSnapshot().fighters.player1.x).toBe(initialX);
    simulation.step(inputFrame('player1', ['MOVE_RIGHT'], []), FIXED_STEP_SECONDS);
    expect(simulation.getSnapshot().fighters.player1.x).toBeGreaterThan(initialX);
  });

  it('supports crouching, jumping, landing and a double-tap dash', () => {
    const simulation = new CombatSimulation();
    activate(simulation);

    simulation.step(inputFrame('player1', ['CROUCH'], []), FIXED_STEP_SECONDS);
    expect(simulation.getSnapshot().fighters.player1.mode).toBe('crouching');

    simulation.step(inputFrame('player1', ['JUMP'], ['JUMP']), FIXED_STEP_SECONDS);
    expect(simulation.getSnapshot().fighters.player1.grounded).toBe(false);
    for (let tick = 0; tick < 100; tick += 1) {
      simulation.step(emptyInputFrame(), FIXED_STEP_SECONDS);
    }
    expect(simulation.getSnapshot().fighters.player1.grounded).toBe(true);

    simulation.step(inputFrame('player1', ['MOVE_RIGHT'], ['MOVE_RIGHT']), FIXED_STEP_SECONDS);
    for (let tick = 0; tick < 4; tick += 1) {
      simulation.step(emptyInputFrame(), FIXED_STEP_SECONDS);
    }
    simulation.step(inputFrame('player1', ['MOVE_RIGHT'], ['MOVE_RIGHT']), FIXED_STEP_SECONDS);
    expect(simulation.getSnapshot().fighters.player1.mode).toBe('dashing');
  });

  it('lets an airborne fighter cross over the opponent and turns both fighters', () => {
    const simulation = new CombatSimulation();
    const close = simulation.getSnapshot();
    close.roundPhase = 'ACTIVE';
    close.phaseTicksRemaining = 0;
    close.fighters.player1.x = 420;
    close.fighters.player2.x = 510;
    simulation.restore(close);

    simulation.step(
      inputFrame('player1', ['MOVE_RIGHT', 'JUMP'], ['JUMP']),
      FIXED_STEP_SECONDS,
    );
    for (let tick = 0; tick < 65; tick += 1) {
      simulation.step(inputFrame('player1', ['MOVE_RIGHT'], []), FIXED_STEP_SECONDS);
    }

    const snapshot = simulation.getSnapshot();
    expect(snapshot.fighters.player1.x).toBeGreaterThan(snapshot.fighters.player2.x);
    expect(snapshot.fighters.player1.facing).toBe(-1);
    expect(snapshot.fighters.player2.facing).toBe(1);
  });

  it('runs 90-second rounds and finishes after two round wins', () => {
    const simulation = new CombatSimulation();
    activate(simulation);
    expect(simulation.getSnapshot().roundTicksRemaining).toBe(90 * 60);

    forceRoundWin(simulation, 'player1');
    expect(simulation.getSnapshot().wins.player1).toBe(1);

    for (let tick = 0; tick < balanceConfig.roundOverTicks; tick += 1) {
      simulation.step(emptyInputFrame(), FIXED_STEP_SECONDS);
    }
    const secondRound = simulation.getSnapshot();
    secondRound.roundPhase = 'ACTIVE';
    secondRound.phaseTicksRemaining = 0;
    simulation.restore(secondRound);
    forceRoundWin(simulation, 'player1');

    expect(simulation.getSnapshot().matchWinner).toBe('player1');
    expect(simulation.getSnapshot().roundPhase).toBe('MATCH_OVER');
    simulation.rematch();
    expect(simulation.getSnapshot().wins).toEqual({ player1: 0, player2: 0 });
    expect(simulation.getSnapshot().roundNumber).toBe(1);
  });
});

function forceRoundWin(simulation: CombatSimulation, winner: 'player1' | 'player2') {
  const snapshot = simulation.getSnapshot();
  snapshot.roundPhase = 'ACTIVE';
  snapshot.fighters[winner === 'player1' ? 'player2' : 'player1'].health = 0;
  simulation.restore(snapshot);
  simulation.step(emptyInputFrame(), FIXED_STEP_SECONDS);
}

function combatFrame(
  playerOneHeld: CombatAction[],
  playerOnePressed: CombatAction[],
  playerTwoHeld: CombatAction[],
) {
  const frame = emptyInputFrame();
  frame.player1 = { held: playerOneHeld, pressed: playerOnePressed, released: [] };
  frame.player2 = { held: playerTwoHeld, pressed: [], released: [] };
  return frame;
}
