import { FIXED_STEP_SECONDS } from '../../../src/game/config/balanceConfig.js';
import type { PlayerId } from '../../../src/game/core/types.js';
import { TeamCombatSimulation } from '../../../src/game/team/TeamCombatSimulation.js';
import { createTeamBattleConfig } from '../../../src/game/team/TeamModeFactory.js';
import type {
  TeamAction,
  TeamSimulationSnapshot,
} from '../../../src/game/team/TeamTypes.js';
import type { PlayerInputTimeline } from '../simulation/PlayerInputTimeline.js';

export class AuthoritativeTeamMatch {
  private readonly simulation: TeamCombatSimulation;

  constructor(private readonly characters: Record<PlayerId, string>) {
    this.simulation = new TeamCombatSimulation(
      createTeamBattleConfig('ONLINE_2V2', {
        player1: [characters.player1, backupFor(characters.player1)],
        player2: [characters.player2, backupFor(characters.player2)],
      }),
    );
  }

  step(inputs: Record<PlayerId, PlayerInputTimeline>) {
    this.simulation.step({
      ONLINE_PLAYER_1: inputs.player1.frame(this.tick),
      ONLINE_PLAYER_2: inputs.player2.frame(this.tick),
    }, FIXED_STEP_SECONDS);
    return this.snapshot;
  }

  setAiTakeover(playerId: PlayerId, active: boolean) {
    this.simulation.setAiTakeover(playerId, active);
  }

  validateAction(playerId: PlayerId, action: TeamAction) {
    return this.simulation.validateAction(playerId, action);
  }

  setPaused(paused: boolean) {
    this.simulation.setPaused(paused);
  }

  rematch(inputs: Record<PlayerId, PlayerInputTimeline>) {
    inputs.player1.reset();
    inputs.player2.reset();
    this.simulation.rematch();
  }

  forfeit(winner: PlayerId) {
    const loser: PlayerId = winner === 'player1' ? 'player2' : 'player1';
    const snapshot = this.simulation.getSnapshot();
    snapshot.teamBattle.teams[loser].members.forEach((member) => {
      member.fighter.health = 0;
      member.defeated = true;
    });
    snapshot.teamBattle.winner = winner;
    snapshot.roundWinner = winner;
    snapshot.matchWinner = winner;
    snapshot.wins[winner] = 1;
    snapshot.roundPhase = 'MATCH_OVER';
    this.simulation.restore(snapshot);
  }

  get snapshot(): TeamSimulationSnapshot {
    return this.simulation.getSnapshot();
  }

  get tick() {
    return this.snapshot.tick;
  }

  get selectedCharacters() {
    return { ...this.characters };
  }
}

function backupFor(characterId: string) {
  return characterId === 'granite' ? 'shira' : 'granite';
}
