import { AttackSystem } from '../combat/AttackSystem';
import { BlockSystem } from '../combat/BlockSystem';
import { DamageSystem } from '../combat/DamageSystem';
import { balanceConfig } from '../config/balanceConfig';
import { CollisionSystem } from './CollisionSystem';
import { MatchManager } from './MatchManager';
import { MovementSystem } from './MovementSystem';
import { RoundManager } from './RoundManager';
import { createFighter, createInitialState } from './SimulationStateFactory';
import type {
  InputFrame,
  PlayerId,
  PlayerInputFrame,
  SimulationSnapshot,
} from './types';

const PLAYERS: readonly PlayerId[] = ['player1', 'player2'];

export class CombatSimulation {
  private state = createInitialState();
  private readonly attacks = new AttackSystem();
  private readonly blocks = new BlockSystem();
  private readonly damage = new DamageSystem();
  private readonly collisions = new CollisionSystem();
  private readonly movement = new MovementSystem();
  private readonly match = new MatchManager();
  private readonly round = new RoundManager();

  step(input: InputFrame, stepSeconds: number) {
    if (this.state.paused || this.state.roundPhase === 'MATCH_OVER') return;
    if (this.state.roundPhase === 'COUNTDOWN') {
      this.round.advanceCountdown(this.state);
      this.state.tick += 1;
      return;
    }
    if (this.state.roundPhase === 'ROUND_OVER') {
      if (this.round.advanceRoundOver(this.state)) this.startNextRound();
      this.state.tick += 1;
      return;
    }

    PLAYERS.forEach((id) =>
      this.movement.update(this.state.fighters[id], input[id], stepSeconds, this.state.tick),
    );
    this.updateFacing();
    this.blocks.update(this.state.fighters.player1, input.player1);
    this.blocks.update(this.state.fighters.player2, input.player2);
    this.resolveAttack('player1', 'player2', input.player1);
    this.resolveAttack('player2', 'player1', input.player2);
    this.collisions.separateFighters(this.state.fighters.player1, this.state.fighters.player2);
    this.round.tickClock(this.state);
    this.finishRoundIfNeeded();
    this.state.tick += 1;
  }

  setPaused(paused: boolean) {
    this.state.paused = paused;
  }

  rematch() {
    this.state = createInitialState();
  }

  getCountdownLabel() {
    return this.round.countdownLabel(this.state);
  }

  getSnapshot(): SimulationSnapshot {
    return {
      ...this.state,
      wins: { ...this.state.wins },
      fighters: {
        player1: { ...this.state.fighters.player1 },
        player2: { ...this.state.fighters.player2 },
      },
    };
  }

  restore(snapshot: SimulationSnapshot) {
    this.state = {
      ...snapshot,
      wins: { ...snapshot.wins },
      fighters: {
        player1: { ...snapshot.fighters.player1 },
        player2: { ...snapshot.fighters.player2 },
      },
    };
  }

  private resolveAttack(attackerId: PlayerId, defenderId: PlayerId, input: PlayerInputFrame) {
    const attacker = this.state.fighters[attackerId];
    const defender = this.state.fighters[defenderId];
    const hit = this.attacks.tryAttack(attacker, defender, input);
    if (hit) this.damage.apply(defender, this.blocks.reduce(hit, defender));
  }

  private finishRoundIfNeeded() {
    const timedOut = this.state.roundTicksRemaining === 0;
    const knockout =
      this.state.fighters.player1.health === 0 || this.state.fighters.player2.health === 0;
    if (!timedOut && !knockout) return;
    const winner = this.match.findRoundWinner(this.state);
    this.match.recordRound(this.state, winner, balanceConfig.roundsToWin);
    if (this.state.roundPhase === 'ROUND_OVER') this.round.beginRoundOver(this.state);
  }

  private startNextRound() {
    this.round.resetRound(this.state);
    this.state.fighters = {
      player1: createFighter('player1', 250),
      player2: createFighter('player2', 710),
    };
  }

  private updateFacing() {
    const first = this.state.fighters.player1;
    const second = this.state.fighters.player2;
    first.facing = first.x <= second.x ? 1 : -1;
    second.facing = first.facing === 1 ? -1 : 1;
  }
}
