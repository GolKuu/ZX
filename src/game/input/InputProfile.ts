import type {
  ContextAction,
  ControlScheme,
  GameAction,
  PlayerId,
} from '../core/types';

export type KeyboardInputProfile = {
  id: string;
  kind: 'keyboard';
  playerId: PlayerId;
  label: string;
  scheme: ControlScheme;
  bindings: Record<GameAction, string>;
  classicBindings?: Partial<Record<ContextAction, string>>;
};

export type GamepadButtonBinding = {
  type: 'button';
  index: number;
};

export type GamepadAxisBinding = {
  type: 'axis';
  axis: number;
  direction: -1 | 1;
};

export type GamepadBinding = GamepadButtonBinding | GamepadAxisBinding;

export type GamepadInputProfile = {
  id: string;
  kind: 'gamepad';
  label: string;
  scheme: ControlScheme;
  bindings: Record<GameAction, readonly GamepadBinding[]>;
  classicBindings?: Partial<Record<ContextAction, readonly GamepadBinding[]>>;
};

export type InputProfile = KeyboardInputProfile | GamepadInputProfile;
export type KeyboardProfiles = Record<PlayerId, KeyboardInputProfile>;

export type InputDeviceAssignment =
  | { kind: 'keyboard'; id: 'keyboard' }
  | { kind: 'gamepad'; id: string; gamepadIndex: number; gamepadLabel: string };

export type PlayerInputAssignment = {
  playerId: PlayerId;
  device: InputDeviceAssignment;
  keyboardProfile: KeyboardInputProfile;
  gamepadProfile: GamepadInputProfile;
};
