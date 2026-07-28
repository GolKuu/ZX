// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { GamepadProvider } from '../input/GamepadProvider';
import { InputManager } from '../input/InputManager';
import { InputBuffer } from '../core/InputBuffer';
import { createTestMatchConfig } from './testFixtures';

afterEach(() => vi.restoreAllMocks());

describe('InputManager', () => {
  it('reads two keyboard profiles simultaneously and clears input on blur', () => {
    const manager = new InputManager(createTestMatchConfig().assignments);
    manager.attach();

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA', cancelable: true }));
    const arrow = new KeyboardEvent('keydown', {
      code: 'ArrowRight',
      cancelable: true,
    });
    window.dispatchEvent(arrow);

    expect(manager.snapshot().player1.held).toContain('MOVE_LEFT');
    expect(manager.snapshot().player2.held).toContain('MOVE_RIGHT');
    expect(arrow.defaultPrevented).toBe(true);

    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA', cancelable: true }));
    expect(manager.snapshot().player1.released).toContain('MOVE_LEFT');
    window.dispatchEvent(new Event('blur'));
    expect(manager.snapshot().player2.held).toEqual([]);
    manager.detach();
  });

  it('supports stick dead zone, D-pad and gamepad reconnection', () => {
    const buffer = new InputBuffer();
    const disconnected = vi.fn();
    const reconnected = vi.fn();
    const provider = new GamepadProvider(buffer, disconnected, reconnected, 0.25);
    const config = createTestMatchConfig();
    config.assignments.player1.device = {
      kind: 'gamepad',
      id: 'pad-0',
      gamepadIndex: 0,
      gamepadLabel: 'Test Pad',
    };
    provider.configure(config.assignments);

    let pads: (Gamepad | null)[] = [makeGamepad({ axes: [0.2, 0] })];
    Object.defineProperty(navigator, 'getGamepads', {
      configurable: true,
      value: () => pads,
    });

    provider.poll();
    expect(buffer.snapshot().player1.held).toEqual([]);
    expect(reconnected).toHaveBeenCalledWith('player1', 'Test Pad');

    pads = [makeGamepad({ axes: [0.8, 0] })];
    provider.poll();
    expect(buffer.snapshot().player1.held).toContain('MOVE_RIGHT');

    pads = [makeGamepad({ pressedButtons: [14] })];
    provider.poll();
    expect(buffer.snapshot().player1.held).toContain('MOVE_LEFT');

    pads = [null];
    provider.poll();
    expect(disconnected).toHaveBeenCalledWith('player1', 'Test Pad');
    expect(buffer.snapshot().player1.held).toEqual([]);

    pads = [makeGamepad({ pressedButtons: [2] })];
    provider.poll();
    expect(reconnected).toHaveBeenCalledTimes(2);
    expect(buffer.snapshot().player1.held).toContain('JUMP');
  });

  it('uses the simplified standard gamepad face-button layout', () => {
    const config = createTestMatchConfig();
    config.assignments.player1.device = {
      kind: 'gamepad',
      id: 'pad-0',
      gamepadIndex: 0,
      gamepadLabel: 'Test Pad',
    };
    let pressedButtons = [0];
    Object.defineProperty(navigator, 'getGamepads', {
      configurable: true,
      value: () => [makeGamepad({ pressedButtons })],
    });
    const manager = new InputManager(config.assignments);
    manager.attach();

    expect(manager.snapshot().player1.held).toContain('LIGHT_ATTACK');
    pressedButtons = [1];
    expect(manager.snapshot().player1.held).toContain('HEAVY_ATTACK');
    pressedButtons = [3];
    expect(manager.snapshot().player1.held).toContain('SPECIAL_ATTACK');
    pressedButtons = [4];
    expect(manager.snapshot().player1.held).toContain('DEFENSE');
    manager.detach();
  });

  it('makes a gamepad pause press consumable in the polled frame', () => {
    const config = createTestMatchConfig();
    config.assignments.player1.device = {
      kind: 'gamepad',
      id: 'pad-0',
      gamepadIndex: 0,
      gamepadLabel: 'Test Pad',
    };
    Object.defineProperty(navigator, 'getGamepads', {
      configurable: true,
      value: () => [makeGamepad({ pressedButtons: [9] })],
    });

    const manager = new InputManager(config.assignments);
    manager.attach();
    expect(manager.snapshot().player1.pressed).toContain('PAUSE');
    expect(manager.consumeGlobalPress('PAUSE')).toBe(true);
    manager.detach();
  });
});

function makeGamepad({
  axes = [0, 0],
  pressedButtons = [],
}: {
  axes?: number[];
  pressedButtons?: number[];
}): Gamepad {
  const buttons = Array.from({ length: 16 }, (_, index) => ({
    pressed: pressedButtons.includes(index),
    touched: pressedButtons.includes(index),
    value: pressedButtons.includes(index) ? 1 : 0,
  }));
  return {
    axes,
    buttons,
    connected: true,
    id: 'Test Pad',
    index: 0,
    mapping: 'standard',
    timestamp: Date.now(),
  } as unknown as Gamepad;
}
