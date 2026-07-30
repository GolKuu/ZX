import type { FighterSnapshot } from '@/src/sim';

const HISTORY_LIMIT = 6;
const CONFIDENCE_FALLOFF = 0.055;

export interface EchoObservation {
  confidence: number;
  lockPulse: number;
  scanPulse: number;
  readonly history: string[];
  lastSerial: number | null;
}

export interface EchoReadout {
  readonly confidence: number;
  readonly lockPulse: number;
  readonly opponentAttacking: boolean;
  readonly scanPulse: number;
}

export function createEchoObservation(): EchoObservation {
  return {
    confidence: 0,
    history: [],
    lastSerial: null,
    lockPulse: 0,
    scanPulse: 0,
  };
}

export function observeOpponent(
  state: EchoObservation,
  opponent: FighterSnapshot | null,
  delta: number,
): EchoReadout {
  const action = opponent?.action ?? null;
  if (action !== null && action.serial !== state.lastSerial) {
    state.lastSerial = action.serial;
    state.history.push(action.moveId);
    if (state.history.length > HISTORY_LIMIT) state.history.shift();

    const appearances = state.history.filter(
      (moveId) => moveId === action.moveId,
    ).length;
    const streak = trailingStreak(state.history, action.moveId);
    const learned = Math.min(1, (appearances - 1) * 0.28 + (streak - 1) * 0.24);
    state.confidence = Math.max(state.confidence, learned);
    state.scanPulse = 1;
    if (appearances >= 2) state.lockPulse = 1;
  }

  state.scanPulse = Math.max(0, state.scanPulse - delta * 1.6);
  state.lockPulse = Math.max(0, state.lockPulse - delta * 0.82);
  if (action === null) {
    state.confidence = Math.max(
      0,
      state.confidence - delta * CONFIDENCE_FALLOFF,
    );
  }

  return {
    confidence: state.confidence,
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
