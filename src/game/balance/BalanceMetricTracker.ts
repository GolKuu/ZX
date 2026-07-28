import { findCharacterAttack } from '../data/attacks/characterAttacks';
import type { PlayerId, SimulationSnapshot } from '../core/types';
import type { FighterMetrics } from './BalanceTypes';

const PLAYERS: readonly PlayerId[] = ['player1', 'player2'];

type TickState = {
  health: Record<PlayerId, number>;
  attack: Record<PlayerId, {
    id: string;
    frame: number;
    connected: boolean;
  } | null>;
  effect: Record<PlayerId, string>;
};

export class BalanceMetricTracker {
  readonly metrics: Record<PlayerId, FighterMetrics> = {
    player1: emptyMetrics(),
    player2: emptyMetrics(),
  };

  capture(state: SimulationSnapshot): TickState {
    return {
      health: {
        player1: state.fighters.player1.health,
        player2: state.fighters.player2.health,
      },
      attack: {
        player1: attackState(state, 'player1'),
        player2: attackState(state, 'player2'),
      },
      effect: {
        player1: state.fighters.player1.defense.effect,
        player2: state.fighters.player2.defense.effect,
      },
    };
  }

  observe(before: TickState, state: SimulationSnapshot) {
    PLAYERS.forEach((playerId) => {
      const opponentId = playerId === 'player1' ? 'player2' : 'player1';
      const fighter = state.fighters[playerId];
      const opponent = state.fighters[opponentId];
      const damage = Math.max(0, before.health[opponentId] - opponent.health);
      this.metrics[playerId].damage += damage;
      this.metrics[playerId].maxComboLength = Math.max(
        this.metrics[playerId].maxComboLength,
        state.combos[playerId].hits,
      );

      const currentAttack = attackState(state, playerId);
      const previousAttack = before.attack[playerId];
      if (isAttackStart(previousAttack, currentAttack)) {
        const definition = findCharacterAttack(fighter.characterId, currentAttack.id);
        if (definition?.category === 'special' || definition?.category === 'super') {
          this.metrics[playerId].specialMoves += 1;
        }
        if (
          definition?.action === 'MOMENTUM_REVERSAL' ||
          definition?.action === 'PERFECT_REVERSAL'
        ) this.metrics[playerId].momentumReversals += 1;
        if (/-((light|heavy)-)?[23]$/.test(currentAttack.id)) {
          this.metrics[playerId].autoCombos += 1;
        }
      }

      if (isNewContact(previousAttack, currentAttack)) {
        const perfect = opponent.defense.effect === 'perfect-block';
        if (perfect || opponent.mode === 'blockstun') {
          this.metrics[opponentId].blocks += 1;
        }
        if (perfect) this.metrics[opponentId].perfectBlocks += 1;
      }

      const effect = fighter.defense.effect;
      if (effect !== before.effect[playerId]) {
        if (effect === 'combo-escape') this.metrics[playerId].comboEscapes += 1;
        if (effect === 'combo-break') this.metrics[playerId].comboBreaks += 1;
        if (effect === 'perfect-reversal') {
          this.metrics[playerId].momentumReversals += 1;
        }
      }
    });
  }
}

function attackState(state: SimulationSnapshot, playerId: PlayerId) {
  const attack = state.fighters[playerId].attack;
  return attack
    ? { id: attack.id, frame: attack.frame, connected: attack.connected }
    : null;
}

function isAttackStart(
  before: TickState['attack']['player1'],
  after: TickState['attack']['player1'],
): after is NonNullable<TickState['attack']['player1']> {
  if (!after) return false;
  return !before || before.id !== after.id || after.frame < before.frame;
}

function isNewContact(
  before: TickState['attack']['player1'],
  after: TickState['attack']['player1'],
) {
  return Boolean(after?.connected && (!before?.connected || before.id !== after.id));
}

function emptyMetrics(): FighterMetrics {
  return {
    damage: 0,
    maxComboLength: 0,
    autoCombos: 0,
    blocks: 0,
    perfectBlocks: 0,
    comboEscapes: 0,
    comboBreaks: 0,
    momentumReversals: 0,
    specialMoves: 0,
  };
}
