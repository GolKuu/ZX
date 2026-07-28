import { describe, expect, it } from 'vitest';
import { FIXED_STEP_SECONDS } from '../config/balanceConfig';
import { CombatSimulation } from '../core/CombatSimulation';
import { emptyInputFrame, inputFrame } from './testFixtures';

describe('combat determinism', () => {
  it('produces the same snapshot for the same input sequence', () => {
    const first = activeSimulation();
    const second = activeSimulation();
    const frames = [
      inputFrame('player1', ['MOVE_RIGHT'], ['MOVE_RIGHT']),
      emptyInputFrame(),
      inputFrame('player1', ['LIGHT_ATTACK'], ['LIGHT_ATTACK']),
    ];

    for (let repeat = 0; repeat < 12; repeat += 1) {
      const frame = frames[repeat % frames.length];
      first.step(frame, FIXED_STEP_SECONDS);
      second.step(frame, FIXED_STEP_SECONDS);
    }
    expect(first.getSnapshot()).toEqual(second.getSnapshot());
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
