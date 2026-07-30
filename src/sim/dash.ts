/**
 * Ground dash.
 *
 * A dash is a fixed burst, not a speed toggle: once it starts it owns the
 * fighter's horizontal velocity for `DASH_FRAMES`, so the distance covered is
 * the same every time and a player can learn it. Steering mid-dash is
 * deliberately impossible.
 */

import { scaleInteger } from './math.js';
import type { FighterInput, MutableFighterState } from './state.js';

export const DASH_FRAMES = 8;

/** Multiplier on the walk speed, applied per direction. */
export const DASH_SPEED_MULTIPLIER = 3;

/**
 * A move started out of a dash keeps part of the dash's speed — the dash attack.
 *
 * Without it the engine stopped a dashing fighter dead the instant an attack
 * came out, which makes the dash a repositioning tool and nothing else. Half the
 * speed, bleeding off over six frames, turns it into an approach.
 */
export const LUNGE_FRAMES = 6;
const DASH_CANCEL_KEEP = { numerator: 1, denominator: 2 };
const LUNGE_FRICTION = { numerator: 5, denominator: 8 };

/** A dash press is only accepted from a fighter that is not already dashing. */
export function requestDash(
  fighter: MutableFighterState,
  input: FighterInput | undefined,
): void {
  const requested = input?.dash ?? 0;
  if (requested === 0 || fighter.dashFrames > 0) {
    return;
  }
  fighter.dashFrames = DASH_FRAMES;
  fighter.dashDirection = requested;
}

/**
 * Drive one dash frame. Returns `true` when the dash set the velocity, which
 * tells the caller to leave walking and its own velocity alone.
 */
export function advanceDash(fighter: MutableFighterState): boolean {
  if (fighter.dashFrames === 0) {
    return false;
  }
  const direction = fighter.dashDirection;
  const speed = direction > 0
    ? fighter.movement.forwardPerFrame
    : fighter.movement.backwardPerFrame;
  fighter.velocity.x = direction * fighter.facing * speed * DASH_SPEED_MULTIPLIER;
  fighter.dashFrames -= 1;
  if (fighter.dashFrames === 0) {
    fighter.dashDirection = 0;
  }
  return true;
}

/** Hitstun, an attack, a jump and leaving the ground all end a dash. */
export function endDash(fighter: MutableFighterState): void {
  fighter.dashFrames = 0;
  fighter.dashDirection = 0;
}

/**
 * Called as a move starts. Out of a dash it opens a lunge; from anywhere else it
 * closes one, so a stale lunge cannot leak into the next attack.
 */
export function startLunge(fighter: MutableFighterState): void {
  if (fighter.dashFrames === 0) {
    fighter.lungeFrames = 0;
    return;
  }
  fighter.lungeFrames = LUNGE_FRAMES;
  fighter.velocity.x = scaleInteger(fighter.velocity.x, DASH_CANCEL_KEEP);
}

/**
 * Horizontal velocity for one frame of an active move: a lunge slides and bleeds
 * off, everything else stops dead the way it always has.
 */
export function advanceLunge(fighter: MutableFighterState): number {
  if (fighter.lungeFrames === 0) {
    return 0;
  }
  fighter.lungeFrames -= 1;
  return scaleInteger(fighter.velocity.x, LUNGE_FRICTION);
}

export function endLunge(fighter: MutableFighterState): void {
  fighter.lungeFrames = 0;
}

/**
 * How far through a dash the fighter is, 0…1, for animation.
 *
 * `dashFrames` counts down, and the first rendered frame already had one frame
 * consumed, so the phase spans the inside of the window rather than hitting 0
 * and 1 exactly — which is right: a dash is never seen standing still.
 */
export function dashPhase(dashFrames: number): number {
  if (dashFrames <= 0) return 0;
  return 1 - Math.min(DASH_FRAMES, dashFrames) / DASH_FRAMES;
}
