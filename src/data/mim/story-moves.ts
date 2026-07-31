import type { MoveFrameData } from '../../sim/frame-data.js';
import { buildMoves, wall, type MimMoveRow } from './builder.js';
import { MIM_AIRBORNE_PROFILE, MIM_CROUCH_PROFILE } from './character.js';
import { MIM_STORY_IDS, MIM_WALL_IDS } from './ids.js';
import { MIM_WALL_LIFETIME, MIM_WALL_TOP } from './wall-specials.js';

/** Techniques the story unlocks. See `unlocks.ts` for the gates. */
const rows: readonly MimMoveRow[] = [
  {
    // W + I + L — Wall Dive. Diagonal drop off a plane.
    id: MIM_STORY_IDS.wallDive,
    startup: 12,
    active: 8,
    recovery: 20,
    hits: [{
      hitId: 'dive',
      from: 12,
      to: 20,
      box: [0.56, 0.86, 0.36, 0.62],
      damage: 84,
      hitstop: [11, 15],
      hitstun: 32,
      blockstun: 16,
      knockback: [0.2, 0.08],
      groundBounce: {
        count: 1,
        verticalSpeed: 104,
        horizontalScale: { numerator: 2, denominator: 3 },
        minimumHitstun: 22,
      },
    }],
    hurtboxes: [{ from: 6, to: 20, boxes: MIM_AIRBORNE_PROFILE }],
  },
  {
    // A + J + K — Rear Wall. Built behind without turning the whole body.
    id: MIM_STORY_IDS.rearWall,
    startup: 16,
    active: 8,
    recovery: 16,
    walls: [wall({
      kind: 'rear',
      at: [-1.24, MIM_WALL_TOP / 2],
      size: [0.1, MIM_WALL_TOP / 2],
      spawnFrame: 16,
      materializeFrames: 8,
      lifetimeFrames: MIM_WALL_LIFETIME,
      integrity: 2,
      runnable: true,
    })],
  },
  {
    // S + J + K — Wall Shield. One strong blow, then it is gone.
    id: MIM_STORY_IDS.wallShield,
    startup: 9,
    active: 6,
    recovery: 20,
    walls: [wall({
      kind: 'shield',
      at: [0.62, 0.96],
      size: [0.09, 0.96],
      spawnFrame: 9,
      materializeFrames: 3,
      lifetimeFrames: 46,
      integrity: 1,
    })],
    hurtboxes: [{ from: 6, to: 20, boxes: MIM_CROUCH_PROFILE }],
  },
  {
    // D + K + L — Triple Kick. Low, mid, spinning high; each phase cancels
    // separately, so dropping the string is a real choice.
    id: MIM_STORY_IDS.tripleKick,
    startup: 9,
    active: 22,
    recovery: 19,
    hits: [
      {
        hitId: 'low',
        from: 9,
        to: 12,
        box: [0.8, 0.3, 0.4, 0.2],
        damage: 34,
        hitstop: [6, 8],
        hitstun: 18,
        blockstun: 12,
        knockback: [0.08, 0],
      },
      {
        hitId: 'mid',
        from: 18,
        to: 21,
        box: [0.86, 1.14, 0.42, 0.3],
        damage: 42,
        hitstop: [7, 10],
        hitstun: 20,
        blockstun: 13,
        knockback: [0.12, 0.03],
      },
      {
        hitId: 'high',
        from: 27,
        to: 31,
        box: [0.9, 1.82, 0.46, 0.4],
        damage: 62,
        hitstop: [11, 15],
        hitstun: 28,
        blockstun: 16,
        knockback: [0.24, 0.18],
      },
    ],
    cancels: [
      { from: 12, to: 17, into: [MIM_WALL_IDS.invisibleWall] },
      { from: 21, to: 26, into: [MIM_WALL_IDS.wallLaunch] },
      { from: 31, to: 38, into: [MIM_WALL_IDS.wallRun] },
    ],
  },
  {
    // W + J + I — Air Vault. A platform under the feet, then a hop off it.
    id: MIM_STORY_IDS.airVault,
    startup: 8,
    active: 6,
    recovery: 14,
    walls: [wall({
      kind: 'platform',
      at: [0.72, 1.02],
      size: [0.44, 0.06],
      spawnFrame: 8,
      materializeFrames: 2,
      lifetimeFrames: 72,
      integrity: 3,
      platform: true,
    })],
    hurtboxes: [{ from: 8, to: 20, boxes: MIM_AIRBORNE_PROFILE }],
  },
  {
    // A + I + L — Reverse Butterfly. Opposite angle, opposite pushback, and it
    // routes backward into a rear wall instead of forward into pressure.
    id: MIM_STORY_IDS.reverseButterfly,
    startup: 16,
    active: 5,
    recovery: 19,
    hits: [{
      hitId: 'reverse',
      from: 16,
      to: 21,
      box: [0.5, 1.5, 0.56, 0.54],
      damage: 86,
      hitstop: [12, 16],
      hitstun: 30,
      blockstun: 17,
      knockback: [-0.12, 0.26],
      blockKnockback: [0.06, 0],
    }],
    hurtboxes: [{ from: 12, to: 24, boxes: MIM_AIRBORNE_PROFILE }],
    cancels: [{ from: 21, to: 30, into: [MIM_STORY_IDS.rearWall] }],
  },
  {
    // D + J + K + I — Wall Prison. Three planes, deliberately gapped: the top
    // is open, the far plane is thin, and the whole structure decays fast.
    id: MIM_STORY_IDS.wallPrison,
    startup: 20,
    active: 10,
    recovery: 26,
    walls: [
      wall({
        kind: 'prison',
        at: [2.5, 0.9],
        size: [0.09, 0.9],
        spawnFrame: 20,
        materializeFrames: 8,
        lifetimeFrames: 120,
        integrity: 1,
        runnable: true,
      }),
      wall({
        kind: 'prison',
        at: [0.85, 0.9],
        size: [0.09, 0.9],
        spawnFrame: 24,
        materializeFrames: 8,
        lifetimeFrames: 120,
        integrity: 2,
        runnable: true,
      }),
    ],
  },
  {
    // W + J + K + L — Sky Runner. Two rails at different heights; MIM mounts
    // the lower one and may transfer upward.
    id: MIM_STORY_IDS.skyRunner,
    startup: 14,
    active: 12,
    recovery: 16,
    walls: [
      wall({
        kind: 'run',
        at: [1.35, 1.15],
        size: [0.08, 1.15],
        spawnFrame: 14,
        materializeFrames: 4,
        lifetimeFrames: 150,
        integrity: 2,
        runnable: true,
      }),
      wall({
        kind: 'run',
        at: [2.65, 1.75],
        size: [0.08, 1.05],
        spawnFrame: 18,
        materializeFrames: 4,
        lifetimeFrames: 150,
        integrity: 2,
        runnable: true,
      }),
    ],
    wallCommand: { frame: 22, action: 'mount' },
    hurtboxes: [{ from: 14, to: 42, boxes: MIM_AIRBORNE_PROFILE }],
  },
];

export const MIM_STORY_MOVES: readonly MoveFrameData[] = buildMoves(rows);
