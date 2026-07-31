import type { MoveFrameData } from '../../sim/frame-data.js';
import { LUCKY_LOW_PROFILE } from './character.js';
import { luckyMove } from './moveBuilder.js';

export const LUCKY_MOVE_IDS = {
  quickDraw: 'lucky.quick-draw',
  loadedShoulder: 'lucky.loaded-shoulder',
  slidingBet: 'lucky.sliding-bet',
  fortuneHeel: 'lucky.fortune-heel',
  crouchLight: 'lucky.crouch-light',
  crouchMedium: 'lucky.crouch-medium',
  crouchHeavy: 'lucky.crouch-heavy',
  airLight: 'lucky.air-light',
  airMedium: 'lucky.air-medium',
  airHeavy: 'lucky.air-heavy',
  sweep: 'lucky.sweep',
  throw: 'lucky.throw',
  airThrow: 'lucky.air-throw',
} as const;

const I = LUCKY_MOVE_IDS;

export const LUCKY_MOVES: readonly MoveFrameData[] = [
  luckyMove({ id: I.quickDraw, startup: 5, active: 3, recovery: 9, damage: 28, level: 'high', reach: 0.7, height: 1.55, cancels: [I.loadedShoulder] }),
  luckyMove({ id: I.loadedShoulder, startup: 10, active: 4, recovery: 14, damage: 56, level: 'mid', reach: 0.88, height: 1.18, cancels: [I.fortuneHeel] }),
  luckyMove({ id: I.slidingBet, startup: 12, active: 5, recovery: 16, damage: 48, level: 'low', reach: 1.12, height: 0.28, lowProfile: LUCKY_LOW_PROFILE }),
  luckyMove({ id: I.fortuneHeel, startup: 15, active: 5, recovery: 17, damage: 72, level: 'mid', reach: 0.78, height: 1.62, launch: true }),
  luckyMove({ id: I.crouchLight, startup: 6, active: 3, recovery: 10, damage: 24, level: 'low', reach: 0.62, height: 0.3, lowProfile: LUCKY_LOW_PROFILE }),
  luckyMove({ id: I.crouchMedium, startup: 9, active: 4, recovery: 15, damage: 42, level: 'low', reach: 0.82, height: 0.34, lowProfile: LUCKY_LOW_PROFILE }),
  luckyMove({ id: I.crouchHeavy, startup: 14, active: 5, recovery: 20, damage: 68, level: 'low', reach: 1.02, height: 0.38, lowProfile: LUCKY_LOW_PROFILE, launch: true }),
  luckyMove({ id: I.airLight, startup: 5, active: 4, recovery: 10, damage: 25, level: 'air', reach: 0.58, height: 1.1 }),
  luckyMove({ id: I.airMedium, startup: 8, active: 4, recovery: 14, damage: 44, level: 'air', reach: 0.76, height: 1 }),
  luckyMove({ id: I.airHeavy, startup: 12, active: 5, recovery: 19, damage: 70, level: 'air', reach: 0.94, height: 0.9 }),
  luckyMove({ id: I.sweep, startup: 13, active: 4, recovery: 19, damage: 55, level: 'low', reach: 1, height: 0.24, lowProfile: LUCKY_LOW_PROFILE }),
  luckyMove({ id: I.throw, startup: 7, active: 2, recovery: 22, damage: 75, level: 'mid', reach: 0.5, height: 1.05 }),
  luckyMove({ id: I.airThrow, startup: 8, active: 3, recovery: 23, damage: 72, level: 'air', reach: 0.48, height: 1.45 }),
];
