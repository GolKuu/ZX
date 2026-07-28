import { describe, expect, it } from 'vitest';
import { FIXED_STEP_SECONDS } from '../config/balanceConfig';
import { CombatSimulation } from '../core/CombatSimulation';
import type { CombatAction } from '../core/types';
import { emptyInputFrame } from './testFixtures';

describe('defense integration', () => {
  it('applies a special only after startup and deals chip damage while blocking', () => {
    const simulation = new CombatSimulation({ player1: 'shira', player2: 'granite' });
    const close = simulation.getSnapshot();
    close.roundPhase = 'ACTIVE';
    close.phaseTicksRemaining = 0;
    close.fighters.player1.x = 430;
    close.fighters.player2.x = 500;
    simulation.restore(close);

    simulation.step(
      combatFrame(['SPECIAL_ATTACK'], ['SPECIAL_ATTACK'], ['BLOCK']),
      FIXED_STEP_SECONDS,
    );
    expect(simulation.getSnapshot().fighters.player2.health).toBe(132);
    for (let frame = 0; frame < 8; frame += 1) {
      simulation.step(combatFrame([], [], ['BLOCK']), FIXED_STEP_SECONDS);
    }

    const defender = simulation.getSnapshot().fighters.player2;
    expect(defender.health).toBe(130);
    expect(defender.mode).toBe('blockstun');
    expect(defender.blockMeter).toBeLessThan(defender.maxBlockMeter);
  });
});

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
