import { AttackSystem } from '../combat/AttackSystem';
import { BlockSystem } from '../combat/BlockSystem';
import { DamageSystem } from '../combat/DamageSystem';
import { HealthComponent } from '../combat/HealthComponent';
import { balanceConfig } from '../config/balanceConfig';
import { FighterStateMachine } from '../core/FighterStateMachine';
import type {
  PlayerId,
  PlayerInputFrame,
  SimulationSnapshot,
} from '../core/types';
import { cloneFighter, resetTransientState } from './TeamSnapshotUtils';
import { createEmptyCombo } from './TeamStateFactory';
import type {
  TeamAction,
  TeamBattleSnapshot,
  TeamMemberIndex,
} from './TeamTypes';

const EMPTY_INPUT: PlayerInputFrame = { held: [], pressed: [], released: [] };
const NO_BLOCK = { kind: 'none' as const, blocked: false };

export class TeamAssistSystem {
  private readonly attacks = new AttackSystem();
  private readonly blocks = new BlockSystem();
  private readonly damage = new DamageSystem();
  private readonly health = new HealthComponent();
  private readonly states = new FighterStateMachine();

  start(
    action: Extract<TeamAction, 'ASSIST' | 'BURST_ASSIST'>,
    teamId: PlayerId,
    state: SimulationSnapshot,
    battle: TeamBattleSnapshot,
  ) {
    const team = battle.teams[teamId];
    const memberIndex: TeamMemberIndex = team.activeMember === 0 ? 1 : 0;
    const helper = cloneFighter(team.members[memberIndex].fighter);
    const active = state.fighters[teamId];
    resetTransientState(helper, active.x - active.facing * 76);
    helper.facing = active.facing;
    team.assist = {
      kind: action,
      memberIndex,
      fighter: helper,
      ticksRemaining: action === 'ASSIST'
        ? balanceConfig.assistDurationTicks
        : balanceConfig.burstAssistDurationTicks,
      connected: false,
    };
    team.assistCooldownTicks = balanceConfig.assistCooldownTicks;
    if (action === 'ASSIST') {
      team.assistComboLocked = true;
      this.attacks.prepare(helper, attackInput());
    } else {
      team.burstAssistAvailable = false;
      this.applyBurst(teamId, state);
    }
  }

  tick(
    state: SimulationSnapshot,
    battle: TeamBattleSnapshot,
    inputs: Record<PlayerId, PlayerInputFrame>,
  ) {
    (['player1', 'player2'] as const).forEach((teamId) => {
      const assist = battle.teams[teamId].assist;
      if (!assist) return;
      const opponentId = teamId === 'player1' ? 'player2' : 'player1';
      this.states.tick(assist.fighter);
      this.attacks.prepare(assist.fighter, EMPTY_INPUT);
      this.hitOpponent(teamId, opponentId, state, battle, inputs[opponentId]);
      this.hitAssistant(opponentId, teamId, state, battle);
      this.attacks.finishTick(assist.fighter);
      assist.ticksRemaining -= 1;
      this.persistOrDismiss(teamId, battle);
    });
  }

  private hitOpponent(
    teamId: PlayerId,
    opponentId: PlayerId,
    state: SimulationSnapshot,
    battle: TeamBattleSnapshot,
    defenderInput: PlayerInputFrame,
  ) {
    const assist = battle.teams[teamId].assist;
    if (!assist || assist.connected || assist.kind !== 'ASSIST') return;
    const defender = state.fighters[opponentId];
    const contact = this.attacks.findContact(assist.fighter, defender);
    if (!contact) return;
    const block = this.blocks.tryBlock(defender, defenderInput, contact.definition);
    this.damage.apply(
      assist.fighter,
      defender,
      contact.definition,
      state.combos[teamId],
      block,
    );
    assist.connected = true;
    battle.teams[teamId].assistComboLocked = true;
  }

  private hitAssistant(
    attackerId: PlayerId,
    assistantTeamId: PlayerId,
    state: SimulationSnapshot,
    battle: TeamBattleSnapshot,
  ) {
    const assist = battle.teams[assistantTeamId].assist;
    if (!assist) return;
    const attacker = state.fighters[attackerId];
    const contact = this.attacks.findContact(attacker, assist.fighter);
    if (!contact) return;
    this.damage.apply(
      attacker,
      assist.fighter,
      contact.definition,
      state.combos[attackerId],
      NO_BLOCK,
    );
  }

  private applyBurst(teamId: PlayerId, state: SimulationSnapshot) {
    const opponentId = teamId === 'player1' ? 'player2' : 'player1';
    const active = state.fighters[teamId];
    const opponent = state.fighters[opponentId];
    active.mode = active.grounded ? 'idle' : 'jumping';
    active.modeTicksRemaining = 0;
    active.attack = null;
    this.health.damage(opponent, balanceConfig.burstAssistDamage);
    opponent.velocityX = (opponent.x < active.x ? -1 : 1) *
      balanceConfig.burstAssistKnockbackSpeed;
    state.combos[opponentId] = createEmptyCombo();
  }

  private persistOrDismiss(teamId: PlayerId, battle: TeamBattleSnapshot) {
    const team = battle.teams[teamId];
    const assist = team.assist;
    if (!assist) return;
    const member = team.members[assist.memberIndex];
    member.fighter = cloneFighter(assist.fighter);
    member.defeated = member.fighter.health <= 0;
    if (member.defeated || assist.ticksRemaining <= 0) team.assist = null;
  }
}

function attackInput(): PlayerInputFrame {
  return { held: ['LIGHT_ATTACK'], pressed: ['LIGHT_ATTACK'], released: [] };
}
