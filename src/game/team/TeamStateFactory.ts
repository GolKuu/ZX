import { createFighter } from '../core/SimulationStateFactory';
import type { PlayerId } from '../core/types';
import type {
  TeamBattleConfig,
  TeamBattleSnapshot,
  TeamMemberSnapshot,
  TeamSnapshot,
} from './TeamTypes';

export function createTeamBattleState(config: TeamBattleConfig): TeamBattleSnapshot {
  return {
    mode: config.mode,
    winner: null,
    teams: {
      player1: createTeam('player1', config, 250),
      player2: createTeam('player2', config, 710),
    },
  };
}

function createTeam(
  teamId: PlayerId,
  config: TeamBattleConfig,
  x: number,
): TeamSnapshot {
  return {
    activeMember: 0,
    members: [
      member(teamId, config.rosters[teamId][0], config.controllers[teamId][0], x),
      member(teamId, config.rosters[teamId][1], config.controllers[teamId][1], x),
    ],
    tagCooldownTicks: 0,
    assistCooldownTicks: 0,
    assistComboLocked: false,
    burstAssistAvailable: true,
    assist: null,
    aiTakeover: false,
  };
}

function member(
  teamId: PlayerId,
  characterId: string,
  controller: TeamMemberSnapshot['controller'],
  x: number,
): TeamMemberSnapshot {
  return {
    fighter: createFighter(teamId, x, characterId),
    controller,
    defeated: false,
  };
}
