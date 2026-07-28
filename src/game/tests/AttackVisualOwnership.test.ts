import { describe, expect, it } from 'vitest';
import { createFighter } from '../core/SimulationStateFactory';
import { ownsAttackVisual } from '../rendering/effects/AttackVisualRenderer';

describe('attack visual ownership', () => {
  it('renders an attack only on the fighter that owns the renderer', () => {
    const first = createFighter('player1', 300);
    const second = createFighter('player2', 600);

    expect(ownsAttackVisual('player1', first)).toBe(true);
    expect(ownsAttackVisual('player1', second)).toBe(false);
    expect(ownsAttackVisual('player2', second)).toBe(true);
  });
});
