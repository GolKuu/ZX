import { FIXED_STEP_SECONDS } from '../config/balanceConfig';
import { cloneSnapshot } from '../core/cloneSnapshot';
import type { PlayerId, PlayerInputFrame } from '../core/types';
import { TeamCombatSimulation } from '../team/TeamCombatSimulation';
import type {
  TeamBattleConfig,
  TeamController,
  TeamSimulationSnapshot,
} from '../team/TeamTypes';

type PendingInput = {
  sequence: number;
  frame: PlayerInputFrame;
};

export class PredictionEngine {
  private simulation: TeamCombatSimulation | null = null;
  private pending: PendingInput[] = [];
  private predicted: TeamSimulationSnapshot | null = null;

  constructor(private readonly localPlayerId: PlayerId) {}

  predict(sequence: number, frame: PlayerInputFrame) {
    this.pending.push({ sequence, frame });
    if (!this.simulation) return;
    this.simulation.step(this.inputFrame(frame), FIXED_STEP_SECONDS);
    this.predicted = this.simulation.getSnapshot();
  }

  reconcile(
    authoritative: TeamSimulationSnapshot,
    acknowledgedSequence: number,
  ) {
    this.pending = this.pending
      .filter((input) => input.sequence > acknowledgedSequence)
      .slice(-120);
    if (!this.simulation) {
      this.simulation = new TeamCombatSimulation(configFrom(authoritative));
    }
    this.simulation.restore(authoritative);
    this.pending.forEach(({ frame }) =>
      this.simulation!.step(this.inputFrame(frame), FIXED_STEP_SECONDS),
    );
    this.predicted = this.simulation.getSnapshot();
  }

  render(remote: TeamSimulationSnapshot | null) {
    const output = this.predicted
      ? cloneSnapshot(this.predicted)
      : remote ? cloneSnapshot(remote) : null;
    if (!output || !remote) return output;
    const opponentId: PlayerId =
      this.localPlayerId === 'player1' ? 'player2' : 'player1';
    output.fighters[opponentId] = { ...remote.fighters[opponentId] };
    output.teamBattle.teams[opponentId] = cloneSnapshot(remote)
      .teamBattle.teams[opponentId];
    return output;
  }

  reset() {
    this.simulation = null;
    this.pending = [];
    this.predicted = null;
  }

  private inputFrame(local: PlayerInputFrame) {
    const controller: TeamController = this.localPlayerId === 'player1'
      ? 'ONLINE_PLAYER_1'
      : 'ONLINE_PLAYER_2';
    return { [controller]: local };
  }
}

function configFrom(snapshot: TeamSimulationSnapshot): TeamBattleConfig {
  const teams = snapshot.teamBattle.teams;
  return {
    mode: snapshot.teamBattle.mode,
    rosters: {
      player1: [
        teams.player1.members[0].fighter.characterId,
        teams.player1.members[1].fighter.characterId,
      ],
      player2: [
        teams.player2.members[0].fighter.characterId,
        teams.player2.members[1].fighter.characterId,
      ],
    },
    controllers: {
      player1: controllers(teams.player1.members),
      player2: controllers(teams.player2.members),
    },
  };
}

function controllers(
  members: TeamSimulationSnapshot['teamBattle']['teams']['player1']['members'],
): readonly [TeamController, TeamController] {
  return [members[0].controller, members[1].controller];
}
