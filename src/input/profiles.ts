/**
 * Per-character input profiles.
 *
 * Guarding and dashing are the two actions the roster reaches through dedicated
 * buttons — Shift and Ctrl under the default layout. Lucky may not: the brief
 * restricts every in-match action to W A S D and J K I L, and forbids a
 * separate block button and a separate dash button by name.
 *
 * Rather than move the whole roster onto directional guarding, which would
 * change how Mim, Glitch, Titan and Vorgh play, the reading of the held keys is
 * made a per-character choice. `DEFAULT_INPUT_PROFILE` is exactly the old
 * behaviour, so every other character is bit-for-bit unaffected.
 */

import type { Direction } from './bindings.js';
import { horizontalOf, isJumping } from './bindings.js';
import type { InputBuffer } from './buffer.js';
import { matchesMotion } from './motion.js';

export interface InputProfile {
  /** `button` reads the block key; `holdBack` reads the direction. */
  readonly guard: 'button' | 'holdBack';
  /** `button` reads the dash key; `doubleTap` reads a double direction tap. */
  readonly dash: 'button' | 'doubleTap';
  /** Frames a press stays eligible to start a move. */
  readonly leeway?: number;
  /** Simultaneous-press tolerance for chord tables. */
  readonly settleFrames?: number;
  /** Moves that must not also leave the ground when Up is part of the input. */
  readonly suppressJumpFor?: ReadonlySet<string>;
  /**
   * Whether holding the guard direction still walks.
   *
   * A character who blocks by holding Back must still be able to walk
   * backwards, or the brief's "A or Back = walk backward" and "hold Back =
   * standing block" would be mutually exclusive.
   */
  readonly guardWhileWalking?: boolean;
}

export const DEFAULT_INPUT_PROFILE: InputProfile = {
  guard: 'button',
  dash: 'button',
};

export const LUCKY_INPUT_PROFILE: InputProfile = {
  guard: 'holdBack',
  dash: 'doubleTap',
  guardWhileWalking: true,
};

/**
 * Edge-detected double-tap dashing.
 *
 * `matchesMotion` stays true for as long as the pattern is inside the buffer,
 * so reading it directly would restart the dash every frame. A dash is only
 * requested on the frame the second tap goes down, and a short lockout stops
 * one deliberate double tap from being read as two.
 */
export class DoubleTapDash {
  private previousHorizontal: -1 | 0 | 1 = 0;
  private lockoutFrames = 0;

  public read(buffer: InputBuffer, direction: Direction): -1 | 0 | 1 {
    const horizontal = horizontalOf(direction);
    const previous = this.previousHorizontal;
    this.previousHorizontal = horizontal;

    if (this.lockoutFrames > 0) {
      this.lockoutFrames -= 1;
      return 0;
    }
    if (horizontal === 0 || horizontal === previous || isJumping(direction)) {
      return 0;
    }
    const motion = horizontal === 1 ? 'ff' : 'bb';
    if (!matchesMotion(buffer, motion, 0)) {
      return 0;
    }
    this.lockoutFrames = DASH_LOCKOUT_FRAMES;
    return horizontal;
  }

  public reset(): void {
    this.previousHorizontal = 0;
    this.lockoutFrames = 0;
  }
}

/** Long enough that the tail of one double tap cannot start a second dash. */
const DASH_LOCKOUT_FRAMES = 12;

/**
 * Whether a directional guard is being requested this frame.
 *
 * Jumping is excluded: an up-back input is a retreating jump, not a standing
 * block, and treating it as a guard would silently cancel the jump.
 */
export function isDirectionalGuard(direction: Direction): boolean {
  return horizontalOf(direction) === -1 && !isJumping(direction);
}
