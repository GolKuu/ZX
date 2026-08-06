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

const NEAR_DISTANCE = 7;
const FAR_DISTANCE = 16.5;

/**
 * How far the camera may pan off centre.
 *
 * The stage now extends 40 m in every direction with an arcade and a colonnade
 * behind it, so panning this far never runs out of set — which is what the old
 * ±5.8 limit was protecting against, and why a cornered pair used to end up
 * jammed against the edge of the frame with one of them half cropped.
 */
const MAX_PAN = 7;

/** Chest height of a standing fighter. */
const BASE_FOCUS = 1.42;
/** How much of a fighter's airborne height the lens follows. */
const AIR_TRACKING = 0.42;

/** Clear space kept outside the pair, in metres, on each side. */
const SIDE_MARGIN = 1.45;
/** Half the height that must fit: a fighter plus headroom. */
const HALF_SUBJECT_HEIGHT = 2.05;

export const NEUTRAL_FRAMING: Framing = {
  pan: 0,
  distance: NEAR_DISTANCE,
  focus: BASE_FOCUS,
};

/**
 * @param verticalFov  Camera field of view, in degrees.
 * @param aspect       Viewport aspect ratio.
 */
export function readFraming(
  previous: Framing,
  verticalFov: number,
  aspect: number,
): Framing {
  const one = readCombatFighter('p1');
  const two = readCombatFighter('p2');
  // Before the first sim tick both are null; hold the last framing rather than
  // collapsing to the origin.
  if (one === null || two === null) return previous;

  const left = one.position.x / FIXED_SCALE;
  const right = two.position.x / FIXED_SCALE;
  const gap = Math.abs(right - left);
  const height = Math.max(one.position.y, two.position.y) / FIXED_SCALE;
  const midpoint = (left + right) * 0.5;
  const pan = clamp(midpoint, -MAX_PAN, MAX_PAN);

  // Solve the dolly instead of guessing it. The old rig used a fixed
  // metres-per-metre ratio, which is only ever right at one separation — at the
  // others it either cropped a fighter or left the pair swimming in dead frame.
  // Whatever the pan clamp could not cover has to be covered by the lens, so
  // the overflow is folded back in as extra width to fit.
  const overflow = Math.abs(midpoint - pan);
  const halfTangentY = Math.tan((verticalFov * Math.PI) / 360);
  const halfTangentX = halfTangentY * aspect;
  const neededWidth = gap * 0.5 + overflow + SIDE_MARGIN;

  return {
    pan,
    distance: clamp(
      Math.max(neededWidth / halfTangentX, HALF_SUBJECT_HEIGHT / halfTangentY),
      NEAR_DISTANCE,
      FAR_DISTANCE,
    ),
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
