import type { GameAction, InputFrame } from '../core/types';

const EMPTY_FRAME: InputFrame = { player1: [], player2: [] };

function readActions(gamepad: Gamepad | null | undefined): GameAction[] {
  if (!gamepad) return [];
  const actions: GameAction[] = [];
  if ((gamepad.axes[0] ?? 0) < -0.35) actions.push('moveLeft');
  if ((gamepad.axes[0] ?? 0) > 0.35) actions.push('moveRight');
  if (gamepad.buttons[0]?.pressed) actions.push('lightAttack');
  if (gamepad.buttons[1]?.pressed) actions.push('block');
  if (gamepad.buttons[2]?.pressed) actions.push('jump');
  return actions;
}

export class GamepadProvider {
  snapshot(): InputFrame {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return EMPTY_FRAME;
    const pads = navigator.getGamepads();
    return {
      player1: readActions(pads[0]),
      player2: readActions(pads[1]),
    };
  }
}
