import type {
  GroundBounceData,
  MoveFrameData,
  WallBounceData,
} from '../sim/frame-data.js';
import { fixed, type FixedBox, type FixedVector } from '../sim/math.js';

interface StrikeRow {
  readonly id: string;
  readonly startup: number;
  readonly active: number;
  readonly recovery: number;
  readonly damage: number;
  readonly hitstop: readonly [attacker: number, defender: number];
  readonly hitstun: number;
  readonly blockstun: number;
  readonly blockPushback: number;
  readonly box: FixedBox;
  readonly knockback: FixedVector;
  readonly wallBounce?: WallBounceData;
  readonly groundBounce?: GroundBounceData;
  readonly cancels?: readonly string[];
}

export const KADE_HURTBOXES: readonly FixedBox[] = [
  {
    offset: { x: 0, y: fixed(0.95) },
    halfSize: { x: fixed(0.42), y: fixed(0.95) },
  },
];

const moveRows: readonly StrikeRow[] = [
  {
    id: '5L',
    startup: 6,
    active: 2,
    recovery: 8,
    damage: 30,
    hitstop: [6, 8],
    hitstun: 16,
    blockstun: 11,
    blockPushback: fixed(0.08),
    box: attackBox(0.72, 0.98, 0.36, 0.28),
    knockback: { x: fixed(0.09), y: 0 },
    cancels: ['5M', '2L'],
  },
  {
    id: '5M',
    startup: 9,
    active: 3,
    recovery: 14,
    damage: 55,
    hitstop: [8, 11],
    hitstun: 20,
    blockstun: 15,
    blockPushback: fixed(0.11),
    box: attackBox(0.83, 1.02, 0.44, 0.34),
    knockback: { x: fixed(0.14), y: 0 },
    cancels: ['5H', 'overtake'],
  },
  {
    id: '5H',
    startup: 13,
    active: 4,
    recovery: 22,
    damage: 80,
    hitstop: [11, 15],
    hitstun: 26,
    blockstun: 19,
    blockPushback: fixed(0.16),
    box: attackBox(0.94, 1.08, 0.52, 0.42),
    knockback: { x: fixed(0.18), y: fixed(0.34) },
    groundBounce: {
      count: 1,
      verticalSpeed: fixed(0.26),
      horizontalScale: { numerator: 3, denominator: 4 },
      minimumHitstun: 14,
    },
    cancels: ['overtake'],
  },
  {
    id: '2L',
    startup: 5,
    active: 2,
    recovery: 9,
    damage: 26,
    hitstop: [6, 8],
    hitstun: 16,
    blockstun: 11,
    blockPushback: fixed(0.08),
    box: attackBox(0.68, 0.34, 0.38, 0.22),
    knockback: { x: fixed(0.08), y: 0 },
    cancels: ['5L', '2M'],
  },
  {
    id: '2M',
    startup: 8,
    active: 3,
    recovery: 15,
    damage: 50,
    hitstop: [8, 11],
    hitstun: 20,
    blockstun: 15,
    blockPushback: fixed(0.11),
    box: attackBox(0.86, 0.42, 0.5, 0.25),
    knockback: { x: fixed(0.13), y: fixed(0.06) },
    cancels: ['overtake'],
  },
  {
    id: 'overtake',
    startup: 16,
    active: 3,
    recovery: 20,
    damage: 76,
    hitstop: [10, 14],
    hitstun: 22,
    blockstun: 16,
    blockPushback: fixed(0.2),
    box: attackBox(1.08, 0.92, 0.7, 0.48),
    knockback: { x: fixed(0.28), y: fixed(0.16) },
    wallBounce: {
      count: 1,
      horizontalSpeed: fixed(0.2),
      verticalSpeed: fixed(0.2),
      minimumHitstun: 16,
    },
  },
];

export const KADE_MOVES: readonly MoveFrameData[] = moveRows.map((row) => ({
  id: row.id,
  startup: row.startup,
  active: row.active,
  recovery: row.recovery,
  hitboxes: [
    {
      hitId: 'primary',
      frames: {
        from: row.startup,
        toExclusive: row.startup + row.active,
      },
      boxes: [row.box],
      hit: {
        damage: row.damage,
        hitstop: { attacker: row.hitstop[0], defender: row.hitstop[1] },
        hitstun: row.hitstun,
        knockback: row.knockback,
        block: {
          blockstun: row.blockstun,
          hitstop: { attacker: row.hitstop[0], defender: row.hitstop[1] },
          knockback: { x: row.blockPushback, y: 0 },
        },
        wallBounce: row.wallBounce,
        groundBounce: row.groundBounce,
      },
    },
  ],
  cancels:
    row.cancels === undefined
      ? undefined
      : [
          {
            frames: {
              from: row.startup,
              toExclusive: row.startup + row.active + row.recovery,
            },
            into: row.cancels,
          },
        ],
}));

function attackBox(
  x: number,
  y: number,
  halfWidth: number,
  halfHeight: number,
): FixedBox {
  return {
    offset: { x: fixed(x), y: fixed(y) },
    halfSize: { x: fixed(halfWidth), y: fixed(halfHeight) },
  };
}
