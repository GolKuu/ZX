import { TITAN_AIR_HURTBOXES, TITAN_CROUCH_HURTBOXES } from './character.js';
import { titanMove } from './builder.js';
import { TITAN_MOVE_IDS as ID } from './ids.js';

export const TITAN_NORMAL_MOVES = [
  titanMove({
    id: ID.pistonHammer, startup: 7, active: 4, recovery: 12,
    damage: 48, reach: 0.78, height: 1.42, level: 'mid',
    cancels: [ID.bulkheadBackfist, ID.commandGrab],
  }),
  titanMove({
    id: ID.bulkheadBackfist, startup: 12, active: 5, recovery: 16,
    damage: 72, reach: 1.03, height: 1.58, level: 'mid', guardDamage: 18,
    cancels: [ID.siegeRam, ID.groundSlam],
  }),
  titanMove({
    id: ID.seismicStomp, startup: 15, active: 5, recovery: 17,
    damage: 76, reach: 0.92, height: 0.22, level: 'low', guardDamage: 22,
  }),
  titanMove({
    id: ID.siegeRam, startup: 18, active: 6, recovery: 20,
    damage: 96, reach: 1.18, height: 1.22, level: 'mid',
    guardDamage: 36, wallSplat: true, armour: [6, 17, 1], lunge: 0.48,
  }),
  titanMove({
    id: ID.crouchLight, startup: 6, active: 3, recovery: 13,
    damage: 42, reach: 0.7, height: 0.36, level: 'low',
    hurtboxes: TITAN_CROUCH_HURTBOXES, cancels: [ID.crouchMedium],
  }),
  titanMove({
    id: ID.crouchMedium, startup: 10, active: 4, recovery: 17,
    damage: 62, reach: 0.9, height: 0.54, level: 'mid',
    hurtboxes: TITAN_CROUCH_HURTBOXES, cancels: [ID.crouchHeavy],
  }),
  titanMove({
    id: ID.crouchHeavy, startup: 16, active: 5, recovery: 23,
    damage: 88, reach: 1.02, height: 0.66, level: 'mid',
    hurtboxes: TITAN_CROUCH_HURTBOXES, launch: true,
  }),
  titanMove({
    id: ID.airLight, startup: 7, active: 4, recovery: 11,
    damage: 44, reach: 0.7, height: 1.38, level: 'air',
    hurtboxes: TITAN_AIR_HURTBOXES,
  }),
  titanMove({
    id: ID.airMedium, startup: 11, active: 5, recovery: 16,
    damage: 66, reach: 0.91, height: 1.2, level: 'air',
    hurtboxes: TITAN_AIR_HURTBOXES,
  }),
  titanMove({
    id: ID.airHeavy, startup: 17, active: 6, recovery: 24,
    damage: 92, reach: 0.92, height: 0.82, level: 'air',
    hurtboxes: TITAN_AIR_HURTBOXES, launch: true,
  }),
  titanMove({
    id: ID.launcher, startup: 14, active: 5, recovery: 22,
    damage: 82, reach: 0.8, height: 1.7, level: 'mid', launch: true,
  }),
  titanMove({
    id: ID.sweep, startup: 13, active: 5, recovery: 22,
    damage: 74, reach: 1.08, height: 0.2, level: 'low',
    hurtboxes: TITAN_CROUCH_HURTBOXES,
  }),
  titanMove({
    id: ID.antiAir, startup: 10, active: 6, recovery: 20,
    damage: 78, reach: 0.64, height: 2.05, level: 'high', launch: true,
  }),
] as const;
