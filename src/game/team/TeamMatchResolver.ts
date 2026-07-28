import type { PlayerId, SimulationSnapshot } from '../core/types';
import { TeamRoster } from './TeamRoster';
import type { TeamBattleSnapshot } from './TeamTypes';

const TEAM_IDS: readonly PlayerId[] = ['player1', 'player2'];

export class TeamMatchResolver {
  constructor(private readonly roster: TeamRoster) {}

  update(state: SimulationSnapshot, battle: TeamBattleSnapshot) {
    TEAM_IDS.forEach((teamId) => this.roster.syncActive(battle, state, teamId));
    this.replaceKnockedOutFighters(state, battle);
    this.roster.tick(battle, state);
    this.finishMatchIfNeeded(state, battle);
  }

  private replaceKnockedOutFighters(
    state: SimulationSnapshot,
    battle: TeamBattleSnapshot,
  ) {
    TEAM_IDS.forEach((teamId) => {
      const team = battle.teams[teamId];
      if (!team.members[team.activeMember].defeated) return;
      if (team.assist) team.assist = null;
      this.roster.switch(battle, state, teamId, true);
    });
  }

  private finishMatchIfNeeded(
    state: SimulationSnapshot,
    battle: TeamBattleSnapshot,
  ) {
    const firstOut = this.roster.isEliminated(battle, 'player1');
    const secondOut = this.roster.isEliminated(battle, 'player2');
    let winner: PlayerId | null = firstOut === secondOut
      ? null
      : firstOut ? 'player2' : 'player1';
    if (!firstOut && !secondOut && state.roundTicksRemaining === 0) {
      const firstHealth = this.roster.combinedHealth(battle, 'player1');
      const secondHealth = this.roster.combinedHealth(battle, 'player2');
      winner = firstHealth === secondHealth
        ? null
        : firstHealth > secondHealth ? 'player1' : 'player2';
    }
    if (!winner && !firstOut && !secondOut && state.roundTicksRemaining > 0) return;
    battle.winner = winner;
    state.roundWinner = winner;
    state.matchWinner = winner;
    if (winner) state.wins[winner] = 1;
    state.roundPhase = 'MATCH_OVER';
  }
}
