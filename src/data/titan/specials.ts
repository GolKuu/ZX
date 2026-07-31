import { titanMove } from './builder.js';
import { TITAN_MOVE_IDS as ID } from './ids.js';

export const TITAN_SPECIAL_MOVES = [
  titanMove({
    id: ID.dualTechnique, startup: 14, active: 6, recovery: 23,
    damage: 98, reach: 1.02, height: 1.28, level: 'mid',
    guardDamage: 26, armour: [5, 13, 1],
  }),
  titanMove({
    id: ID.armourCharge, startup: 20, active: 8, recovery: 27,
    damage: 112, reach: 1.2, height: 1.2, level: 'mid',
    guardDamage: 42, armour: [3, 19, 2], wallSplat: true, lunge: 0.68,
  }),
  titanMove({
    id: ID.reactorBreaker, startup: 22, active: 5, recovery: 31,
    damage: 128, reach: 0.86, height: 1.44, level: 'mid',
    guardDamage: 100, guardBreak: true, armour: [8, 17, 1],
  }),
  titanMove({
    id: ID.enhancedSlam, startup: 7, active: 4, recovery: 23,
    damage: 142, reach: 0.74, height: 0.78, level: 'grab',
    grapple: ['slam', 38], resourceCost: 25, wallSplat: true,
  }),
  titanMove({
    id: ID.enhancedCharge, startup: 15, active: 9, recovery: 24,
    damage: 146, reach: 1.32, height: 1.2, level: 'mid',
    guardDamage: 54, armour: [2, 23, 3], resourceCost: 25,
    wallSplat: true, lunge: 0.84,
  }),
  titanMove({
    id: ID.enhancedGrab, startup: 8, active: 4, recovery: 27,
    damage: 154, reach: 0.82, height: 1.2, level: 'grab',
    grapple: ['command', 42], armour: [2, 7, 1], resourceCost: 25,
  }),
] as const;
