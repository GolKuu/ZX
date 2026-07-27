import type { PlayerId, SimulationSnapshot } from './types';

export class MatchManager {
  findWinner(state: SimulationSnapshot): PlayerId | null {
    const first = state.fighters.player1;
    const second = state.fighters.player2;
    if (first.health <= 0) return 'player2';
    if (second.health <= 0) return 'player1';

    if (state.roundTicksRemaining === 0 && first.health !== second.health) {
      return first.health > second.health ? 'player1' : 'player2';
    }

    return null;
  }
}
