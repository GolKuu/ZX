import type { PlayerId, SimulationSnapshot } from '../core/types';
import type {
  TeamAction,
  TeamActionValidation,
  TeamBattleSnapshot,
} from './TeamTypes';

export class TeamActionValidator {
  validate(
    action: TeamAction,
    teamId: PlayerId,
    state: SimulationSnapshot,
    battle: TeamBattleSnapshot,
  ): TeamActionValidation {
    if (state.roundPhase !== 'ACTIVE') return rejected('ROUND_NOT_ACTIVE');
    const team = battle.teams[teamId];
    const active = state.fighters[teamId];
    const partner = team.members[team.activeMember === 0 ? 1 : 0];
    if (team.members.every((member) => member.defeated)) {
      return rejected('TEAM_DEFEATED');
    }
    if (partner.defeated) return rejected('PARTNER_DEFEATED');
    if (team.assist) return rejected('ASSIST_ACTIVE');

    if (action === 'TAG_SWITCH') {
      if (team.tagCooldownTicks > 0) return rejected('TAG_COOLDOWN');
      if (!canTag(active.mode)) return rejected('ACTIVE_FIGHTER_BUSY');
      return { ok: true };
    }
    if (action === 'ASSIST') {
      if (team.assistCooldownTicks > 0) return rejected('ASSIST_COOLDOWN');
      if (team.assistComboLocked) {
        return rejected('ASSIST_ALREADY_EXTENDED_COMBO');
      }
      return { ok: true };
    }
    if (!team.burstAssistAvailable) return rejected('BURST_ALREADY_USED');
    const opponentId = teamId === 'player1' ? 'player2' : 'player1';
    const pressured = ['hitstun', 'blockstun', 'knockdown'].includes(active.mode) ||
      state.combos[opponentId].targetId === teamId;
    return pressured ? { ok: true } : rejected('BURST_NOT_UNDER_PRESSURE');
  }
}

function canTag(mode: string) {
  return ['idle', 'walking', 'crouching', 'jumping'].includes(mode);
}

function rejected(
  reason: Extract<TeamActionValidation, { ok: false }>['reason'],
): TeamActionValidation {
  return { ok: false, reason };
}
