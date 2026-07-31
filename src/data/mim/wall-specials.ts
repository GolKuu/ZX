import type { MoveFrameData } from '../../sim/frame-data.js';
import { buildMoves, wall, type MimMoveRow } from './builder.js';
import { MIM_AIRBORNE_PROFILE } from './character.js';
import { MIM_DUAL_IDS, MIM_NORMAL_IDS, MIM_WALL_IDS } from './ids.js';

/**
 * Plane geometry, chosen so the counter-play is real:
 *
 * a standing plane tops out at 2.10 units while a jump apex is about 2.58, so
 * it can always be cleared; it is transparent for its first 8 frames, so a
 * summon read on reaction is a free punish; and it holds two swings, so any
 * two-hit sequence removes it.
 */
export const MIM_WALL_TOP = 2.1;
export const MIM_WALL_LIFETIME = 190;

const rows: readonly MimMoveRow[] = [
  {
    // D + J + K — Invisible Wall. 18 frames of readable gesture before anything
    // exists, and 18 more of recovery afterwards.
    id: MIM_WALL_IDS.invisibleWall,
    startup: 18,
    active: 8,
    recovery: 18,
    walls: [wall({
      kind: 'standard',
      at: [1.16, MIM_WALL_TOP / 2],
      size: [0.1, MIM_WALL_TOP / 2],
      spawnFrame: 18,
      materializeFrames: 8,
      lifetimeFrames: MIM_WALL_LIFETIME,
      integrity: 2,
      runnable: true,
    })],
    cancels: [{
      from: 26,
      to: 34,
      into: [MIM_WALL_IDS.wallRun, MIM_WALL_IDS.wallLaunch],
    }],
  },
  {
    // D + I + L — Wall Launch. MIM barely moves; the space does the work.
    id: MIM_WALL_IDS.wallLaunch,
    startup: 14,
    active: 6,
    recovery: 22,
    wallCommand: {
      frame: 14,
      action: 'launch',
      pushSpeed: 104,
      pushDamage: 74,
      pushHitstun: 32,
    },
    cancels: [{
      from: 20,
      to: 28,
      into: [MIM_NORMAL_IDS.capoeiraKick, MIM_DUAL_IDS.butterflyKick],
    }],
  },
  {
    // W + J + K — Wall Run. The move is the mount; the machine in
    // `sim/walls/wall-run.ts` owns everything after contact.
    id: MIM_WALL_IDS.wallRun,
    startup: 6,
    active: 10,
    recovery: 10,
    wallCommand: { frame: 6, action: 'mount' },
    hurtboxes: [{ from: 4, to: 26, boxes: MIM_AIRBORNE_PROFILE }],
    cancels: [{
      from: 8,
      to: 26,
      into: [
        MIM_DUAL_IDS.butterflyKick,
        MIM_DUAL_IDS.acrobatKick,
        MIM_NORMAL_IDS.capoeiraKick,
      ],
    }],
  },
];

export const MIM_WALL_SPECIAL_MOVES: readonly MoveFrameData[] = buildMoves(rows);
