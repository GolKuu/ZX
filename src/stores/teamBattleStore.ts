import {
  cloneKeyboardProfiles,
  defaultGamepadProfile,
} from '../game/config/defaultControls';
import type { PlayerId } from '../game/core/types';
import type { PlayerInputAssignment } from '../game/input/InputProfile';
import { createTeamBattleConfig } from '../game/team/TeamModeFactory';
import type { TeamBattleConfig, TeamMode } from '../game/team/TeamTypes';

export type LocalTeamBattleConfig = {
  battle: TeamBattleConfig;
  assignments: Record<PlayerId, PlayerInputAssignment>;
};

let activeBattle: LocalTeamBattleConfig | null = null;

export function createLocalTeamBattle(mode: TeamMode): LocalTeamBattleConfig {
  const profiles = cloneKeyboardProfiles();
  const assignment = (playerId: PlayerId): PlayerInputAssignment => ({
    playerId,
    device: { kind: 'keyboard', id: 'keyboard' },
    keyboardProfile: profiles[playerId],
    gamepadProfile: defaultGamepadProfile,
  });
  return {
    battle: createTeamBattleConfig(mode),
    assignments: {
      player1: assignment('player1'),
      player2: assignment('player2'),
    },
  };
}

export const teamBattleStore = {
  set(config: LocalTeamBattleConfig) {
    activeBattle = config;
  },
  get() {
    return activeBattle;
  },
  clear() {
    activeBattle = null;
  },
};
