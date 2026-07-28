import { FIXED_STEP_SECONDS } from '../config/balanceConfig';
import { CombatSimulation } from '../core/CombatSimulation';
import type {
  InputFrame,
  PlayerId,
  PlayerInputFrame,
  SimulationSnapshot,
} from '../core/types';
import { cloneSnapshot } from '../core/cloneSnapshot';

type PendingInput = {
  sequence: number;
  frame: PlayerInputFrame;
};

const EMPTY_INPUT: PlayerInputFrame = { held: [], pressed: [], released: [] };

export class PredictionEngine {
  private simulation: CombatSimulation | null = null;
  private pending: PendingInput[] = [];
  private predicted: SimulationSnapshot | null = null;

  constructor(private readonly localPlayerId: PlayerId) {}

  predict(sequence: number, frame: PlayerInputFrame) {
    this.pending.push({ sequence, frame });
    if (!this.simulation) return;
    this.simulation.step(this.inputFrame(frame), FIXED_STEP_SECONDS);
    this.predicted = this.simulation.getSnapshot();
  }

  reconcile(
    authoritative: SimulationSnapshot,
    acknowledgedSequence: number,
  ) {
    this.pending = this.pending
      .filter((input) => input.sequence > acknowledgedSequence)
      .slice(-120);
    const characters = {
      player1: authoritative.fighters.player1.characterId,
      player2: authoritative.fighters.player2.characterId,
    };
    if (!this.simulation) this.simulation = new CombatSimulation(characters);
    this.simulation.restore(authoritative);
    this.pending.forEach(({ frame }) =>
      this.simulation!.step(this.inputFrame(frame), FIXED_STEP_SECONDS),
    );
    this.predicted = this.simulation.getSnapshot();
  }

  render(remote: SimulationSnapshot | null) {
    const output = this.predicted
      ? cloneSnapshot(this.predicted)
      : remote ? cloneSnapshot(remote) : null;
    if (!output || !remote) return output;
    const opponentId: PlayerId =
      this.localPlayerId === 'player1' ? 'player2' : 'player1';
    output.fighters[opponentId] = { ...remote.fighters[opponentId] };
    return output;
  }

  reset() {
    this.simulation = null;
    this.pending = [];
    this.predicted = null;
  }

  private inputFrame(local: PlayerInputFrame): InputFrame {
    return this.localPlayerId === 'player1'
      ? { player1: local, player2: EMPTY_INPUT }
      : { player1: EMPTY_INPUT, player2: local };
  }
}
