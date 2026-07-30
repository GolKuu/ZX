import type { FighterSnapshot } from '../../sim/index.js';
import {
  dominantHabit,
  recordActionInterval,
  trackMovementHabits,
} from './echoHabitAnalysis.js';

const HISTORY_LIMIT = 6;

export type EchoHabit = 'repeat' | 'jump' | 'guard' | 'dash' | 'cadence' | 'none';

export interface EchoObservation {
  confidence: number;
  elapsed: number;
  readonly history: string[];
  readonly intervals: number[];
  readonly jumpTimes: number[];
  readonly guardTimes: number[];
  readonly dashTimes: number[];
  lastActionAt: number | null;
  lastDashing: boolean | null;
  lastGrounded: boolean | null;
  lastGuarding: boolean | null;
  lastSerial: number | null;
  lockPulse: number;
  repeatStrength: number;
  scanPulse: number;
}

export interface EchoReadout {
  readonly confidence: number;
  readonly habit: EchoHabit;
  readonly habitStrength: number;
  readonly lockPulse: number;
  readonly opponentAttacking: boolean;
  readonly scanPulse: number;
}

export function createEchoObservation(): EchoObservation {
  return {
    confidence: 0,
    dashTimes: [],
    elapsed: 0,
    guardTimes: [],
    history: [],
    intervals: [],
    jumpTimes: [],
    lastActionAt: null,
    lastDashing: null,
    lastGrounded: null,
    lastGuarding: null,
    lastSerial: null,
    lockPulse: 0,
    repeatStrength: 0,
    scanPulse: 0,
  };
}

export function observeOpponent(
  state: EchoObservation,
  opponent: FighterSnapshot | null,
  delta: number,
): EchoReadout {
  state.elapsed += Math.max(0, delta);
  trackMovementHabits(state, opponent);
  const action = opponent?.action ?? null;
  if (action !== null && action.serial !== state.lastSerial) {
    state.lastSerial = action.serial;
    recordActionInterval(state);
    state.history.push(action.moveId);
    if (state.history.length > HISTORY_LIMIT) state.history.shift();
    const appearances = state.history.filter(
      (moveId) => moveId === action.moveId,
    ).length;
    const streak = trailingStreak(state.history, action.moveId);
    state.repeatStrength = Math.min(
      1,
      (appearances - 1) * 0.28 + (streak - 1) * 0.24,
    );
    state.confidence = Math.max(state.confidence, state.repeatStrength);
    state.scanPulse = 1;
    if (appearances >= 2) state.lockPulse = 1;
  }

  const dominant = dominantHabit(state);
  state.confidence = Math.max(
    0,
    state.confidence - delta * 0.045,
    dominant.strength * 0.86,
  );
  state.scanPulse = Math.max(0, state.scanPulse - delta * 1.6);
  state.lockPulse = Math.max(0, state.lockPulse - delta * 0.82);

  return {
    confidence: state.confidence,
    habit: dominant.habit,
    habitStrength: dominant.strength,
    lockPulse: state.lockPulse,
    opponentAttacking: action !== null,
    scanPulse: state.scanPulse,
  };
}

function trailingStreak(history: readonly string[], moveId: string): number {
  let total = 0;
  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (history[index] !== moveId) break;
    total += 1;
  }
  return total;
}
