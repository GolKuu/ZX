import {
  cloneKeyboardProfiles,
  defaultGamepadProfile,
} from '../config/defaultControls';
import type { CombatAction, InputFrame, PlayerId, PlayerInputFrame } from '../core/types';
import type { LocalPvpMatchConfig } from '../../stores/localPvpStore';

export const emptyPlayerInput = (): PlayerInputFrame => ({
  held: [],
  pressed: [],
  released: [],
});

export function inputFrame(
  playerId: PlayerId,
  held: CombatAction[] = [],
  pressed: CombatAction[] = held,
): InputFrame {
  return {
    player1:
      playerId === 'player1' ? { held, pressed, released: [] } : emptyPlayerInput(),
    player2:
      playerId === 'player2' ? { held, pressed, released: [] } : emptyPlayerInput(),
  };
}

export function emptyInputFrame(): InputFrame {
  return { player1: emptyPlayerInput(), player2: emptyPlayerInput() };
}

export function createTestMatchConfig(): LocalPvpMatchConfig {
  const profiles = cloneKeyboardProfiles();
  return {
    assignments: {
      player1: {
        playerId: 'player1',
        device: { kind: 'keyboard', id: 'keyboard' },
        keyboardProfile: profiles.player1,
        gamepadProfile: defaultGamepadProfile,
      },
      player2: {
        playerId: 'player2',
        device: { kind: 'keyboard', id: 'keyboard' },
        keyboardProfile: profiles.player2,
        gamepadProfile: defaultGamepadProfile,
      },
    },
    characters: { player1: 'comet', player2: 'pulse' },
    ready: { player1: true, player2: true },
  };
}
