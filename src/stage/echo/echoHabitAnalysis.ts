import type {
  EchoHabit,
  EchoObservation,
} from './echoObservation.js';
import type { FighterSnapshot } from '../../sim/index.js';

const HABIT_WINDOW = 6;

export function trackMovementHabits(
  state: EchoObservation,
  opponent: FighterSnapshot | null,
): void {
  if (opponent === null) return;
  const dashing = opponent.dashFrames > 0;
  if (state.lastGrounded === true && !opponent.grounded) {
    state.jumpTimes.push(state.elapsed);
  }
  if (state.lastGuarding === false && opponent.guarding) {
    state.guardTimes.push(state.elapsed);
  }
  if (state.lastDashing === false && dashing) {
    state.dashTimes.push(state.elapsed);
  }
  state.lastGrounded = opponent.grounded;
  state.lastGuarding = opponent.guarding;
  state.lastDashing = dashing;
}

export function recordActionInterval(state: EchoObservation): void {
  if (state.lastActionAt !== null) {
    state.intervals.push(state.elapsed - state.lastActionAt);
    if (state.intervals.length > 4) state.intervals.shift();
  }
  state.lastActionAt = state.elapsed;
}

export function dominantHabit(
  state: EchoObservation,
): { readonly habit: EchoHabit; readonly strength: number } {
  trimOld(state.jumpTimes, state.elapsed);
  trimOld(state.guardTimes, state.elapsed);
  trimOld(state.dashTimes, state.elapsed);
  const signals: Readonly<Record<Exclude<EchoHabit, 'none'>, number>> = {
    repeat: state.repeatStrength,
    jump: eventStrength(state.jumpTimes.length),
    guard: eventStrength(state.guardTimes.length),
    dash: eventStrength(state.dashTimes.length),
    cadence: cadenceStrength(state.intervals),
  };
  let habit: EchoHabit = 'none';
  let strength = 0;
  for (const [name, value] of Object.entries(signals)) {
    if (value > strength) {
      habit = name as Exclude<EchoHabit, 'none'>;
      strength = value;
    }
  }
  return { habit, strength };
}

function eventStrength(count: number): number {
  return Math.max(0, Math.min(1, (count - 1) * 0.34));
}

function cadenceStrength(intervals: readonly number[]): number {
  if (intervals.length < 3) return 0;
  const mean = intervals.reduce((sum, value) => sum + value, 0) / intervals.length;
  const deviation = intervals.reduce(
    (sum, value) => sum + Math.abs(value - mean),
    0,
  ) / intervals.length;
  return Math.max(0, Math.min(1, 1 - deviation / Math.max(0.12, mean * 0.35)));
}

function trimOld(times: number[], now: number): void {
  while ((times[0] ?? now) < now - HABIT_WINDOW) times.shift();
}
