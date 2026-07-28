import type { PlayerId, PlayerInputFrame } from '../core/types';
import { TeamAiController } from './TeamAiController';
import type {
  TeamInputFrame,
  TeamSimulationSnapshot,
} from './TeamTypes';

const EMPTY_INPUT: PlayerInputFrame = { held: [], pressed: [], released: [] };

export class TeamInputResolver {
  private readonly ai = new TeamAiController();

  resolve(
    input: TeamInputFrame,
    snapshot: TeamSimulationSnapshot,
  ): Record<PlayerId, PlayerInputFrame> {
    return {
      player1: this.forTeam('player1', input, snapshot),
      player2: this.forTeam('player2', input, snapshot),
    };
  }

  empty(): Record<PlayerId, PlayerInputFrame> {
    return { player1: EMPTY_INPUT, player2: EMPTY_INPUT };
  }

  private forTeam(
    teamId: PlayerId,
    input: TeamInputFrame,
    snapshot: TeamSimulationSnapshot,
  ) {
    const team = snapshot.teamBattle.teams[teamId];
    const controller = team.aiTakeover
      ? 'AI'
      : team.members[team.activeMember].controller;
    return controller === 'AI'
      ? this.ai.frame(teamId, snapshot)
      : input[controller] ?? EMPTY_INPUT;
  }
}
