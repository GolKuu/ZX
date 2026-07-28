import { balanceConfig } from '../config/balanceConfig';
import type { PlayerId, SimulationSnapshot } from '../core/types';
import { cloneFighter, resetTransientState } from './TeamSnapshotUtils';
import type { TeamBattleSnapshot, TeamMemberIndex } from './TeamTypes';

const TEAMS: readonly PlayerId[] = ['player1', 'player2'];

export class TeamRoster {
  tick(battle: TeamBattleSnapshot, state: SimulationSnapshot) {
    TEAMS.forEach((teamId) => {
      const team = battle.teams[teamId];
      if (team.tagCooldownTicks > 0) team.tagCooldownTicks -= 1;
      if (team.assistCooldownTicks > 0) team.assistCooldownTicks -= 1;
      if (state.combos[teamId].remainingTicks === 0) team.assistComboLocked = false;
    });
  }

  syncActive(
    battle: TeamBattleSnapshot,
    state: SimulationSnapshot,
    teamId: PlayerId,
  ) {
    const team = battle.teams[teamId];
    const member = team.members[team.activeMember];
    member.fighter = cloneFighter(state.fighters[teamId]);
    member.defeated = member.fighter.health <= 0;
  }

  switch(
    battle: TeamBattleSnapshot,
    state: SimulationSnapshot,
    teamId: PlayerId,
    forced = false,
  ) {
    this.syncActive(battle, state, teamId);
    const team = battle.teams[teamId];
    const nextIndex: TeamMemberIndex = team.activeMember === 0 ? 1 : 0;
    if (team.members[nextIndex].defeated) return false;
    const outgoing = state.fighters[teamId];
    team.activeMember = nextIndex;
    const incoming = cloneFighter(team.members[nextIndex].fighter);
    resetTransientState(incoming, outgoing.x);
    incoming.facing = outgoing.facing;
    state.fighters[teamId] = incoming;
    team.tagCooldownTicks = forced ? 0 : balanceConfig.tagSwitchCooldownTicks;
    return true;
  }

  isEliminated(battle: TeamBattleSnapshot, teamId: PlayerId) {
    return battle.teams[teamId].members.every((member) => member.defeated);
  }

  combinedHealth(battle: TeamBattleSnapshot, teamId: PlayerId) {
    return battle.teams[teamId].members.reduce(
      (sum, member) => sum + member.fighter.health / member.fighter.maxHealth,
      0,
    );
  }
}
