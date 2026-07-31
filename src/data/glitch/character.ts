import type {
  FighterMovementData,
  FighterResourceData,
} from '../../sim/state.js';
import { fixed, type FixedBox } from '../../sim/math.js';

function box(
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

export const GLITCH_HURTBOXES: readonly FixedBox[] = [
  box(0.02, 2.13, 0.2, 0.27),
  box(0, 1.4, 0.27, 0.46),
  box(0, 0.48, 0.23, 0.47),
];

export const GLITCH_STAND_PROFILE = [
  [0.02, 2.13, 0.2, 0.27],
  [0, 1.4, 0.27, 0.46],
  [0, 0.48, 0.23, 0.47],
] as const;

export const GLITCH_LOW_PROFILE = [
  [0.08, 0.78, 0.3, 0.31],
  [0, 0.31, 0.28, 0.3],
] as const;

export const GLITCH_AIR_PROFILE = [
  [0, 1.25, 0.27, 0.58],
] as const;

export const GLITCH_MOVEMENT: FighterMovementData = {
  forwardPerFrame: 82,
  backwardPerFrame: 73,
  jumpPerFrame: 372,
};

export const GLITCH_MAX_HEALTH = 850;

/** Enables the universal three-frame Perfect Block without adding a power bar. */
export const GLITCH_DEFENSE_RULES: FighterResourceData = {
  maximum: 0,
  initial: 0,
  damageTakenPercent: 0,
  perfectBlockGain: 0,
  painGuardCost: 1,
  guardBreakLoss: 0,
  guardBreakLockFrames: 0,
};

export const GLITCH_STATS = {
  health: 85,
  damage: 80,
  defense: 65,
  speed: 120,
  mobility: 100,
  complexity: 8,
} as const;

export const GLITCH_AIR_RULES = {
  gravityScalePercent: 92,
  juggleLimit: 6,
  hitstunDecayPerHit: 3,
  repeatedMoveDamagePercent: 72,
  maximumAirShifts: 1,
  maximumDoubleJumps: 1,
} as const;

export const GLITCH_DEFENSE_STATES = [
  'stand-block-start', 'stand-block-hold', 'stand-block-light-impact',
  'stand-block-heavy-impact', 'stand-block-release', 'crouch-block-start',
  'crouch-block-hold', 'crouch-block-light-impact',
  'crouch-block-heavy-impact', 'crouch-block-release', 'air-block',
  'cross-up-block-turn', 'chip-reaction', 'guard-crush', 'guard-break',
  'throw-escape', 'perfect-block', 'block-stun-recovery',
] as const;
