import type {
  TeamBattleConfig,
  TeamController,
  TeamId,
  TeamMode,
} from './TeamTypes';

const DEFAULT_ROSTERS = {
  player1: ['granite', 'shira'],
  player2: ['shira', 'granite'],
} as const;

export function createTeamBattleConfig(
  mode: TeamMode,
  rosters: TeamBattleConfig['rosters'] = DEFAULT_ROSTERS,
): TeamBattleConfig {
  return {
    mode,
    rosters: cloneRosters(rosters),
    controllers: controllersFor(mode),
  };
}

function controllersFor(
  mode: TeamMode,
): Record<TeamId, readonly [TeamController, TeamController]> {
  if (mode === 'ONLINE_2V2') {
    return {
      player1: ['ONLINE_PLAYER_1', 'ONLINE_PLAYER_1'],
      player2: ['ONLINE_PLAYER_2', 'ONLINE_PLAYER_2'],
    };
  }
  if (mode === 'TWO_PLAYERS_VS_AI') {
    return {
      player1: ['LOCAL_PLAYER_1', 'LOCAL_PLAYER_2'],
      player2: ['AI', 'AI'],
    };
  }
  if (mode === 'PLAYER_AND_AI_VS_TWO_OPPONENTS') {
    return {
      player1: ['LOCAL_PLAYER_1', 'AI'],
      player2: ['AI', 'AI'],
    };
  }
  return {
    player1: ['LOCAL_PLAYER_1', 'LOCAL_PLAYER_1'],
    player2: ['LOCAL_PLAYER_2', 'LOCAL_PLAYER_2'],
  };
}

function cloneRosters(
  rosters: TeamBattleConfig['rosters'],
): TeamBattleConfig['rosters'] {
  return {
    player1: [...rosters.player1],
    player2: [...rosters.player2],
  };
}
