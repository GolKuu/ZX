import type { MoveFrameData } from '../../sim/frame-data.js';
import { LUCKY_MOVE_IDS as ID } from './ids.js';
import { luckyMove } from './moveBuilder.js';

/**
 * Throws and the two Dual Techniques.
 *
 * Throws are grapples, so the builder drops their block data — an unblockable
 * strike and a real throw behave differently against armour and against a
 * guarding opponent, and only the second one is honest here.
 */
export const LUCKY_THROWS: readonly MoveFrameData[] = [
  // J + I — the neutral throw.
  luckyMove({
    id: ID.throw,
    startup: 7, active: 2, recovery: 22, damage: 75,
    level: 'throw', reach: 0.5, height: 1.05,
    grapple: ['normal', 24, 'grounded'],
  }),
  // Forward + J + I — same grab, opponent lands in front.
  luckyMove({
    id: ID.forwardThrow,
    startup: 7, active: 2, recovery: 22, damage: 78,
    level: 'throw', reach: 0.5, height: 1.05,
    grapple: ['carry', 26, 'grounded'],
  }),
  // Back + J + I — side switch. The reason a cornered Lucky is not trapped.
  luckyMove({
    id: ID.backThrow,
    startup: 7, active: 2, recovery: 24, damage: 72,
    level: 'throw', reach: 0.5, height: 1.05,
    grapple: ['reposition', 26, 'grounded'],
  }),
  // J + I in the air.
  luckyMove({
    id: ID.airThrow,
    startup: 8, active: 3, recovery: 23, damage: 72,
    level: 'throw', reach: 0.48, height: 1.45,
    grapple: ['air', 24, 'airborne'],
  }),
];

export const LUCKY_DUAL_TECHNIQUES: readonly MoveFrameData[] = [
  /**
   * J + K — Loaded Hands. Two upper-body strikes: palm, then elbow.
   *
   * Punishable when the whole thing is blocked, which is the price of the
   * pressure it buys. The first hit does not launch, so it cannot be looped.
   */
  luckyMove({
    id: ID.loadedHands,
    startup: 9, active: 8, recovery: 22, damage: 62,
    level: 'mid', reach: 0.9, height: 1.32, lunge: 0.26, hits: 2,
    resourceGainOnHit: 6,
  }),
  /**
   * I + L — Fortune Legs. A low shin kick into a launching heel.
   *
   * The launch lives on the second hit only, and the recovery is longer than
   * the launch's hitstun, so the technique cannot chain into itself.
   */
  luckyMove({
    id: ID.fortuneLegs,
    startup: 11, active: 9, recovery: 26, damage: 70,
    level: 'low', reach: 1.0, height: 0.5, hits: 2, launch: true,
    resourceGainOnHit: 6,
  }),
];
