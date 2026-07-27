import { AttackSystem } from '../combat/AttackSystem';
import { BlockSystem } from '../combat/BlockSystem';
import { DamageSystem } from '../combat/DamageSystem';
import { balanceConfig, TICKS_PER_SECOND } from '../config/balanceConfig';
import { CollisionSystem } from './CollisionSystem';
import { FighterStateMachine } from './FighterStateMachine';
import { MatchManager } from './MatchManager';
import { RoundManager } from './RoundManager';
import type { FighterSnapshot, InputFrame, PlayerId, SimulationSnapshot } from './types';

const PLAYERS: readonly PlayerId[] = ['player1', 'player2'];

function createFighter(id: PlayerId, x: number): FighterSnapshot {
  return {
    id,
    x,
    y: balanceConfig.groundY,
    velocityX: 0,
    velocityY: 0,
    facing: id === 'player1' ? 1 : -1,
    health: balanceConfig.maxHealth,
    mode: 'idle',
    modeTicksRemaining: 0,
    attackCooldownTicks: 0,
    grounded: true,
  };
}

export class CombatSimulation {
  private state: SimulationSnapshot = {
    tick: 0,
    paused: false,
    winner: null,
    roundTicksRemaining: balanceConfig.roundSeconds * TICKS_PER_SECOND,
    fighters: {
      player1: createFighter('player1', 260),
      player2: createFighter('player2', 700),
    },
  };

  private readonly attacks = new AttackSystem();
  private readonly blocks = new BlockSystem();
  private readonly damage = new DamageSystem();
  private readonly collisions = new CollisionSystem();
  private readonly fighterStates = new FighterStateMachine();
  private readonly match = new MatchManager();
  private readonly round = new RoundManager();

  step(input: InputFrame, stepSeconds: number) {
    if (this.state.paused || this.state.winner) return;

    PLAYERS.forEach((id) => this.updateFighter(this.state.fighters[id], input[id], stepSeconds));
    this.updateFacing();
    this.blocks.update(this.state.fighters.player1, input.player1);
    this.blocks.update(this.state.fighters.player2, input.player2);
    this.resolveAttack('player1', 'player2', input.player1);
    this.resolveAttack('player2', 'player1', input.player2);
    this.collisions.separateFighters(this.state.fighters.player1, this.state.fighters.player2);

    this.round.tick(this.state);
    this.state.winner = this.match.findWinner(this.state);
    this.state.tick += 1;
  }

  setPaused(paused: boolean) {
    this.state.paused = paused;
  }

  getSnapshot(): SimulationSnapshot {
    return {
      ...this.state,
      fighters: {
        player1: { ...this.state.fighters.player1 },
        player2: { ...this.state.fighters.player2 },
      },
    };
  }

  restore(snapshot: SimulationSnapshot) {
    this.state = {
      ...snapshot,
      fighters: {
        player1: { ...snapshot.fighters.player1 },
        player2: { ...snapshot.fighters.player2 },
      },
    };
  }

  private updateFighter(fighter: FighterSnapshot, actions: InputFrame[PlayerId], step: number) {
    this.fighterStates.tick(fighter);
    fighter.attackCooldownTicks = Math.max(0, fighter.attackCooldownTicks - 1);

    const locked = fighter.mode === 'hitstun' || fighter.mode === 'knockout';
    const direction = Number(actions.includes('moveRight')) - Number(actions.includes('moveLeft'));
    fighter.velocityX = locked ? 0 : direction * balanceConfig.walkSpeed;

    if (!locked && actions.includes('jump') && fighter.grounded) {
      fighter.velocityY = -balanceConfig.jumpSpeed;
      fighter.grounded = false;
      fighter.mode = 'jumping';
    } else if (!locked && fighter.grounded && fighter.mode !== 'attacking') {
      fighter.mode = direction === 0 ? 'idle' : 'walking';
    }

    if (!fighter.grounded) fighter.velocityY += balanceConfig.gravity * step;
    fighter.x += fighter.velocityX * step;
    fighter.y += fighter.velocityY * step;
    this.collisions.resolveArena(fighter);
  }

  private resolveAttack(attackerId: PlayerId, defenderId: PlayerId, actions: InputFrame[PlayerId]) {
    const attacker = this.state.fighters[attackerId];
    const defender = this.state.fighters[defenderId];
    const hit = this.attacks.tryLightAttack(attacker, defender, actions);
    if (hit) this.damage.apply(defender, this.blocks.reduce(hit, defender));
  }

  private updateFacing() {
    const first = this.state.fighters.player1;
    const second = this.state.fighters.player2;
    first.facing = first.x <= second.x ? 1 : -1;
    second.facing = first.facing === 1 ? -1 : 1;
  }
}
