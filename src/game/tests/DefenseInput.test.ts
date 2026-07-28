import { describe, expect, it } from 'vitest';
import { createInitialState } from '../core/SimulationStateFactory';
import type { CombatAction, InputFrame } from '../core/types';
import { InputResolver } from '../input/InputResolver';

describe('defense input timing', () => {
  it('marks the two-frame perfect and five-frame precise block windows', () => {
    const resolver = new InputResolver();
    const state = createInitialState();
    const perfect = resolver.resolve(frame(['DEFENSE'], ['DEFENSE']), state).player1;
    expect(perfect.held).toContain('PERFECT_BLOCK');

    state.tick = 2;
    const precise = resolver.resolve(frame(['DEFENSE']), state).player1;
    expect(precise.held).toContain('PRECISE_BLOCK');
    expect(precise.held).not.toContain('PERFECT_BLOCK');

    state.tick = 5;
    const early = resolver.resolve(frame(['DEFENSE']), state).player1;
    expect(early.held).not.toContain('PRECISE_BLOCK');
  });
});

function frame(held: CombatAction[], pressed: CombatAction[] = []): InputFrame {
  const player1 = { held, pressed, released: [] };
  const player2 = { held: [], pressed: [], released: [] };
  return { player1, player2 };
}
