import type { MoveFrameData } from '../../sim/frame-data.js';
import { buildMoves, type MimMoveRow } from './builder.js';
import { MIM_AIRBORNE_PROFILE, MIM_LOW_PROFILE } from './character.js';
import { MIM_DUAL_IDS, MIM_NORMAL_IDS, MIM_WALL_IDS } from './ids.js';

/**
 * Two-button techniques. Each one exists to open a route the single buttons
 * cannot: a side switch, a launcher, a rotation, and a full horizontal spin.
 */
const rows: readonly MimMoveRow[] = [
  {
    // J+K — Mirror Strike. Feint with one hand, land with the other.
    id: MIM_DUAL_IDS.mirrorStrike,
    startup: 7,
    active: 6,
    recovery: 13,
    hits: [
      {
        hitId: 'feint',
        from: 7,
        to: 9,
        box: [0.62, 1.66, 0.26, 0.18],
        damage: 22,
        hitstop: [4, 6],
        hitstun: 13,
        blockstun: 9,
        knockback: [0.04, 0],
      },
      {
        hitId: 'mirror',
        from: 11,
        to: 13,
        box: [0.78, 1.44, 0.32, 0.24],
        damage: 32,
        hitstop: [7, 10],
        hitstun: 20,
        blockstun: 13,
        knockback: [0.15, 0.03],
      },
    ],
    cancels: [{
      from: 11,
      to: 20,
      into: [
        MIM_NORMAL_IDS.capoeiraKick,
        MIM_DUAL_IDS.vaultKnee,
        MIM_WALL_IDS.invisibleWall,
      ],
    }],
  },
  {
    // J+I — 540 Kick. Two rising rotations feed the final airborne heel.
    id: MIM_DUAL_IDS.vaultKnee,
    startup: 11,
    active: 10,
    recovery: 19,
    hits: [
      {
        hitId: 'rising-arc',
        from: 11,
        to: 14,
        box: [0.5, 1.18, 0.34, 0.38],
        damage: 24,
        hitstop: [4, 6],
        hitstun: 17,
        blockstun: 10,
        knockback: [0.04, 0.12],
        blockKnockback: [0.1, 0],
      },
      {
        hitId: 'spinning-arc',
        from: 15,
        to: 18,
        box: [0.66, 1.56, 0.46, 0.42],
        damage: 28,
        hitstop: [5, 8],
        hitstun: 20,
        blockstun: 11,
        knockback: [0.08, 0.18],
        blockKnockback: [0.12, 0],
      },
      {
        hitId: 'five-forty-heel',
        from: 19,
        to: 21,
        box: [0.9, 1.34, 0.58, 0.48],
        damage: 58,
        hitstop: [13, 17],
        hitstun: 32,
        blockstun: 17,
        knockback: [0.28, 0.24],
        blockKnockback: [0.2, 0],
        groundBounce: {
          count: 1,
          verticalSpeed: 116,
          horizontalScale: { numerator: 2, denominator: 3 },
          minimumHitstun: 20,
        },
      },
    ],
    hurtboxes: [{ from: 10, to: 25, boxes: MIM_AIRBORNE_PROFILE }],
    cancels: [{
      from: 19,
      to: 27,
      into: [MIM_DUAL_IDS.butterflyKick, MIM_WALL_IDS.wallRun],
    }],
  },
  {
    // K+L — Acrobat Kick. Weight goes through the shoulder, leg comes over.
    id: MIM_DUAL_IDS.acrobatKick,
    startup: 13,
    active: 5,
    recovery: 17,
    hits: [{
      hitId: 'acrobat',
      from: 13,
      to: 18,
      box: [0.88, 1.06, 0.46, 0.56],
      damage: 78,
      hitstop: [10, 14],
      hitstun: 26,
      blockstun: 16,
      knockback: [0.22, 0.11],
      blockKnockback: [0.17, 0],
    }],
    hurtboxes: [{ from: 11, to: 20, boxes: MIM_LOW_PROFILE }],
    cancels: [{
      from: 13,
      to: 21,
      into: [MIM_WALL_IDS.wallLaunch, MIM_WALL_IDS.invisibleWall],
    }],
  },
  {
    // I+L — Butterfly Kick. Horizontal rotation, both legs through the arc.
    // The longest normal in the kit and the most punishable on block.
    id: MIM_DUAL_IDS.butterflyKick,
    startup: 18,
    active: 4,
    recovery: 18,
    hits: [{
      hitId: 'butterfly',
      from: 18,
      to: 22,
      box: [0.72, 1.16, 0.62, 0.5],
      damage: 92,
      hitstop: [12, 16],
      hitstun: 30,
      blockstun: 18,
      knockback: [0.24, 0.2],
      blockKnockback: [0.2, 0],
      groundBounce: {
        count: 1,
        verticalSpeed: 118,
        horizontalScale: { numerator: 1, denominator: 2 },
        minimumHitstun: 20,
      },
    }],
    // Airborne through the rotation: the body is one volume, so the drawing and
    // the box turn over together and neither leg grows a phantom reach.
    hurtboxes: [{ from: 14, to: 26, boxes: MIM_AIRBORNE_PROFILE }],
  },
];

export const MIM_DUAL_MOVES: readonly MoveFrameData[] = buildMoves(rows);
