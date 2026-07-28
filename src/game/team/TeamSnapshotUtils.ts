import type { FighterSnapshot } from '../core/types';
import type {
  TeamBattleSnapshot,
  TeamMemberSnapshot,
  TeamSnapshot,
} from './TeamTypes';

export function cloneTeamBattle(snapshot: TeamBattleSnapshot): TeamBattleSnapshot {
  return {
    ...snapshot,
    teams: {
      player1: cloneTeam(snapshot.teams.player1),
      player2: cloneTeam(snapshot.teams.player2),
    },
  };
}

export function cloneTeam(team: TeamSnapshot): TeamSnapshot {
  return {
    ...team,
    members: [
      cloneMember(team.members[0]),
      cloneMember(team.members[1]),
    ],
    assist: team.assist
      ? { ...team.assist, fighter: cloneFighter(team.assist.fighter) }
      : null,
  };
}

export function cloneMember(member: TeamMemberSnapshot): TeamMemberSnapshot {
  return { ...member, fighter: cloneFighter(member.fighter) };
}

export function cloneFighter(fighter: FighterSnapshot): FighterSnapshot {
  return {
    ...fighter,
    defense: { ...fighter.defense },
    attack: fighter.attack
      ? { ...fighter.attack, hitHitboxes: [...fighter.attack.hitHitboxes] }
      : null,
  };
}

export function resetTransientState(fighter: FighterSnapshot, x: number) {
  fighter.x = x;
  fighter.y = 450;
  fighter.velocityX = 0;
  fighter.velocityY = 0;
  fighter.guard = null;
  fighter.mode = fighter.health > 0 ? 'idle' : 'knockout';
  fighter.modeTicksRemaining = 0;
  fighter.attack = null;
  fighter.dashTicksRemaining = 0;
  fighter.grounded = true;
  fighter.vulnerableTicksRemaining = 0;
  fighter.landedTicksRemaining = 0;
  fighter.rhythmPressure = Math.min(fighter.rhythmPressure, 45);
  fighter.rhythmLockTicks = 0;
  fighter.lastAttackIntent = null;
  fighter.lastAttackIntentTick = -1_000;
}
