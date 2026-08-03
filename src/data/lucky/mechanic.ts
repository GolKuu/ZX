import type { MoveFrameData } from '../../sim/frame-data.js';
import { LUCKY_LUCK_IDS as LUCK, LUCKY_MOVE_IDS as ID } from './ids.js';
import { LUCKY_GUARD_TIMING } from './defense.js';
import { luckyMove } from './moveBuilder.js';

/**
 * The K+L family: Lucky's character mechanic, expressed as real actions.
 *
 * Every one of these is a move the engine runs, not a menu the game pauses for.
 * Preparing a modifier costs recovery frames, which is what stops "prepare the
 * good one, every time, for free" from being the answer to every situation.
 */
export const LUCKY_MECHANIC_MOVES: readonly MoveFrameData[] = [
  // K + L — commit the selected modifier.
  luckyMove({
    id: LUCK.prepare,
    startup: 4, active: 1, recovery: 14, damage: 0,
    level: 'mid', reach: 0, height: 0, noHitbox: true,
  }),
  // Forward + K + L — arm the offensive modifier.
  luckyMove({
    id: LUCK.prepareOffense,
    startup: 4, active: 1, recovery: 16, damage: 0,
    level: 'mid', reach: 0, height: 0, noHitbox: true,
  }),
  /**
   * Back + K + L — Lucky Guard.
   *
   * The brief lists this input twice, once as the defensive modifier and once
   * as Lucky Guard. They are one command: a successful guard *is* how the
   * defensive modifier is earned, so the reward has a price attached instead of
   * being a free preparation.
   *
   * The counter window is `strikeOnly`, so a throw beats it outright. The
   * window is deliberately shorter than the recovery: mashing it produces a
   * long vulnerable pose, which is the "failed Lucky Guard" penalty.
   */
  luckyMove({
    id: LUCK.guard,
    startup: 2, active: 1, recovery: 20, damage: 0,
    level: 'mid', reach: 0, height: 0, noHitbox: true,
    counter: {
      frames: { from: 1, toExclusive: 1 + LUCKY_GUARD_TIMING.perfectWindowFrames },
      into: LUCK.guardFailed,
      attackerHitstop: 14,
      strikeOnly: true,
    },
  }),
  /**
   * The reaction a successful Lucky Guard throws Lucky into.
   *
   * It has no hitbox: reading a strike correctly buys position and Luck, never
   * guaranteed damage. Named "failed" in the brief's vocabulary because it is
   * the branch the *attacker* failed into.
   */
  luckyMove({
    id: LUCK.guardFailed,
    startup: 1, active: 1, recovery: 12, damage: 0,
    level: 'mid', reach: 0, height: 0, noHitbox: true,
  }),
  // Down + K + L — drop the prepared modifier.
  luckyMove({
    id: LUCK.cancel,
    startup: 3, active: 1, recovery: 9, damage: 0,
    level: 'mid', reach: 0, height: 0, noHitbox: true,
  }),
  // Up + K + L — read the current probability state out loud.
  luckyMove({
    id: LUCK.inspect,
    startup: 3, active: 1, recovery: 11, damage: 0,
    level: 'mid', reach: 0, height: 0, noHitbox: true,
  }),
];

/**
 * Charge moves.
 *
 * Both are reachable with WASD alone: the charge is a held direction, not a
 * button. The 40-frame hold is long enough that ordinary backward walking or
 * crouch-blocking does not accidentally arm them, and the release direction is
 * one the player was going to press anyway.
 */
export const LUCKY_CHARGE_MOVES: readonly MoveFrameData[] = [
  // Hold Back 40f, then Forward + K — a shoulder, not a kick.
  luckyMove({
    id: ID.chargeShoulder,
    startup: 12, active: 5, recovery: 22, damage: 78,
    level: 'mid', reach: 1.06, height: 1.22, lunge: 0.5, wallBounce: true,
  }),
  // Hold Down 40f, then Up + L — a rising heel, anti-air, punishable.
  luckyMove({
    id: ID.chargeRisingHeel,
    startup: 9, active: 6, recovery: 28, damage: 74,
    level: 'mid', reach: 0.62, height: 1.66, launch: true,
    invulnerable: [3, 9],
  }),
];
