import type { MoveFrameData } from '../../sim/frame-data.js';
import { LUCKY_MOVE_IDS as ID } from './ids.js';
import { luckyMove } from './moveBuilder.js';

/**
 * Aerial normals.
 *
 * The limb rule does not relax in the air: J and K stay hands, arms, elbows and
 * shoulders; I and L stay knees, shins, heels and feet.
 */
export const LUCKY_AERIAL_NORMALS: readonly MoveFrameData[] = [
  // J — air hand jab.
  luckyMove({
    id: ID.airJab,
    startup: 5, active: 4, recovery: 10, damage: 25,
    level: 'air', reach: 0.58, height: 1.1,
    cancels: [ID.airHammer, ID.airQuickKick],
  }),
  // K — downward arm strike, the aerial that beats a rising opponent.
  luckyMove({
    id: ID.airHammer,
    startup: 8, active: 4, recovery: 14, damage: 46,
    level: 'air', reach: 0.66, height: 0.72,
  }),
  // I — fast air kick.
  luckyMove({
    id: ID.airQuickKick,
    startup: 7, active: 4, recovery: 12, damage: 34,
    level: 'air', reach: 0.8, height: 0.9,
  }),
  // L — heavy heel, the air-to-ground conversion.
  luckyMove({
    id: ID.airHeavyHeel,
    startup: 11, active: 5, recovery: 18, damage: 70,
    level: 'air', reach: 0.94, height: 0.78, knockdown: true,
  }),

  // Forward + J — advancing air palm.
  luckyMove({
    id: ID.airPalm,
    startup: 6, active: 4, recovery: 12, damage: 30,
    level: 'air', reach: 0.78, height: 1.06, lunge: 0.22,
  }),
  // Forward + K — air shoulder.
  luckyMove({
    id: ID.airShoulder,
    startup: 10, active: 4, recovery: 16, damage: 52,
    level: 'air', reach: 0.86, height: 0.98, lunge: 0.3,
  }),
  // Down + I — downward leg kick.
  luckyMove({
    id: ID.airDownKick,
    startup: 9, active: 5, recovery: 15, damage: 42,
    level: 'air', reach: 0.5, height: 0.4,
  }),
  // Down + L — heavy descending heel.
  luckyMove({
    id: ID.airDescendingHeel,
    startup: 13, active: 6, recovery: 20, damage: 74,
    level: 'air', reach: 0.56, height: 0.28, knockdown: true,
  }),
];
