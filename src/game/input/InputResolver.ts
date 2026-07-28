import type { InputFrame, PlayerId, SimulationSnapshot } from '../core/types';
import { CommandRecognizer } from './CommandRecognizer';
import { ContextActionResolver } from './ContextActionResolver';

const PLAYERS: readonly PlayerId[] = ['player1', 'player2'];

export class InputResolver {
  private readonly recognizer = new CommandRecognizer();
  private readonly context = new ContextActionResolver();

  resolve(input: InputFrame, state: SimulationSnapshot): InputFrame {
    return {
      player1: this.resolvePlayer('player1', input, state),
      player2: this.resolvePlayer('player2', input, state),
    };
  }

  reset() {
    this.recognizer.reset();
  }

  private resolvePlayer(playerId: PlayerId, input: InputFrame, state: SimulationSnapshot) {
    const opponentId = PLAYERS.find((id) => id !== playerId)!;
    const fighter = state.fighters[playerId];
    const recognized = this.recognizer.recognize(
      playerId,
      state.tick,
      input[playerId],
      fighter.facing,
    );
    return this.context.resolve(recognized, {
      fighter,
      opponent: state.fighters[opponentId],
      incomingCombo: state.combos[opponentId],
    });
  }
}
