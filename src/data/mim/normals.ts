import type { MoveFrameData } from '../../sim/frame-data.js';
import { buildMoves, type MimMoveRow } from './builder.js';
import { MIM_LOW_PROFILE, MIM_TORSO_BOX, MIM_HEAD_BOX } from './character.js';
import { MIM_DUAL_IDS, MIM_NORMAL_IDS, MIM_WALL_IDS } from './ids.js';

/**
 * The four buttons: J, K, I, L.
 *
 * Frame counts follow the brief's tiers — the jab is a 5-frame check, the spin
 * is a 16-frame commitment that loses to a block by a wide margin. Nothing here
 * is copy-pasted between rows: a heavier move is heavier in every column.
 */
const rows: readonly MimMoveRow[] = [
  {
    // J — Mask Jab. Fastest starter in the kit, almost no reward on its own.
    id: MIM_NORMAL_IDS.maskJab,
    startup: 5,
    active: 4,
    recovery: 9,
    hits: [{
      hitId: 'jab',
      from: 5,
      to: 9,
      box: [0.72, 1.62, 0.3, 0.19],
      damage: 34,
      hitstop: [5, 7],
      hitstun: 14,
      blockstun: 9,
      knockback: [0.07, 0],
      blockKnockback: [0.1, 0],
    }],
    cancels: [{
      from: 5,
      to: 13,
      into: [
        MIM_NORMAL_IDS.backElbow,
        MIM_NORMAL_IDS.capoeiraKick,
        MIM_DUAL_IDS.mirrorStrike,
        MIM_DUAL_IDS.vaultKnee,
        MIM_WALL_IDS.invisibleWall,
      ],
    }],
  },
  {
    // K — Back Elbow. Turns the torso through the blow; beats a side-step.
    id: MIM_NORMAL_IDS.backElbow,
    startup: 8,
    active: 4,
    recovery: 12,
    hits: [{
      hitId: 'elbow',
      from: 8,
      to: 12,
      box: [0.58, 1.5, 0.34, 0.28],
      damage: 52,
      hitstop: [7, 9],
      hitstun: 18,
      blockstun: 12,
      knockback: [0.12, 0.02],
      blockKnockback: [0.13, 0],
    }],
    cancels: [{
      from: 8,
      to: 16,
      into: [
        MIM_NORMAL_IDS.spinningKick,
        MIM_DUAL_IDS.acrobatKick,
        MIM_WALL_IDS.invisibleWall,
      ],
    }],
  },
  {
    // I — Capoeira Kick. Ducks the head box entirely for its whole active window.
    id: MIM_NORMAL_IDS.capoeiraKick,
    startup: 10,
    active: 4,
    recovery: 14,
    hits: [{
      hitId: 'capoeira',
      from: 10,
      to: 14,
      box: [0.86, 0.46, 0.44, 0.24],
      damage: 62,
      hitstop: [8, 11],
      hitstun: 21,
      blockstun: 14,
      knockback: [0.14, 0.04],
      blockKnockback: [0.12, 0],
    }],
    hurtboxes: [{ from: 6, to: 18, boxes: MIM_LOW_PROFILE }],
    cancels: [{
      from: 10,
      to: 19,
      into: [
        MIM_NORMAL_IDS.spinningKick,
        MIM_DUAL_IDS.butterflyKick,
        MIM_WALL_IDS.wallLaunch,
      ],
    }],
  },
  {
    // L — Spinning Kick. The wall of the ground game, and the punish bait.
    id: MIM_NORMAL_IDS.spinningKick,
    startup: 16,
    active: 4,
    recovery: 18,
    hits: [{
      hitId: 'spin',
      from: 16,
      to: 20,
      box: [0.94, 1.34, 0.5, 0.44],
      damage: 88,
      hitstop: [11, 15],
      hitstun: 28,
      blockstun: 17,
      knockback: [0.27, 0.14],
      blockKnockback: [0.18, 0],
      wallBounce: {
        count: 1,
        horizontalSpeed: 120,
        verticalSpeed: 96,
        minimumHitstun: 22,
      },
    }],
    // Committed: the torso is exposed through the whole turn.
    hurtboxes: [{
      from: 14,
      to: 24,
      boxes: [MIM_TORSO_BOX, MIM_HEAD_BOX, [0.3, 0.5, 0.4, 0.5]],
    }],
  },
];

export const MIM_NORMAL_MOVES: readonly MoveFrameData[] = buildMoves(rows);
