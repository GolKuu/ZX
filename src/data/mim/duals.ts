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
    // J+I — Vault Knee. The launcher; everything airborne starts here.
    id: MIM_DUAL_IDS.vaultKnee,
    startup: 9,
    active: 4,
    recovery: 15,
    hits: [{
      hitId: 'knee',
      from: 9,
      to: 13,
      box: [0.52, 1.72, 0.28, 0.36],
      damage: 58,
      hitstop: [9, 12],
      hitstun: 30,
      blockstun: 13,
      knockback: [0.06, 0.34],
      blockKnockback: [0.14, 0],
    }],
    hurtboxes: [{ from: 9, to: 15, boxes: MIM_AIRBORNE_PROFILE }],
    cancels: [{
      from: 9,
      to: 18,
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
