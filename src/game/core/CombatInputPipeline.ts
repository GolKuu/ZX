import { DefensiveActionSystem } from '../combat/DefensiveActionSystem';
import { InputResolver } from '../input/InputResolver';
import type { InputFrame, PlayerId, SimulationSnapshot } from './types';
import { CombatRhythmSystem } from '../combat/CombatRhythmSystem';

const PLAYERS: readonly PlayerId[] = ['player1', 'player2'];

export class CombatInputPipeline {
  private readonly defensiveActions = new DefensiveActionSystem();
  private readonly resolver = new InputResolver();
  private readonly rhythm = new CombatRhythmSystem();

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
      resolved[playerId] = this.rhythm.update(
        state.fighters[playerId],
        resolved[playerId],
        state.tick,
      );
    });
    return resolved;
  }

  reset() {
    this.resolver.reset();
  }
}
