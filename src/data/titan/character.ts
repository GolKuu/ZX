import type { FighterMovementData } from '../../sim/state.js';
import { fixed, type FixedBox } from '../../sim/math.js';

function bodyBox(x: number, y: number, w: number, h: number): FixedBox {
  return {
    offset: { x: fixed(x), y: fixed(y) },
    halfSize: { x: fixed(w), y: fixed(h) },
  };
}

export const TITAN_HURTBOXES: readonly FixedBox[] = [
  bodyBox(0, 2.34, 0.32, 0.3),
  bodyBox(0, 1.48, 0.53, 0.58),
  bodyBox(0, 0.48, 0.4, 0.48),
];

export const TITAN_CROUCH_HURTBOXES: readonly FixedBox[] = [
  bodyBox(0.08, 1.14, 0.55, 0.46),
  bodyBox(0, 0.4, 0.44, 0.4),
];

export const TITAN_AIR_HURTBOXES: readonly FixedBox[] = [
  bodyBox(0, 1.4, 0.56, 0.82),
];

export const TITAN_MOVEMENT: FighterMovementData = {
  forwardPerFrame: 45,
  backwardPerFrame: 37,
  jumpPerFrame: 292,
};

export const TITAN_MAX_HEALTH = 1_200;

export const TITAN_STATS = {
  health: 120,
  damage: 120,
  defense: 110,
  speed: 60,
  grapple: 100,
  complexity: 6,
} as const;

export const TITAN_PROPORTIONS = {
  totalHeight: 2.78,
  shoulderWidth: 1.28,
  torsoWidth: 1.04,
  armLength: 1.14,
  bootLength: 0.72,
} as const;
