import {
  balanceConfig,
  FIXED_STEP_SECONDS,
} from '../../../src/game/config/balanceConfig.js';
import { CombatSimulation } from '../../../src/game/core/CombatSimulation.js';
import type {
  InputFrame,
  PlayerId,
  SimulationSnapshot,
} from '../../../src/game/core/types.js';
import type { PlayerInputTimeline } from './PlayerInputTimeline.js';

export class AuthoritativeMatch {
  private readonly simulation: CombatSimulation;

  constructor(private readonly characters: Record<PlayerId, string>) {
    this.simulation = new CombatSimulation(characters);
  }

  step(inputs: Record<PlayerId, PlayerInputTimeline>) {
    const frame: InputFrame = {
      player1: inputs.player1.frame(this.tick),
      player2: inputs.player2.frame(this.tick),
    };
    this.simulation.step(frame, FIXED_STEP_SECONDS);
    return this.snapshot;
  }

  setPaused(paused: boolean) {
    this.simulation.setPaused(paused);
  }

  rematch(inputs: Record<PlayerId, PlayerInputTimeline>) {
    inputs.player1.reset();
    inputs.player2.reset();
    this.simulation.rematch();
  }

  forfeit(winner: PlayerId) {
    const loser: PlayerId = winner === 'player1' ? 'player2' : 'player1';
    const state = this.simulation.getSnapshot();
    state.fighters[loser].health = 0;
    state.roundWinner = winner;
    state.matchWinner = winner;
    state.wins[winner] = balanceConfig.roundsToWin;
    state.roundPhase = 'MATCH_OVER';
    state.paused = false;
    this.simulation.restore(state);
  }

  get snapshot(): SimulationSnapshot {
    return this.simulation.getSnapshot();
  }

  get tick() {
    return this.snapshot.tick;
  }

  get selectedCharacters() {
    return { ...this.characters };
  }
}
