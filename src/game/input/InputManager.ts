import { defaultControls, type PlayerControls } from '../config/defaultControls';
import { InputBuffer } from '../core/InputBuffer';
import type { GameAction, InputFrame } from '../core/types';
import { GamepadProvider } from './GamepadProvider';
import { KeyboardProvider } from './KeyboardProvider';

export class InputManager {
  private readonly buffer = new InputBuffer();
  private readonly keyboard: KeyboardProvider;
  private readonly gamepads = new GamepadProvider();

  constructor(controls: PlayerControls = defaultControls) {
    this.keyboard = new KeyboardProvider(controls, this.buffer);
  }

  attach() {
    this.keyboard.attach();
  }

  detach() {
    this.keyboard.detach();
  }

  snapshot(): InputFrame {
    const keyboard = this.buffer.snapshot();
    const gamepads = this.gamepads.snapshot();
    return {
      player1: [...new Set([...keyboard.player1, ...gamepads.player1])],
      player2: [...new Set([...keyboard.player2, ...gamepads.player2])],
    };
  }

  consumeGlobalPress(action: GameAction) {
    const first = this.buffer.consumePressed('player1', action);
    const second = this.buffer.consumePressed('player2', action);
    return first || second;
  }

  endTick() {
    this.buffer.clearPressed();
  }
}
