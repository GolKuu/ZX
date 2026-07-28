import type {
  CombatAction,
  PlayerId,
  PlayerInputFrame,
} from '../core/types';
import type { TeamSimulationSnapshot } from './TeamTypes';

export class TeamAiController {
  frame(teamId: PlayerId, snapshot: TeamSimulationSnapshot): PlayerInputFrame {
    const opponentId = teamId === 'player1' ? 'player2' : 'player1';
    const fighter = snapshot.fighters[teamId];
    const opponent = snapshot.fighters[opponentId];
    const distance = Math.abs(fighter.x - opponent.x);
    const held: CombatAction[] = [];
    const pressed: CombatAction[] = [];

    if (distance > 115) {
      held.push(fighter.x < opponent.x ? 'MOVE_RIGHT' : 'MOVE_LEFT');
    } else if (snapshot.tick % 38 === 0) {
      held.push('LIGHT_ATTACK');
      pressed.push('LIGHT_ATTACK');
    } else if (snapshot.tick % 83 === 0) {
      held.push('HEAVY_ATTACK');
      pressed.push('HEAVY_ATTACK');
    }

    const team = snapshot.teamBattle.teams[teamId];
    const partner = team.members[team.activeMember === 0 ? 1 : 0];
    if (
      fighter.health / fighter.maxHealth < 0.28 &&
      !partner.defeated &&
      team.tagCooldownTicks === 0
    ) {
      held.push('TAG_SWITCH');
      pressed.push('TAG_SWITCH');
    } else if (snapshot.tick % 211 === 0 && team.assistCooldownTicks === 0) {
      held.push('ASSIST');
      pressed.push('ASSIST');
    }
    if (
      ['hitstun', 'blockstun', 'knockdown'].includes(fighter.mode) &&
      team.burstAssistAvailable
    ) {
      held.push('BURST_ASSIST');
      pressed.push('BURST_ASSIST');
    }
    return { held, pressed, released: [] };
  }
}
