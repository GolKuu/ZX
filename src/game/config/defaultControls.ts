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
    bindings: {
      MOVE_LEFT: 'KeyA',
      MOVE_RIGHT: 'KeyD',
      JUMP: 'KeyH',
      CROUCH: 'KeyS',
      LIGHT_ATTACK: 'KeyJ',
      HEAVY_ATTACK: 'KeyK',
      SPECIAL_ATTACK: 'KeyL',
      BLOCK: 'Semicolon',
      GRAB: 'KeyU',
      SUPER_ATTACK: 'KeyI',
      COMBO_ESCAPE: 'KeyO',
      MOMENTUM_REVERSAL: 'KeyP',
      PAUSE: sharedPause,
    },
  },
  player2: {
    id: 'keyboard-player2',
    kind: 'keyboard',
    playerId: 'player2',
    label: 'Клавиатура — Player 2',
    bindings: {
      MOVE_LEFT: 'ArrowLeft',
      MOVE_RIGHT: 'ArrowRight',
      JUMP: 'ArrowUp',
      CROUCH: 'ArrowDown',
      LIGHT_ATTACK: 'Numpad1',
      HEAVY_ATTACK: 'Numpad2',
      SPECIAL_ATTACK: 'Numpad3',
      BLOCK: 'Numpad0',
      GRAB: 'NumpadEnter',
      SUPER_ATTACK: 'NumpadAdd',
      COMBO_ESCAPE: 'NumpadDivide',
      MOMENTUM_REVERSAL: 'NumpadMultiply',
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
  bindings: {
    MOVE_LEFT: axis(-1, 14),
    MOVE_RIGHT: axis(1, 15),
    JUMP: button(0),
    CROUCH: [
      { type: 'axis', axis: 1, direction: 1 },
      { type: 'button', index: 13 },
    ],
    LIGHT_ATTACK: button(2),
    HEAVY_ATTACK: button(3),
    SPECIAL_ATTACK: button(1),
    BLOCK: button(4),
    GRAB: button(5),
    SUPER_ATTACK: button(6),
    COMBO_ESCAPE: button(8),
    MOMENTUM_REVERSAL: button(10),
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
  return { ...profile, bindings: { ...profile.bindings } };
}

export const actionLabels: Record<GameAction, string> = {
  MOVE_LEFT: 'Влево',
  MOVE_RIGHT: 'Вправо',
  JUMP: 'Прыжок',
  CROUCH: 'Приседание',
  LIGHT_ATTACK: 'Лёгкая атака',
  HEAVY_ATTACK: 'Тяжёлая атака',
  SPECIAL_ATTACK: 'Специальная атака',
  BLOCK: 'Блок',
  GRAB: 'Захват',
  SUPER_ATTACK: 'Суперприём',
  COMBO_ESCAPE: 'Выход из комбо',
  MOMENTUM_REVERSAL: 'Разворот импульса',
  PAUSE: 'Пауза',
};

export const playerLabels: Record<PlayerId, string> = {
  player1: 'Player 1',
  player2: 'Player 2',
};
