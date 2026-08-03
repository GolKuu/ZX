import type {
  FighterMovementData,
  FighterResourceData,
} from '../../sim/state.js';
import { fixed, type FixedBox } from '../../sim/math.js';

export const LUCKY_MAX_HEALTH = 900;

export const LUCKY_MOVEMENT: FighterMovementData = {
  forwardPerFrame: 78,
  backwardPerFrame: 68,
  jumpPerFrame: 370,
};

export const LUCKY_HURTBOXES: readonly FixedBox[] = [
  volume(0, 2.05, 0.22, 0.28),
  volume(0, 1.35, 0.29, 0.48),
  volume(0, 0.46, 0.25, 0.46),
];

export const LUCKY_LOW_PROFILE: readonly FixedBox[] = [
  volume(0.08, 0.68, 0.38, 0.3),
  volume(-0.14, 0.28, 0.32, 0.28),
];

/**
 * How Luck is earned.
 *
 * Every entry is one of the sources the brief names: counter hits, precise
 * punishes and a successful perfect block. `damageTakenPercent: 0` closes the
 * only source it forbids — a Lucky who is losing must not be paid for it.
 * `drainAtMaximumPerFrame` stops a parked Jackpot from being permanently safe.
 */
export const LUCKY_RESOURCE: FighterResourceData = {
  maximum: 100,
  initial: 0,
  damageTakenPercent: 0,
  counterHitBonus: 6,
  perfectBlockGain: 4,
  guardBreakLoss: 25,
  guardBreakLockFrames: 60,
  drainAtMaximumPerFrame: 1,
};

export const LUCKY_STATS = {
  health: 90,
  damage: 80,
  defense: 75,
  speed: 105,
  luck: 100,
  complexity: 7,
} as const;

function volume(
  x: number,
  y: number,
  halfWidth: number,
  halfHeight: number,
): FixedBox {
  return {
    offset: { x: fixed(x), y: fixed(y) },
    halfSize: { x: fixed(halfWidth), y: fixed(halfHeight) },
  };
}
