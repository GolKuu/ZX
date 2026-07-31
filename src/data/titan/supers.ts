import { titanMove } from './builder.js';
import { TITAN_MOVE_IDS as ID } from './ids.js';

export const TITAN_SUPER_MOVES = [
  titanMove({
    id: ID.continentalSlam, startup: 10, active: 5, recovery: 42,
    damage: 72, reach: 0.84, height: 1.24, level: 'grab',
    grapple: ['command', 54], onHitFollowUp: ID.continentalFinish,
    resourceCost: 100,
  }),
  titanMove({
    id: ID.continentalFinish, startup: 0, active: 12, recovery: 36,
    damage: 238, reach: 0.9, height: 1.02, level: 'grab',
    grapple: ['slam', 48], wallSplat: true,
  }),
  titanMove({
    id: ID.siegeEngine, startup: 12, active: 16, recovery: 34,
    damage: 172, reach: 1.26, height: 1.2, level: 'mid',
    armour: [0, 27, 4], guardDamage: 48, wallSplat: true,
    lunge: 0.72, resourceCost: 100,
  }),
  titanMove({
    id: ID.worldAnchor, startup: 14, active: 5, recovery: 58,
    damage: 90, reach: 0.88, height: 1.2, level: 'grab',
    grapple: ['command', 72], onHitFollowUp: ID.worldAnchorFinish,
  }),
  titanMove({
    id: ID.worldAnchorFinish, startup: 0, active: 18, recovery: 52,
    damage: 360, reach: 1.05, height: 0.92, level: 'grab',
    grapple: ['slam', 70], wallSplat: true,
  }),
] as const;
