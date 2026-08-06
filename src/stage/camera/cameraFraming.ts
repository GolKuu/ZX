import { FIXED_SCALE } from '@/src/sim';
import { readCombatFighter } from '@/src/game/combatRuntime';

/**
 * Where the shot wants to be, given where the fighters are.
 *
 * Pure geometry, deliberately separated from the rig that smooths and shakes
 * it: framing is the part that has to be *correct*, and correctness is much
 * easier to reason about when it is not interleaved with impact kicks and
 * decay curves.
 */
export interface Framing {
  /** Horizontal centre of the pair. */
  readonly pan: number;
  /** Eye distance from the fighting plane. */
  readonly distance: number;
  /** Height the lens aims at — chest height, lifting as fighters go airborne. */
  readonly focus: number;
}

/** Framing: a ~3 m fighter should fill a little under half the frame height. */
const NEAR_DISTANCE = 8.6;
const FAR_DISTANCE = 15.2;
/** Metres of dolly per metre of separation. */
const DISTANCE_PER_GAP = 0.62;

/**
 * How far the camera may pan off centre.
 *
 * Has to cover a *cornered* pair: fighters reach the rim of a 7.2 m disc, and a
 * rig that runs out of pan before they do leaves both of them jammed against
 * one edge of the frame. Panning this far shows stage past the rim, which is
 * what the colonnade and the arcade are there for.
 */
const MAX_PAN = 5.4;

/** Chest height of a standing fighter. */
const BASE_FOCUS = 1.42;
/** How much of a fighter's airborne height the lens follows. */
const AIR_TRACKING = 0.42;

export const NEUTRAL_FRAMING: Framing = {
  pan: 0,
  distance: NEAR_DISTANCE,
  focus: BASE_FOCUS,
};

export function readFraming(previous: Framing): Framing {
  const one = readCombatFighter('p1');
  const two = readCombatFighter('p2');
  // Before the first sim tick both are null; hold the last framing rather than
  // collapsing to the origin.
  if (one === null || two === null) return previous;

  const left = one.position.x / FIXED_SCALE;
  const right = two.position.x / FIXED_SCALE;
  const gap = Math.abs(right - left);
  const height = Math.max(one.position.y, two.position.y) / FIXED_SCALE;

  return {
    pan: clamp((left + right) * 0.5, -MAX_PAN, MAX_PAN),
    distance: Math.min(FAR_DISTANCE, NEAR_DISTANCE + gap * DISTANCE_PER_GAP),
    // Tracking the full jump would swing the horizon down every hop. Following
    // a fraction of it keeps a launched fighter in frame while the room stays
    // put, which is how a fight is actually shot.
    focus: BASE_FOCUS + Math.max(0, height) * AIR_TRACKING,
  };
}

function clamp(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(high, value));
}

/** Frame-rate independent exponential smoothing. */
export function approach(
  current: number,
  target: number,
  rate: number,
  delta: number,
): number {
  return current + (target - current) * (1 - Math.exp(-rate * delta));
}
