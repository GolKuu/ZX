import { defaultGamepadProfile } from '../game/config/defaultControls';
import { GAME_ACTIONS, type PlayerId } from '../game/core/types';
import type {
  InputDeviceAssignment,
  KeyboardProfiles,
  PlayerInputAssignment,
} from '../game/input/InputProfile';
import { findKeyboardConflicts, validateAssignments } from '../game/input/inputValidation';
import type { AiDifficulty } from '../game/ai/AiDifficulty';

export type LocalPvpMatchConfig = {
  assignments: Record<PlayerId, PlayerInputAssignment>;
  characters: Record<PlayerId, string>;
  ready: Record<PlayerId, boolean>;
  aiPlayerId?: PlayerId;
  aiDifficulty?: AiDifficulty;
};

let activeMatch: LocalPvpMatchConfig | null = null;

export function createMatchConfig(
  devices: Record<PlayerId, InputDeviceAssignment>,
  profiles: KeyboardProfiles,
  characters: Record<PlayerId, string>,
  ready: Record<PlayerId, boolean>,
): LocalPvpMatchConfig {
  const assignment = (playerId: PlayerId): PlayerInputAssignment => ({
    playerId,
    device: devices[playerId],
    keyboardProfile: profiles[playerId],
    gamepadProfile: defaultGamepadProfile,
  });
  return {
    assignments: {
      player1: assignment('player1'),
      player2: assignment('player2'),
    },
    characters: { ...characters },
    ready: { ...ready },
  };
}

export function validateMatchConfig(config: LocalPvpMatchConfig) {
  if (!config.ready.player1) return 'Player 1 ещё не подтвердил готовность.';
  if (!config.ready.player2) return 'Player 2 ещё не подтвердил готовность.';

  const assignmentError = validateAssignments(config.assignments);
  if (assignmentError) return assignmentError;

  for (const playerId of ['player1', 'player2'] as const) {
    const assignment = config.assignments[playerId];
    if (assignment.device.kind !== 'keyboard') continue;
    const missing = GAME_ACTIONS.filter((action) => !assignment.keyboardProfile.bindings[action]);
    if (missing.length > 0) return `${playerId}: назначены не все обязательные действия.`;
  }

  const activeKeyboardPlayers = new Set(
    (['player1', 'player2'] as const).filter(
      (playerId) => config.assignments[playerId].device.kind === 'keyboard',
    ),
  );
  const activeConflicts = findKeyboardConflicts({
    player1: config.assignments.player1.keyboardProfile,
    player2: config.assignments.player2.keyboardProfile,
  }).filter(
    (conflict) =>
      activeKeyboardPlayers.has(conflict.first.playerId) &&
      activeKeyboardPlayers.has(conflict.second.playerId),
  );
  if (activeConflicts.length > 0) return 'Обнаружены критические конфликты клавиш.';
  return null;
}

export const localPvpStore = {
  set(config: LocalPvpMatchConfig) {
    activeMatch = config;
  },
  get() {
    return activeMatch;
  },
  clear() {
    activeMatch = null;
  },
};
