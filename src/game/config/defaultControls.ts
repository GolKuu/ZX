import type { GameAction, PlayerId } from '../core/types';

export type ControlBindings = Record<GameAction, string>;
export type PlayerControls = Record<PlayerId, ControlBindings>;

export const defaultControls: PlayerControls = {
  player1: {
    moveLeft: 'KeyA',
    moveRight: 'KeyD',
    jump: 'KeyW',
    lightAttack: 'KeyF',
    block: 'KeyG',
    pause: 'KeyP',
    exit: 'Escape',
  },
  player2: {
    moveLeft: 'ArrowLeft',
    moveRight: 'ArrowRight',
    jump: 'ArrowUp',
    lightAttack: 'Numpad1',
    block: 'Numpad2',
    pause: 'KeyP',
    exit: 'Escape',
  },
};
