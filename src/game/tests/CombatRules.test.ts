import { describe, expect, it } from 'vitest';
import { balanceConfig, FIXED_STEP_SECONDS } from '../config/balanceConfig';
import { CombatSimulation } from '../core/CombatSimulation';
import type { CombatAction } from '../core/types';
import { emptyInputFrame } from './testFixtures';

describe('deterministic combat rules', () => {
  it('lets each hitbox connect only once during an attack', () => {
    const simulation = closeActiveSimulation();
    performStartup(simulation, 'LIGHT_ATTACK', 4);
    expect(simulation.getSnapshot().fighters.player2.health).toBe(95);

    for (let frame = 0; frame < 4; frame += 1) simulation.step(emptyInputFrame(), FIXED_STEP_SECONDS);
    expect(simulation.getSnapshot().fighters.player2.health).toBe(95);
    expect(simulation.getSnapshot().combos.player1).toMatchObject({ hits: 1, damage: 5 });
  });

  it('allows a light-chain cancel only inside its connected cancel window', () => {
    const simulation = closeActiveSimulation();
    simulation.step(actionFrame('LIGHT_ATTACK'), FIXED_STEP_SECONDS);
    simulation.step(actionFrame('LIGHT_ATTACK'), FIXED_STEP_SECONDS);
    expect(simulation.getSnapshot().fighters.player1.attack?.id).toBe('comet-light-1');

    for (let frame = 0; frame < 5; frame += 1) simulation.step(emptyInputFrame(), FIXED_STEP_SECONDS);
    simulation.step(actionFrame('LIGHT_ATTACK'), FIXED_STEP_SECONDS);
    expect(simulation.getSnapshot().fighters.player1.attack?.id).toBe('comet-light-2');
    for (let frame = 0; frame < 5; frame += 1) simulation.step(emptyInputFrame(), FIXED_STEP_SECONDS);
    const snapshot = simulation.getSnapshot();
    expect(snapshot.combos.player1.hits).toBe(2);
    expect(snapshot.combos.player1.damage).toBeGreaterThan(5);
    expect(snapshot.fighters.player1.energy).toBeGreaterThan(0);
  });

  it('requires a crouching guard to block a low hit', () => {
    const standingGuard = closeActiveSimulation();
    performStartup(standingGuard, 'LIGHT_ATTACK', 7, ['CROUCH'], ['BLOCK']);
    expect(standingGuard.getSnapshot().fighters.player2.mode).toBe('hitstun');

    const crouchingGuard = closeActiveSimulation();
    performStartup(
      crouchingGuard,
      'LIGHT_ATTACK',
      7,
      ['CROUCH'],
      ['BLOCK', 'CROUCH'],
    );
    const defender = crouchingGuard.getSnapshot().fighters.player2;
    expect(defender.mode).toBe('blockstun');
    expect(defender.health).toBe(99);
  });

  it('applies knockdown, wake-up and knockback away from the attacker', () => {
    const simulation = closeActiveSimulation();
    performStartup(simulation, 'HEAVY_ATTACK', 13, ['MOVE_RIGHT']);
    const defender = simulation.getSnapshot().fighters.player2;
    expect(defender.mode).toBe('knockdown');
    expect(defender.velocityX).toBeGreaterThan(0);

    for (let tick = 0; tick < balanceConfig.knockdownTicks; tick += 1) {
      simulation.step(emptyInputFrame(), FIXED_STEP_SECONDS);
    }
    expect(simulation.getSnapshot().fighters.player2.mode).toBe('wakeup');
    for (let tick = 0; tick < balanceConfig.wakeupTicks; tick += 1) {
      simulation.step(emptyInputFrame(), FIXED_STEP_SECONDS);
    }
    expect(simulation.getSnapshot().fighters.player2.mode).toBe('idle');
  });

  it('switches sides and reverses knockback for a back throw', () => {
    const simulation = closeActiveSimulation();
    performStartup(simulation, 'GRAB', 9, ['MOVE_LEFT']);
    const snapshot = simulation.getSnapshot();
    expect(snapshot.fighters.player1.x).toBeGreaterThan(snapshot.fighters.player2.x);
    expect(snapshot.fighters.player2.velocityX).toBeLessThan(0);
    expect(snapshot.fighters.player1.facing).toBe(-1);
  });
});

function closeActiveSimulation() {
  const simulation = new CombatSimulation();
  const snapshot = simulation.getSnapshot();
  snapshot.roundPhase = 'ACTIVE';
  snapshot.phaseTicksRemaining = 0;
  snapshot.fighters.player1.x = 430;
  snapshot.fighters.player2.x = 500;
  simulation.restore(snapshot);
  return simulation;
}

function performStartup(
  simulation: CombatSimulation,
  action: CombatAction,
  startupFrames: number,
  directions: CombatAction[] = [],
  defenderHeld: CombatAction[] = [],
) {
  simulation.step(actionFrame(action, directions, defenderHeld), FIXED_STEP_SECONDS);
  for (let frame = 0; frame < startupFrames; frame += 1) {
    simulation.step(heldFrame(directions, defenderHeld), FIXED_STEP_SECONDS);
  }
}

function actionFrame(
  action: CombatAction,
  held: CombatAction[] = [],
  defenderHeld: CombatAction[] = [],
) {
  const frame = heldFrame([...held, action], defenderHeld);
  frame.player1.pressed = [action];
  return frame;
}

function heldFrame(held: CombatAction[], defenderHeld: CombatAction[] = []) {
  const frame = emptyInputFrame();
  frame.player1 = { held, pressed: [], released: [] };
  frame.player2 = { held: defenderHeld, pressed: [], released: [] };
  return frame;
}
