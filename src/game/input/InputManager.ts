import { defaultGamepadProfile } from '../config/defaultControls';
import { InputBuffer } from '../core/InputBuffer';
import type { GameAction, InputFrame, PlayerId, CombatAction } from '../core/types';
import { GamepadProvider } from './GamepadProvider';
import { KeyboardProvider } from './KeyboardProvider';
import type { KeyboardProfiles, PlayerInputAssignment } from './InputProfile';

export type InputManagerCallbacks = {
  onDeviceDisconnected?: (playerId: PlayerId, label: string) => void;
  onDeviceReconnected?: (playerId: PlayerId, label: string) => void;
};

export class InputManager {
  private readonly buffer = new InputBuffer();
  private readonly keyboard = new KeyboardProvider(this.buffer);
  private readonly gamepads: GamepadProvider;
  private attached = false;

  constructor(
    private readonly assignments: Record<PlayerId, PlayerInputAssignment>,
    callbacks: InputManagerCallbacks = {},
  ) {
    this.gamepads = new GamepadProvider(
      this.buffer,
      callbacks.onDeviceDisconnected ?? (() => undefined),
      callbacks.onDeviceReconnected ?? (() => undefined),
    );
    this.configureProviders();
  }

  attach() {
    if (this.attached) return;
    this.keyboard.attach();
    this.gamepads.attach();
    this.attached = true;
  }

  detach() {
    this.keyboard.detach();
    this.gamepads.detach();
    this.buffer.clear();
    this.attached = false;
  }

  snapshot(): InputFrame {
    this.gamepads.poll();
    return this.buffer.snapshot();
  }

  // Programmatic input helpers for external controllers (mobile UI)
  pressAction(playerId: PlayerId, action: CombatAction) {
    // forward to internal buffer
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore access buffer internals via exposed API
    this.buffer.press(playerId, action as any);
  }

  releaseAction(playerId: PlayerId, action: CombatAction) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.buffer.release(playerId, action as any);
  }

  consumeGlobalPress(action: GameAction) {
    const first = this.buffer.consumePressed('player1', action);
    const second = this.buffer.consumePressed('player2', action);
    return first || second;
  }

  switchToKeyboard(playerId: PlayerId, profiles: KeyboardProfiles) {
    this.assignments[playerId] = {
      playerId,
      device: { kind: 'keyboard', id: 'keyboard' },
      keyboardProfile: profiles[playerId],
      gamepadProfile: defaultGamepadProfile,
    };
    this.buffer.clearPlayer(playerId);
    this.configureProviders();
  }

  getAssignments() {
    return {
      player1: { ...this.assignments.player1 },
      player2: { ...this.assignments.player2 },
    };
  }

  endTick() {
    this.buffer.clearEdges();
  }

  private configureProviders() {
    this.keyboard.configure(this.assignments);
    this.gamepads.configure(this.assignments);
  }
}
