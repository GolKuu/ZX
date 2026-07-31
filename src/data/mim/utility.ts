import type { MoveFrameData } from '../../sim/frame-data.js';
import { buildMoves, type MimMoveRow } from './builder.js';
import { MIM_AIRBORNE_PROFILE, MIM_LOW_PROFILE } from './character.js';
import { MIM_DUAL_IDS, MIM_UTILITY_IDS, MIM_WALL_IDS } from './ids.js';

/**
 * The three actions the kit needs to be a complete fighting-game character
 * rather than a set of specials: something that beats a block, something that
 * beats a jump, and something that beats a stand-block low.
 */
const rows: readonly MimMoveRow[] = [
  {
    // Throw. Wall-piercing by rule: a plane never saves you from a grab, and a
    // grab never breaks a plane.
    id: MIM_UTILITY_IDS.throwStart,
    startup: 6,
    active: 3,
    recovery: 22,
    wallPiercing: true,
    hits: [{
      hitId: 'grab',
      from: 6,
      to: 9,
      box: [0.5, 1.3, 0.32, 0.5],
      damage: 76,
      hitstop: [12, 16],
      hitstun: 44,
      knockback: [0.19, 0.22],
      groundBounce: {
        count: 1,
        verticalSpeed: 92,
        horizontalScale: { numerator: 1, denominator: 3 },
        minimumHitstun: 24,
      },
    }],
  },
  {
    // Anti-air. Invulnerable above the waist while the arm rises.
    id: MIM_UTILITY_IDS.antiAir,
    startup: 7,
    active: 5,
    recovery: 24,
    hits: [{
      hitId: 'antiAir',
      from: 7,
      to: 12,
      box: [0.42, 2.02, 0.34, 0.5],
      damage: 66,
      hitstop: [9, 13],
      hitstun: 30,
      blockstun: 14,
      knockback: [0.09, 0.3],
      blockKnockback: [0.16, 0],
    }],
    hurtboxes: [
      { from: 4, to: 12, boxes: MIM_AIRBORNE_PROFILE },
      // Landing recovery is fully exposed — this is the punish window.
      { from: 12, to: 36, boxes: MIM_LOW_PROFILE },
    ],
    cancels: [{
      from: 7,
      to: 15,
      into: [MIM_WALL_IDS.wallRun, MIM_DUAL_IDS.butterflyKick],
    }],
  },
  {
    // Sweep. Knocks down, cannot be cancelled, and is minus on block.
    id: MIM_UTILITY_IDS.sweep,
    startup: 11,
    active: 4,
    recovery: 21,
    hits: [{
      hitId: 'sweep',
      from: 11,
      to: 15,
      box: [0.92, 0.24, 0.5, 0.2],
      damage: 58,
      hitstop: [9, 13],
      hitstun: 34,
      blockstun: 14,
      knockback: [0.16, 0.16],
      blockKnockback: [0.13, 0],
      groundBounce: {
        count: 1,
        verticalSpeed: 74,
        horizontalScale: { numerator: 1, denominator: 4 },
        minimumHitstun: 26,
      },
    }],
    hurtboxes: [{ from: 8, to: 20, boxes: MIM_LOW_PROFILE }],
  },
];

export const MIM_UTILITY_MOVES: readonly MoveFrameData[] = buildMoves(rows);
