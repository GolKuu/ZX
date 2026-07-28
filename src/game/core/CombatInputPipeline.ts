import { DefensiveActionSystem } from '../combat/DefensiveActionSystem';
import { InputResolver } from '../input/InputResolver';
import type { InputFrame, PlayerId, SimulationSnapshot } from './types';

const PLAYERS: readonly PlayerId[] = ['player1', 'player2'];

export class CombatInputPipeline {
  private readonly defensiveActions = new DefensiveActionSystem();
  private readonly resolver = new InputResolver();

  resolve(input: InputFrame, state: SimulationSnapshot) {
    const resolved = this.resolver.resolve(input, state);
    PLAYERS.forEach((playerId) => {
      const opponentId = playerId === 'player1' ? 'player2' : 'player1';
      const usedDefense = this.defensiveActions.apply(
        state.fighters[playerId],
        state.fighters[opponentId],
        resolved[playerId],
        state.combos[opponentId],
      );
      if (usedDefense) resolved[playerId] = { held: [], pressed: [], released: [] };
    });
    return resolved;
  }

  reset() {
    this.resolver.reset();
  }
}
