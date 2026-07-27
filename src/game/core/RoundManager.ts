import { balanceConfig, TICKS_PER_SECOND } from '../config/balanceConfig';
import type { SimulationSnapshot } from './types';

export class RoundManager {
  readonly initialTicks = balanceConfig.roundSeconds * TICKS_PER_SECOND;

  tick(state: SimulationSnapshot) {
    if (state.roundTicksRemaining > 0) state.roundTicksRemaining -= 1;
  }

  reset(state: SimulationSnapshot) {
    state.roundTicksRemaining = this.initialTicks;
  }
}
