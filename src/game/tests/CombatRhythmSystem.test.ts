import { describe, expect, it } from 'vitest';
import { CombatRhythmSystem } from '../combat/CombatRhythmSystem';
import { createFighter } from '../core/SimulationStateFactory';
import type { CombatAction, PlayerInputFrame } from '../core/types';

describe('CombatRhythmSystem', () => {
  it('blocks rapid repeated attacks and opens a punish window', () => {
    const rhythm = new CombatRhythmSystem();
    const fighter = createFighter('player1', 300);

    rhythm.update(fighter, attack('LIGHT_ATTACK'), 1);
    rhythm.update(fighter, attack('LIGHT_ATTACK'), 4);
    const filtered = rhythm.update(fighter, attack('LIGHT_ATTACK'), 7);

    expect(filtered.pressed).not.toContain('LIGHT_ATTACK');
    expect(fighter.rhythmPressure).toBe(fighter.maxRhythmPressure);
    expect(fighter.rhythmLockTicks).toBe(36);
    expect(fighter.vulnerableTicksRemaining).toBe(36);
  });

  it('allows deliberate attacks separated by neutral play', () => {
    const rhythm = new CombatRhythmSystem();
    const fighter = createFighter('player1', 300);
    for (let tick = 0; tick <= 90; tick += 1) {
      const frame = tick % 30 === 0 ? attack('HEAVY_ATTACK') : emptyInput();
      rhythm.update(fighter, frame, tick);
    }

    expect(fighter.rhythmLockTicks).toBe(0);
    expect(fighter.rhythmPressure).toBeLessThan(20);
  });

  it('rewards precise defense and successful reactions', () => {
    const rhythm = new CombatRhythmSystem();
    const fighter = createFighter('player1', 300);
    fighter.rhythmPressure = 70;

    rhythm.rewardDefense(fighter, 'precise');
    rhythm.rewardHit(fighter);
    expect(fighter.rhythmPressure).toBe(40);

    fighter.rhythmLockTicks = 20;
    rhythm.rewardDefense(fighter, 'perfect');
    expect(fighter.rhythmPressure).toBe(6);
    expect(fighter.rhythmLockTicks).toBe(0);
  });
});

function attack(action: CombatAction): PlayerInputFrame {
  return { held: [action], pressed: [action], released: [] };
}

function emptyInput(): PlayerInputFrame {
  return { held: [], pressed: [], released: [] };
}
