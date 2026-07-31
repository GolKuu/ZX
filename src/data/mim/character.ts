import type { FighterMovementData } from '../../sim/state.js';
import { fixed, type FixedBox } from '../../sim/math.js';
import { box, type BoxTuple } from './builder.js';

/**
 * MIM's body, split into the three volumes the brief asks for.
 *
 * Three boxes instead of one capsule is what makes a low profile mean
 * something: a move that removes the head box genuinely ducks under a jab
 * rather than merely looking like it does.
 */
export const MIM_HEAD_BOX: BoxTuple = [0.02, 2.16, 0.21, 0.27];
export const MIM_TORSO_BOX: BoxTuple = [0, 1.42, 0.29, 0.48];
export const MIM_LEG_BOX: BoxTuple = [0, 0.47, 0.25, 0.47];

export const MIM_HURTBOXES: readonly FixedBox[] = [
  box(MIM_HEAD_BOX),
  box(MIM_TORSO_BOX),
  box(MIM_LEG_BOX),
];

/** Head tucked, torso folded — used by the capoeira and butterfly frames. */
export const MIM_LOW_PROFILE: readonly BoxTuple[] = [
  [0.06, 0.82, 0.32, 0.34],
  [0, 0.34, 0.3, 0.34],
];

/** Airborne acrobatics: one compact volume, no separate leg box to clip on. */
export const MIM_AIRBORNE_PROFILE: readonly BoxTuple[] = [
  [0, 1.28, 0.3, 0.62],
];

/** Crouch block and the shield stance pull everything under the head line. */
export const MIM_CROUCH_PROFILE: readonly BoxTuple[] = [
  [0.02, 1.16, 0.26, 0.34],
  [0, 0.44, 0.27, 0.44],
];

/**
 * Speed 95 and defence 95 in the brief's terms. MIM walks a shade quicker than
 * the roster default and retreats almost as fast as she advances, which is what
 * a space-control character needs to keep the range she just bought.
 */
export const MIM_MOVEMENT: FighterMovementData = {
  forwardPerFrame: 71,
  backwardPerFrame: 62,
  jumpPerFrame: 352,
};

/** HP 95/100 against the roster's 1000-point bar. */
export const MIM_MAX_HEALTH = 950;

export const MIM_STATS = {
  health: 95,
  speed: 95,
  damage: 70,
  control: 100,
  defense: 95,
  complexity: 10,
} as const;

/**
 * Silhouette measurements the sprite pipeline and the hurtboxes both read, so a
 * drawing can never drift away from the volume it is judged by.
 */
export const MIM_PROPORTIONS = {
  /** Crown height in engine units — matches `SPRITE_TARGET_HEIGHT`. */
  totalHeight: 2.62,
  headHeight: 0.42,
  shoulderHeight: 2.02,
  hipHeight: 1.24,
  kneeHeight: 0.66,
  shoulderWidth: 0.44,
  hipWidth: 0.32,
  /** Braids and sash trail behind this far at rest. */
  trailLength: 0.78,
} as const;

export const MIM_FIXED_HEIGHT = fixed(MIM_PROPORTIONS.totalHeight);
