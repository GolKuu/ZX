import { AttackSystem, type AttackContact } from '../combat/AttackSystem';
import { BlockSystem } from '../combat/BlockSystem';
import { ComboSystem } from '../combat/ComboSystem';
import { DamageSystem } from '../combat/DamageSystem';
import { balanceConfig } from '../config/balanceConfig';
import { cloneSnapshot } from './cloneSnapshot';
import { CollisionSystem } from './CollisionSystem';
import { FighterStateMachine } from './FighterStateMachine';
import { MatchManager } from './MatchManager';
import { MovementSystem } from './MovementSystem';
import { RoundManager } from './RoundManager';
import { CombatInputPipeline } from './CombatInputPipeline';
import { createFighter, createInitialState } from './SimulationStateFactory';
import type {
  InputFrame,
  PlayerId,
  PlayerInputFrame,
  SimulationSnapshot,
} from './types';

const PLAYERS: readonly PlayerId[] = ['player1', 'player2'];
const DEFAULT_CHARACTERS = { player1: 'comet', player2: 'pulse' };
export class CombatSimulation {
  private state: SimulationSnapshot;
  private readonly attacks: AttackSystem;
  private readonly blocks = new BlockSystem();
  private readonly combos = new ComboSystem();
  private readonly damage = new DamageSystem();
  private readonly collisions = new CollisionSystem();
  private readonly movement = new MovementSystem();
  private readonly states = new FighterStateMachine();
  private readonly match = new MatchManager();
  private readonly round = new RoundManager();
  private readonly inputs = new CombatInputPipeline();

  constructor(private readonly characters: Record<PlayerId, string> = DEFAULT_CHARACTERS) {
    this.state = createInitialState(characters);
    this.attacks = new AttackSystem();
  }
  step(input: InputFrame, stepSeconds: number) {
    if (this.state.paused || this.state.roundPhase === 'MATCH_OVER') return;
    if (this.advanceNonActiveRound()) return;

    const resolvedInput = this.inputs.resolve(input, this.state);
    PLAYERS.forEach((id) => this.states.tick(this.state.fighters[id]));
    PLAYERS.forEach((id) => this.combos.tick(this.state.combos[id]));
    this.updateFacing();
    PLAYERS.forEach((id) => this.attacks.prepare(this.state.fighters[id], resolvedInput[id]));
    PLAYERS.forEach((id) =>
      this.movement.update(this.state.fighters[id], resolvedInput[id], stepSeconds, this.state.tick),
    );
    PLAYERS.forEach((id) => this.blocks.update(this.state.fighters[id], resolvedInput[id]));

    const firstHit = this.attacks.findContact(
      this.state.fighters.player1,
      this.state.fighters.player2,
    );
    const secondHit = this.attacks.findContact(
      this.state.fighters.player2,
      this.state.fighters.player1,
    );
    if (firstHit) this.resolveContact('player1', 'player2', firstHit, resolvedInput.player2);
    if (secondHit) this.resolveContact('player2', 'player1', secondHit, resolvedInput.player1);

    PLAYERS.forEach((id) => this.attacks.finishTick(this.state.fighters[id]));
    this.collisions.separateFighters(this.state.fighters.player1, this.state.fighters.player2);
    this.updateFacing();
    this.round.tickClock(this.state);
    this.finishRoundIfNeeded();
    this.state.tick += 1;
  }

  setPaused(paused: boolean) {
    this.state.paused = paused;
  }

  rematch() {
    this.state = createInitialState(this.characters);
    this.inputs.reset();
  }

  getCountdownLabel() {
    return this.round.countdownLabel(this.state);
  }

  getSnapshot() {
    return cloneSnapshot(this.state);
  }

  restore(snapshot: SimulationSnapshot) {
    this.state = cloneSnapshot(snapshot);
    this.inputs.reset();
  }

  private advanceNonActiveRound() {
    if (this.state.roundPhase === 'COUNTDOWN') {
      this.round.advanceCountdown(this.state);
    } else if (this.state.roundPhase === 'ROUND_OVER') {
      if (this.round.advanceRoundOver(this.state)) this.startNextRound();
    } else {
      return false;
    }
    this.state.tick += 1;
    return true;
  }

  private resolveContact(
    attackerId: PlayerId,
    defenderId: PlayerId,
    contact: AttackContact,
    defenderInput: PlayerInputFrame,
  ) {
    const attacker = this.state.fighters[attackerId];
    const defender = this.state.fighters[defenderId];
    const block = this.blocks.tryBlock(defender, defenderInput, contact.definition);
    this.damage.apply(
      attacker,
      defender,
      contact.definition,
      this.state.combos[attackerId],
      block,
    );
  }

  private finishRoundIfNeeded() {
    const timedOut = this.state.roundTicksRemaining === 0;
    const knockout = PLAYERS.some((id) => this.state.fighters[id].health === 0);
    if (!timedOut && !knockout) return;
    const winner = this.match.findRoundWinner(this.state);
    this.match.recordRound(this.state, winner, balanceConfig.roundsToWin);
    if (this.state.roundPhase === 'ROUND_OVER') this.round.beginRoundOver(this.state);
  }

  private startNextRound() {
    this.round.resetRound(this.state);
    this.state.fighters = {
      player1: createFighter('player1', 250, this.characters.player1),
      player2: createFighter('player2', 710, this.characters.player2),
    };
    PLAYERS.forEach((id) => this.combos.reset(this.state.combos[id]));
    this.inputs.reset();
  }

  private updateFacing() {
    const first = this.state.fighters.player1;
    const second = this.state.fighters.player2;
    first.facing = first.x <= second.x ? 1 : -1;
    second.facing = first.facing === 1 ? -1 : 1;
  }
}
