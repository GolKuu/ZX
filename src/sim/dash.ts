/**
 * Ground dash.
 *
 * A dash is a fixed burst, not a speed toggle: once it starts it owns the
 * fighter's horizontal velocity for `DASH_FRAMES`, so the distance covered is
 * the same every time and a player can learn it. Steering mid-dash is
 * deliberately impossible.
 */

import type { FighterInput, MutableFighterState } from './state.js';

export const DASH_FRAMES = 8;

/** Multiplier on the walk speed, applied per direction. */
export const DASH_SPEED_MULTIPLIER = 3;

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
