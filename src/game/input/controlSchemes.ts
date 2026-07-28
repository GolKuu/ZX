import { cloneKeyboardProfile, defaultKeyboardProfiles } from '../config/defaultControls';
import type { ControlScheme, PlayerId } from '../core/types';
import type { KeyboardInputProfile } from './InputProfile';

const classicBindings = {
  player1: {
    CROUCH: 'KeyS',
    GRAB: 'KeyU',
    SUPER_ATTACK: 'KeyI',
    COMBO_ESCAPE: 'KeyO',
    MOMENTUM_REVERSAL: 'KeyP',
  },
  player2: {
    CROUCH: 'ArrowDown',
    GRAB: 'NumpadEnter',
    SUPER_ATTACK: 'NumpadAdd',
    COMBO_ESCAPE: 'NumpadDivide',
    MOMENTUM_REVERSAL: 'NumpadMultiply',
  },
} as const;

const oneHandedBindings = {
  player1: {
    MOVE_LEFT: 'KeyA', MOVE_RIGHT: 'KeyD', JUMP: 'KeyW', LIGHT_ATTACK: 'KeyF',
    HEAVY_ATTACK: 'KeyG', SPECIAL_ATTACK: 'KeyR', DEFENSE: 'KeyS',
    ASSIST: 'KeyZ', TAG_SWITCH: 'KeyX', BURST_ASSIST: 'KeyC', PAUSE: 'KeyQ',
  },
  player2: {
    MOVE_LEFT: 'Numpad4', MOVE_RIGHT: 'Numpad6', JUMP: 'Numpad8',
    LIGHT_ATTACK: 'Numpad1', HEAVY_ATTACK: 'Numpad2', SPECIAL_ATTACK: 'Numpad5',
    DEFENSE: 'Numpad0', ASSIST: 'Numpad7', TAG_SWITCH: 'Numpad9',
    BURST_ASSIST: 'NumpadDecimal', PAUSE: 'NumpadEnter',
  },
} as const;

export function applyControlScheme(
  profile: KeyboardInputProfile,
  scheme: ControlScheme,
): KeyboardInputProfile {
  const playerId = profile.playerId;
  const next = cloneKeyboardProfile(profile);
  next.scheme = scheme;
  next.classicBindings = scheme === 'CLASSIC' ? { ...classicBindings[playerId] } : undefined;
  if (scheme === 'ONE_HANDED') next.bindings = { ...oneHandedBindings[playerId] };
  if (scheme === 'SIMPLIFIED') {
    next.bindings = { ...defaultKeyboardProfiles[playerId].bindings };
  }
  return next;
}

export function classicBindingsFor(playerId: PlayerId) {
  return { ...classicBindings[playerId] };
}
