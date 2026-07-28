import { balanceConfig, TICKS_PER_SECOND } from '../config/balanceConfig';
import type { SimulationSnapshot } from './types';

export class RoundManager {
  readonly initialRoundTicks = balanceConfig.roundSeconds * TICKS_PER_SECOND;

  advanceCountdown(state: SimulationSnapshot) {
    if (state.phaseTicksRemaining > 0) state.phaseTicksRemaining -= 1;
    if (state.phaseTicksRemaining === 0) state.roundPhase = 'ACTIVE';
  }

  tickClock(state: SimulationSnapshot) {
    if (state.roundTicksRemaining > 0) state.roundTicksRemaining -= 1;
  }

  beginRoundOver(state: SimulationSnapshot) {
    state.phaseTicksRemaining = balanceConfig.roundOverTicks;
  }

  advanceRoundOver(state: SimulationSnapshot) {
    if (state.phaseTicksRemaining > 0) state.phaseTicksRemaining -= 1;
    return state.phaseTicksRemaining === 0;
  }

  resetRound(state: SimulationSnapshot) {
    state.roundNumber += 1;
    state.roundPhase = 'COUNTDOWN';
    state.phaseTicksRemaining = balanceConfig.countdownTicks;
    state.roundTicksRemaining = this.initialRoundTicks;
    state.roundWinner = null;
  }

  countdownLabel(state: SimulationSnapshot) {
    if (state.roundPhase !== 'COUNTDOWN') return '';
    const remaining = state.phaseTicksRemaining;
    if (remaining > TICKS_PER_SECOND * 2 + 45) return '3';
    if (remaining > TICKS_PER_SECOND + 45) return '2';
    if (remaining > 45) return '1';
    return 'FIGHT';
  }
}
