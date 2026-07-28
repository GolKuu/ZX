// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import { GAME_ACTIONS, type CombatAction, type InputFrame } from '../core/types';
import { createInitialState } from '../core/SimulationStateFactory';
import { InputResolver } from '../input/InputResolver';
import { ControlStorage } from '../input/ControlStorage';

describe('simplified input', () => {
  beforeEach(() => localStorage.clear());

  it('exposes the complete assignable action list', () => {
    expect(GAME_ACTIONS).toEqual([
      'MOVE_LEFT', 'MOVE_RIGHT', 'JUMP', 'LIGHT_ATTACK',
      'HEAVY_ATTACK', 'SPECIAL_ATTACK', 'DEFENSE',
      'ASSIST', 'TAG_SWITCH', 'BURST_ASSIST', 'PAUSE',
    ]);
  });

  it('resolves direction, air and two directions without sticky movement', () => {
    const resolver = new InputResolver();
    const state = createInitialState();
    state.roundPhase = 'ACTIVE';

    expect(resolve(resolver, state, ['MOVE_RIGHT', 'LIGHT_ATTACK'], ['LIGHT_ATTACK']))
      .toContain('DIRECTIONAL_LIGHT');
    expect(resolve(resolver, state, ['MOVE_LEFT', 'LIGHT_ATTACK'], ['LIGHT_ATTACK']))
      .toContain('RETREAT_LIGHT');

    state.fighters.player1.grounded = false;
    expect(resolve(resolver, state, ['LIGHT_ATTACK'], ['LIGHT_ATTACK']))
      .toContain('AIR_LIGHT');
    const both = resolver.resolve(frame(['MOVE_LEFT', 'MOVE_RIGHT']), state).player1;
    expect(both.held).not.toContain('MOVE_LEFT');
    expect(both.held).not.toContain('MOVE_RIGHT');
  });

  it('resolves defense combinations by one shared priority', () => {
    const resolver = new InputResolver();
    const state = createInitialState();
    state.roundPhase = 'ACTIVE';
    state.fighters.player1.x = 430;
    state.fighters.player2.x = 500;

    expect(resolve(resolver, state, ['DEFENSE', 'LIGHT_ATTACK'],
      ['DEFENSE', 'LIGHT_ATTACK'])).toContain('GRAB');
    state.fighters.player1.energy = 100;
    expect(resolve(resolver, state, ['DEFENSE', 'HEAVY_ATTACK'],
      ['DEFENSE', 'HEAVY_ATTACK'])).toContain('MOMENTUM_REVERSAL');

    expect(resolve(resolver, state, ['DEFENSE', 'SPECIAL_ATTACK'],
      ['DEFENSE', 'SPECIAL_ATTACK'])).toContain('SUPER_ATTACK');
  });

  it('does not grab at range or reverse when heavy was pressed too early', () => {
    const resolver = new InputResolver();
    const state = createInitialState();
    state.roundPhase = 'ACTIVE';
    state.fighters.player1.x = 200;
    state.fighters.player2.x = 700;

    const far = resolver.resolve(
      frame(['DEFENSE', 'LIGHT_ATTACK'], ['DEFENSE', 'LIGHT_ATTACK']),
      state,
    ).player1;
    expect(far.pressed).not.toContain('GRAB');
    expect(far.pressed).not.toContain('LIGHT_ATTACK');
    expect(far.held).toEqual(expect.arrayContaining(['BLOCK', 'CROUCH']));

    resolver.resolve(frame(['HEAVY_ATTACK'], ['HEAVY_ATTACK']), state);
    state.tick += 5;
    const lateDefense = resolver.resolve(frame(['DEFENSE'], ['DEFENSE']), state).player1;
    expect(lateDefense.pressed).not.toContain('MOMENTUM_REVERSAL');
  });

  it('resolves Combo Break before super and supports independent players', () => {
    const resolver = new InputResolver();
    const state = createInitialState();
    state.roundPhase = 'ACTIVE';
    state.fighters.player1.mode = 'hitstun';
    state.fighters.player1.modeTicksRemaining = 5;
    state.fighters.player1.energy = 100;
    state.combos.player2 = {
      hits: 2,
      damage: 12,
      targetId: 'player1',
      remainingTicks: 30,
      escapeWindowStartsInTicks: null,
      escapeWindowTicksRemaining: 0,
      breakWindowTicksRemaining: 10,
      breakAllowed: true,
    };

    const result = resolver.resolve({
      player1: player(['DEFENSE', 'SPECIAL_ATTACK'], ['DEFENSE', 'SPECIAL_ATTACK']),
      player2: player(['LIGHT_ATTACK'], ['LIGHT_ATTACK']),
    }, state);
    expect(result.player1.pressed).toContain('COMBO_BREAK');
    expect(result.player1.pressed).not.toContain('SUPER_ATTACK');
    expect(result.player2.pressed).toContain('LIGHT_ATTACK');
  });

  it('migrates v2 bindings without losing classic direct actions', () => {
    localStorage.setItem('circle-clash-controls-v2', JSON.stringify({
      player1: { bindings: legacyBindings('KeyA', 'KeyD', 'KeyJ', 'Semicolon') },
      player2: { bindings: legacyBindings('ArrowLeft', 'ArrowRight', 'Numpad1', 'Numpad0') },
    }));
    const profiles = new ControlStorage().load();

    expect(profiles.player1.scheme).toBe('CLASSIC');
    expect(profiles.player1.bindings.DEFENSE).toBe('Semicolon');
    expect(profiles.player1.classicBindings?.GRAB).toBe('KeyU');
    expect(localStorage.getItem('circle-clash-controls-v3')).toContain('DEFENSE');
  });
});

function resolve(
  resolver: InputResolver,
  state: ReturnType<typeof createInitialState>,
  held: CombatAction[],
  pressed: CombatAction[],
) {
  return resolver.resolve(frame(held, pressed), state).player1.pressed;
}

function frame(held: CombatAction[], pressed: CombatAction[] = []): InputFrame {
  return { player1: player(held, pressed), player2: player() };
}

function player(held: CombatAction[] = [], pressed: CombatAction[] = []) {
  return { held, pressed, released: [] };
}

function legacyBindings(left: string, right: string, light: string, block: string) {
  return {
    MOVE_LEFT: left, MOVE_RIGHT: right, JUMP: 'KeyH', CROUCH: 'KeyS',
    LIGHT_ATTACK: light, HEAVY_ATTACK: 'KeyK', SPECIAL_ATTACK: 'KeyL',
    BLOCK: block, GRAB: 'KeyU', SUPER_ATTACK: 'KeyI',
    COMBO_ESCAPE: 'KeyO', MOMENTUM_REVERSAL: 'KeyP', PAUSE: 'Escape',
  };
}
