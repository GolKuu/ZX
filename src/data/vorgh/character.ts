import type { FighterMovementData, FighterResourceData } from '../../sim/state.js';
import { fixed, type FixedBox } from '../../sim/math.js';
import { VORGH_NORMAL_IDS, VORGH_SPECIAL_IDS } from './ids.js';

export const VORGH_MAX_HEALTH = 1_050;
export const VORGH_MOVEMENT: FighterMovementData = {
  forwardPerFrame: 61,
  backwardPerFrame: 49,
  jumpPerFrame: 330,
};

export const VORGH_HURTBOXES: readonly FixedBox[] = [
  box(0.04, 2.13, 0.28, 0.3),
  box(-0.03, 1.38, 0.42, 0.5),
  box(-0.08, 0.48, 0.34, 0.48),
];

export const VORGH_RESOURCE: FighterResourceData = {
  maximum: 100,
  damageTakenPercent: 18,
  counterHitBonus: 4,
  perfectBlockGain: 4,
  painGuardChipPercent: 35,
  painGuardCost: 5,
  guardBreakLoss: 25,
  guardBreakLockFrames: 180,
  drainAtMaximumPerFrame: 1,
  overdriveDrainIntervalFrames: 6,
  pressureThreshold: 25,
  pushbackPercentAtPressure: 108,
  highRageThreshold: 75,
  damagePercentAtHighRage: 110,
  recoveryPercentAtHighRage: 115,
  tierCancelInto: [
    VORGH_SPECIAL_IDS.rageSlash,
    VORGH_SPECIAL_IDS.berserkDash,
    VORGH_SPECIAL_IDS.predatorLeap,
  ],
  tierCancelFrom: [
    VORGH_NORMAL_IDS.predatorRake,
    VORGH_NORMAL_IDS.skullRam,
    VORGH_NORMAL_IDS.crouchLight,
    VORGH_NORMAL_IDS.crouchMedium,
  ],
};

export const VORGH_STATS = {
  health: 105,
  damage: 100,
  speed: 90,
  pressure: 115,
  rage: 100,
  complexity: 7,
} as const;

function box(x: number, y: number, w: number, h: number): FixedBox {
  return {
    offset: { x: fixed(x), y: fixed(y) },
    halfSize: { x: fixed(w), y: fixed(h) },
  };
}
