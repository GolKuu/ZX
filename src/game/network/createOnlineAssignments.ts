import { defaultGamepadProfile } from '../config/defaultControls';
import type { PlayerId } from '../core/types';
import { ControlStorage } from '../input/ControlStorage';
import type { PlayerInputAssignment } from '../input/InputProfile';

export function createOnlineAssignments(): Record<PlayerId, PlayerInputAssignment> {
  const profiles = new ControlStorage().load();
  return {
    player1: assignment('player1', profiles.player1),
    player2: assignment('player2', profiles.player2),
  };
}

function assignment(
  playerId: PlayerId,
  keyboardProfile: PlayerInputAssignment['keyboardProfile'],
): PlayerInputAssignment {
  return {
    playerId,
    device: { kind: 'keyboard', id: 'keyboard' },
    keyboardProfile,
    gamepadProfile: defaultGamepadProfile,
  };
}
