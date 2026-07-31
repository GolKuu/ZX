import type { MoveFrameData } from '../../sim/frame-data.js';
import { buildMoves, wall, type MimMoveRow } from './builder.js';
import { MIM_AIRBORNE_PROFILE } from './character.js';
import { MIM_SUPER_IDS } from './ids.js';
import { MIM_PERFECT_BOX_SEQUENCE } from './ultimate.js';

export const MIM_LEVEL_ONE_COST = 34;
export const MIM_LEVEL_THREE_COST = 100;

/** The counter branch False Opening routes into when the bait is taken. */
export const MIM_FALSE_OPENING_COUNTER = 'mim.super.false-opening.counter';

const rows: readonly MimMoveRow[] = [
  {
    // J + K + I — Mirror Arena. No damage at all: it buys geometry, and the
    // price is 22 frames of standing still to build it.
    id: MIM_SUPER_IDS.mirrorArena,
    startup: 22,
    active: 6,
    recovery: 40,
    walls: [
      wall({
        kind: 'run',
        at: [1.5, 1.2],
        size: [0.08, 1.2],
        spawnFrame: 22,
        materializeFrames: 5,
        lifetimeFrames: 300,
        integrity: 2,
        runnable: true,
      }),
      wall({
        kind: 'run',
        at: [-1.5, 1.2],
        size: [0.08, 1.2],
        spawnFrame: 24,
        materializeFrames: 5,
        lifetimeFrames: 300,
        integrity: 2,
        runnable: true,
      }),
      wall({
        kind: 'platform',
        at: [0.9, 1.62],
        size: [0.5, 0.06],
        spawnFrame: 26,
        materializeFrames: 4,
        lifetimeFrames: 300,
        integrity: 3,
        platform: true,
      }),
      wall({
        kind: 'platform',
        at: [-0.9, 2.0],
        size: [0.5, 0.06],
        spawnFrame: 27,
        materializeFrames: 4,
        lifetimeFrames: 300,
        integrity: 3,
        platform: true,
      }),
    ],
  },
  {
    // J + K + L — False Opening. The waiting pose is a real hurtbox: if nobody
    // bites, MIM eats the whole 22-frame recovery for nothing.
    id: MIM_SUPER_IDS.falseOpening,
    startup: 20,
    active: 26,
    recovery: 22,
    counter: {
      frames: { from: 20, toExclusive: 46 },
      into: MIM_FALSE_OPENING_COUNTER,
      attackerHitstop: 16,
    },
  },
  {
    // The punish itself: MIM is off the line, a plane arrives at an angle the
    // attacker was not covering, and the acrobatic answer lands.
    id: MIM_FALSE_OPENING_COUNTER,
    startup: 6,
    active: 6,
    recovery: 24,
    wallPiercing: true,
    walls: [wall({
      kind: 'standard',
      at: [0.9, 1.05],
      size: [0.09, 1.05],
      spawnFrame: 2,
      materializeFrames: 2,
      lifetimeFrames: 110,
      integrity: 2,
      runnable: true,
    })],
    hits: [{
      hitId: 'counter',
      from: 6,
      to: 12,
      box: [0.74, 1.3, 0.52, 0.66],
      damage: 128,
      hitstop: [16, 22],
      hitstun: 44,
      knockback: [0.2, 0.26],
      wallBounce: {
        count: 1,
        horizontalSpeed: 132,
        verticalSpeed: 110,
        minimumHitstun: 30,
      },
    }],
    hurtboxes: [{ from: 0, to: 12, boxes: [] }],
  },
  {
    // J + K + I + L — Perfect Box, the trap hit. Whiffing it costs 16 frames
    // and the ultimate stays spent; it is never a free cinematic.
    id: MIM_SUPER_IDS.perfectBox,
    startup: 12,
    active: 5,
    recovery: 16,
    wallPiercing: true,
    onHitFollowUp: MIM_PERFECT_BOX_SEQUENCE.id,
    hits: [{
      hitId: 'trap',
      from: 12,
      to: 17,
      box: [0.78, 1.24, 0.44, 0.66],
      damage: 40,
      hitstop: [18, 24],
      hitstun: 40,
      knockback: [0.02, 0.04],
    }],
    hurtboxes: [{ from: 8, to: 17, boxes: MIM_AIRBORNE_PROFILE }],
  },
];

export const MIM_SUPER_MOVES: readonly MoveFrameData[] = [
  ...buildMoves(rows),
  MIM_PERFECT_BOX_SEQUENCE.move,
];

export type MimSuperKind =
  | 'mirrorArena'
  | 'falseOpening'
  | 'perfectBox'
  | 'prank'
  | 'hero'
  | 'altF4';

const KINDS: Readonly<Record<string, MimSuperKind>> = {
  [MIM_SUPER_IDS.mirrorArena]: 'mirrorArena',
  [MIM_SUPER_IDS.falseOpening]: 'falseOpening',
  [MIM_SUPER_IDS.perfectBox]: 'perfectBox',
};

export function mimSuperKindForMove(moveId: string): MimSuperKind | null {
  return KINDS[moveId] ?? null;
}

export function mimSuperCostForMove(moveId: string): number | null {
  const kind = mimSuperKindForMove(moveId);
  if (kind === null) return null;
  return kind === 'perfectBox' ? MIM_LEVEL_THREE_COST : MIM_LEVEL_ONE_COST;
}
