import { describe, expect, it } from 'vitest';
import { AttackSystem } from '../combat/AttackSystem';
import { createFighter } from '../core/SimulationStateFactory';
import type { CombatAction, PlayerInputFrame } from '../core/types';
import { getCharacterAttacks } from '../data/attacks/temporaryCharacterAttacks';

describe('auto combo', () => {
  it('advances three light stages only after three separate presses', () => {
    const attacks = new AttackSystem();
    const fighter = createFighter('player1', 430);
    const defender = createFighter('player2', 500);
    const ids: string[] = [];

    pressAndConnect(attacks, fighter, defender, 'LIGHT_ATTACK');
    ids.push(fighter.attack!.id);
    for (let stage = 1; stage < 3; stage += 1) {
      advanceToCancel(attacks, fighter);
      pressAndConnect(attacks, fighter, defender, 'LIGHT_ATTACK');
      ids.push(fighter.attack!.id);
    }
    expect(ids).toEqual([
      'granite-light-1', 'granite-light-2', 'granite-light-3',
    ]);
  });

  it('advances three heavy stages and supports mixed special cancels', () => {
    const attacks = new AttackSystem();
    const fighter = createFighter('player1', 430);
    const defender = createFighter('player2', 500);

    pressAndConnect(attacks, fighter, defender, 'HEAVY_ATTACK');
    advanceToCancel(attacks, fighter);
    pressAndConnect(attacks, fighter, defender, 'HEAVY_ATTACK');
    expect(fighter.attack?.id).toBe('granite-heavy-2');
    advanceToCancel(attacks, fighter);
    pressAndConnect(attacks, fighter, defender, 'HEAVY_ATTACK');
    expect(fighter.attack?.id).toBe('granite-heavy-3');

    const mixed = createFighter('player1', 430);
    pressAndConnect(attacks, mixed, defender, 'LIGHT_ATTACK');
    advanceToCancel(attacks, mixed);
    attacks.prepare(mixed, input('SPECIAL_ATTACK'));
    expect(mixed.attack?.id).toBe('granite-special-neutral');
  });

  it('stops without another press and cannot execute a chain from one input', () => {
    const attacks = new AttackSystem();
    const fighter = createFighter('player1', 430);
    attacks.prepare(fighter, input('LIGHT_ATTACK'));
    const definition = getCharacterAttacks('granite').lightChain[0];
    const total = definition.startupFrames + definition.activeFrames + definition.recoveryFrames;
    for (let tick = 0; tick < total; tick += 1) {
      attacks.prepare(fighter, emptyInput());
      attacks.finishTick(fighter);
    }
    expect(fighter.attack).toBeNull();
  });
});

function pressAndConnect(
  attacks: AttackSystem,
  fighter: ReturnType<typeof createFighter>,
  defender: ReturnType<typeof createFighter>,
  action: CombatAction,
) {
  attacks.prepare(fighter, input(action));
  for (let tick = 0; tick < 80 && !fighter.attack?.connected; tick += 1) {
    attacks.findContact(fighter, defender);
    attacks.finishTick(fighter);
    attacks.prepare(fighter, emptyInput());
  }
}

function advanceToCancel(attacks: AttackSystem, fighter: ReturnType<typeof createFighter>) {
  const definition = attacks.currentDefinition(fighter);
  if (!definition || !fighter.attack) throw new Error('Attack is not active');
  const cancelFrame = definition.cancelWindows[0]?.startFrame;
  if (cancelFrame === undefined) throw new Error('Attack has no cancel window');
  while (fighter.attack.frame < cancelFrame) {
    attacks.finishTick(fighter);
    attacks.prepare(fighter, emptyInput());
  }
}

function input(action: CombatAction): PlayerInputFrame {
  return { held: [action], pressed: [action], released: [] };
}

function emptyInput(): PlayerInputFrame {
  return { held: [], pressed: [], released: [] };
}
