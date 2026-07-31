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
    attackLevel: 'high',
    startup: 4,
    active: 3,
    recovery: 8,
    hits: [{
      hitId: 'spotlight-snap',
      from: 4,
      to: 7,
      box: [0.78, 1.68, 0.34, 0.16],
      damage: 31,
      hitstop: [5, 8],
      hitstun: 15,
      blockstun: 8,
      knockback: [0.08, 0.01],
      blockKnockback: [0.1, 0],
    }],
    cancels: [{
      from: 4,
      to: 11,
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
    attackLevel: 'mid',
    startup: 9,
    active: 3,
    recovery: 13,
    hits: [{
      hitId: 'cane-hook',
      from: 9,
      to: 12,
      box: [0.74, 1.46, 0.42, 0.25],
      damage: 55,
      hitstop: [7, 10],
      hitstun: 20,
      blockstun: 12,
      knockback: [0.1, 0.03],
      blockKnockback: [0.14, 0],
    }],
    cancels: [{
      from: 9,
      to: 17,
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
    attackLevel: 'low',
    startup: 12,
    active: 5,
    recovery: 15,
    hits: [{
      hitId: 'ribbon-sweep',
      from: 12,
      to: 17,
      box: [0.98, 0.32, 0.52, 0.2],
      damage: 66,
      hitstop: [8, 11],
      hitstun: 23,
      blockstun: 14,
      knockback: [0.18, 0.07],
      blockKnockback: [0.14, 0],
    }],
    hurtboxes: [{ from: 7, to: 20, boxes: MIM_LOW_PROFILE }],
    cancels: [{
      from: 12,
      to: 20,
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
    attackLevel: 'high',
    startup: 18,
    active: 5,
    recovery: 20,
    hits: [{
      hitId: 'curtain-drop',
      from: 18,
      to: 23,
      box: [1.02, 1.42, 0.56, 0.66],
      damage: 96,
      hitstop: [12, 16],
      hitstun: 31,
      blockstun: 18,
      knockback: [0.24, 0.19],
      blockKnockback: [0.2, 0],
      wallBounce: {
        count: 1,
        horizontalSpeed: 126,
        verticalSpeed: 102,
        minimumHitstun: 25,
      },
    }],
    // Committed: the torso is exposed through the whole turn.
    hurtboxes: [{
      from: 15,
      to: 27,
      boxes: [MIM_TORSO_BOX, MIM_HEAD_BOX, [0.3, 0.5, 0.4, 0.5]],
    }],
  },
];

export const MIM_NORMAL_MOVES: readonly MoveFrameData[] = buildMoves(rows);
