import { describe, expect, it } from 'vitest';
import { balanceConfig, FIXED_STEP_SECONDS } from '../config/balanceConfig';
import { CombatSimulation } from '../core/CombatSimulation';
import type { CombatAction } from '../core/types';
import { getCharacterAttacks } from '../data/attacks/characterAttacks';
import { emptyInputFrame } from './testFixtures';

const granite = getCharacterAttacks('granite');

describe('deterministic combat rules', () => {
  it('lets each hitbox connect only once during an attack', () => {
    const simulation = closeActiveSimulation();
    const startingHealth = simulation.getSnapshot().fighters.player2.health;
    performStartup(simulation, 'LIGHT_ATTACK', granite.lightChain[0].startupFrames);
    const afterHit = simulation.getSnapshot();
    expect(afterHit.fighters.player2.health).toBeLessThan(startingHealth);
    const dealt = startingHealth - afterHit.fighters.player2.health;

    stepEmpty(simulation, granite.lightChain[0].activeFrames + 8);
    expect(simulation.getSnapshot().fighters.player2.health).toBe(startingHealth - dealt);
    expect(simulation.getSnapshot().combos.player1).toMatchObject({ hits: 1, damage: dealt });
  });

  it('allows a light-chain cancel only inside its connected cancel window', () => {
    const simulation = closeActiveSimulation();
    simulation.step(actionFrame('LIGHT_ATTACK'), FIXED_STEP_SECONDS);
    simulation.step(actionFrame('LIGHT_ATTACK'), FIXED_STEP_SECONDS);
    expect(simulation.getSnapshot().fighters.player1.attack?.id).toBe('granite-light-1');

    advanceUntil(simulation, () => {
      const attack = simulation.getSnapshot().fighters.player1.attack;
      return Boolean(attack && attack.frame >= granite.lightChain[0].cancelWindows[0].startFrame);
    });
    simulation.step(actionFrame('LIGHT_ATTACK'), FIXED_STEP_SECONDS);
    expect(simulation.getSnapshot().fighters.player1.attack?.id).toBe('granite-light-2');
    advanceUntil(simulation, () => simulation.getSnapshot().combos.player1.hits >= 2);
    expect(simulation.getSnapshot().combos.player1.damage).toBeGreaterThan(7);
  });

  it('requires a crouching guard to block a low hit', () => {
    const standingGuard = closeActiveSimulation();
    performStartup(
      standingGuard,
      'LIGHT_ATTACK',
      granite.low.startupFrames,
      ['CROUCH'],
      ['BLOCK'],
    );
    expect(standingGuard.getSnapshot().fighters.player2.mode).toBe('hitstun');

    const crouchingGuard = closeActiveSimulation();
    performStartup(
      crouchingGuard,
      'LIGHT_ATTACK',
      granite.low.startupFrames,
      ['CROUCH'],
      ['BLOCK', 'CROUCH'],
    );
    const defender = crouchingGuard.getSnapshot().fighters.player2;
    expect(defender.mode).toBe('blockstun');
    expect(defender.health).toBe(defender.maxHealth);
  });

  it('applies knockdown, wake-up and knockback away from the attacker', () => {
    const simulation = closeActiveSimulation();
    performStartup(simulation, 'DASH_HEAVY', granite.dashHeavy.startupFrames);
    const defender = simulation.getSnapshot().fighters.player2;
    expect(defender.mode).toBe('knockdown');
    expect(defender.velocityX).toBeGreaterThan(0);
    advanceUntil(simulation, () => simulation.getSnapshot().fighters.player2.mode === 'wakeup',
      balanceConfig.knockdownTicks + 20);
    advanceUntil(simulation, () => simulation.getSnapshot().fighters.player2.mode === 'idle',
      balanceConfig.wakeupTicks + 20);
  });

  it('switches sides and reverses knockback for a back throw', () => {
    const simulation = closeActiveSimulation();
    performStartup(simulation, 'GRAB', granite.backThrow.startupFrames, ['MOVE_LEFT']);
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

function advanceUntil(
  simulation: CombatSimulation,
  predicate: () => boolean,
  maximumTicks = 120,
) {
  for (let tick = 0; tick < maximumTicks && !predicate(); tick += 1) {
    simulation.step(emptyInputFrame(), FIXED_STEP_SECONDS);
  }
  expect(predicate()).toBe(true);
}

function stepEmpty(simulation: CombatSimulation, ticks: number) {
  for (let tick = 0; tick < ticks; tick += 1) {
    simulation.step(emptyInputFrame(), FIXED_STEP_SECONDS);
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
