import { GAME_ACTIONS, type GameAction, type PlayerId } from '../core/types';
import type { KeyboardProfiles, PlayerInputAssignment } from './InputProfile';

export type InputConflict = {
  code: string;
  first: { playerId: PlayerId; action: GameAction };
  second: { playerId: PlayerId; action: GameAction };
};

export function findMissingActions(profiles: KeyboardProfiles) {
  return (Object.entries(profiles) as [PlayerId, KeyboardProfiles[PlayerId]][]).flatMap(
    ([playerId, profile]) =>
      GAME_ACTIONS.filter((action) => !profile.bindings[action]).map((action) => ({
        playerId,
        action,
      })),
  );
}

export function findKeyboardConflicts(profiles: KeyboardProfiles): InputConflict[] {
  const seen = new Map<string, { playerId: PlayerId; action: GameAction }>();
  const conflicts: InputConflict[] = [];

  (Object.entries(profiles) as [PlayerId, KeyboardProfiles[PlayerId]][]).forEach(
    ([playerId, profile]) => {
      GAME_ACTIONS.forEach((action) => {
        const code = profile.bindings[action];
        const previous = seen.get(code);
        const sharedPause = action === 'PAUSE' && previous?.action === 'PAUSE';
        if (previous && !sharedPause) {
          conflicts.push({ code, first: previous, second: { playerId, action } });
        } else if (!previous) {
          seen.set(code, { playerId, action });
        }
      });
    },
  );

  return conflicts;
}

export function validateAssignments(assignments: Record<PlayerId, PlayerInputAssignment>) {
  const first = assignments.player1.device;
  const second = assignments.player2.device;
  if (
    first.kind === 'gamepad' &&
    second.kind === 'gamepad' &&
    first.gamepadIndex === second.gamepadIndex
  ) {
    return 'Оба игрока не могут использовать один и тот же геймпад.';
  }
  return null;
}
