import type { GameAction, PlayerId } from '../core/types';
import type {
  GamepadInputProfile,
  KeyboardInputProfile,
  KeyboardProfiles,
} from '../input/InputProfile';

const sharedPause = 'Escape';

export const defaultKeyboardProfiles: KeyboardProfiles = {
  player1: {
    id: 'keyboard-player1',
    kind: 'keyboard',
    playerId: 'player1',
    label: 'Клавиатура — Player 1',
    scheme: 'SIMPLIFIED',
    bindings: {
      MOVE_LEFT: 'KeyA',
      MOVE_RIGHT: 'KeyD',
      JUMP: 'KeyH',
      LIGHT_ATTACK: 'KeyJ',
      HEAVY_ATTACK: 'KeyK',
      SPECIAL_ATTACK: 'KeyL',
      DEFENSE: 'Semicolon',
      ASSIST: 'Digit1',
      TAG_SWITCH: 'Digit2',
      BURST_ASSIST: 'Digit3',
      PAUSE: sharedPause,
    },
  },
  player2: {
    id: 'keyboard-player2',
    kind: 'keyboard',
    playerId: 'player2',
    label: 'Клавиатура — Player 2',
    scheme: 'SIMPLIFIED',
    bindings: {
      MOVE_LEFT: 'ArrowLeft',
      MOVE_RIGHT: 'ArrowRight',
      JUMP: 'ArrowUp',
      LIGHT_ATTACK: 'Numpad1',
      HEAVY_ATTACK: 'Numpad2',
      SPECIAL_ATTACK: 'Numpad3',
      DEFENSE: 'Numpad0',
      ASSIST: 'Numpad4',
      TAG_SWITCH: 'Numpad5',
      BURST_ASSIST: 'Numpad6',
      PAUSE: sharedPause,
    },
  },
};

const button = (index: number) => [{ type: 'button' as const, index }];
const axis = (direction: -1 | 1, dpadButton: number) => [
  { type: 'axis' as const, axis: 0, direction },
  { type: 'button' as const, index: dpadButton },
];

export const defaultGamepadProfile: GamepadInputProfile = {
  id: 'standard-gamepad',
  kind: 'gamepad',
  label: 'Стандартный геймпад',
  scheme: 'SIMPLIFIED',
  bindings: {
    MOVE_LEFT: axis(-1, 14),
    MOVE_RIGHT: axis(1, 15),
    JUMP: button(2),
    LIGHT_ATTACK: button(0),
    HEAVY_ATTACK: button(1),
    SPECIAL_ATTACK: button(3),
    DEFENSE: button(4),
    ASSIST: button(5),
    TAG_SWITCH: button(6),
    BURST_ASSIST: button(7),
    PAUSE: button(9),
  },
};

export function cloneKeyboardProfiles(profiles = defaultKeyboardProfiles): KeyboardProfiles {
  return {
    player1: cloneKeyboardProfile(profiles.player1),
    player2: cloneKeyboardProfile(profiles.player2),
  };
}

export function cloneKeyboardProfile(profile: KeyboardInputProfile): KeyboardInputProfile {
  return {
    ...profile,
    bindings: { ...profile.bindings },
    classicBindings: profile.classicBindings ? { ...profile.classicBindings } : undefined,
  };
}

export const actionLabels: Record<GameAction, string> = {
  MOVE_LEFT: 'Влево',
  MOVE_RIGHT: 'Вправо',
  JUMP: 'Прыжок',
  LIGHT_ATTACK: 'Лёгкая атака',
  HEAVY_ATTACK: 'Тяжёлая атака',
  SPECIAL_ATTACK: 'Специальная атака',
  DEFENSE: 'Защита',
  ASSIST: 'Помощь союзника',
  TAG_SWITCH: 'Смена бойца',
  BURST_ASSIST: 'Аварийная помощь',
  PAUSE: 'Пауза',
};

export const playerLabels: Record<PlayerId, string> = {
  player1: 'Player 1',
  player2: 'Player 2',
};
