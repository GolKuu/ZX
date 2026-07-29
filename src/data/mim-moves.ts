import type { MoveFrameData } from '../sim/frame-data.js';
import { fixed, type FixedBox, type FixedVector } from '../sim/math.js';

export const MIM_MOVE_IDS = {
  snap: 'mim.snap',
  cursor: 'mim.cursor',
  banana: 'mim.banana',
  chair: 'mim.chair',
} as const;

interface MimMoveRow {
  readonly id: string;
  readonly startup: number;
  readonly active: number;
  readonly recovery: number;
  readonly damage: number;
  readonly hitstop: readonly [number, number];
  readonly hitstun: number;
  readonly blockstun: number;
  readonly box: FixedBox;
  readonly knockback: FixedVector;
  readonly cancels?: readonly string[];
}

const rows: readonly MimMoveRow[] = [
  {
    id: MIM_MOVE_IDS.snap,
    startup: 5,
    active: 2,
    recovery: 11,
    damage: 28,
    hitstop: [5, 7],
    hitstun: 14,
    blockstun: 9,
    box: box(0.64, 1.03, 0.3, 0.2),
    knockback: { x: fixed(0.08), y: 0 },
    cancels: [MIM_MOVE_IDS.banana, MIM_MOVE_IDS.cursor],
  },
  {
    id: MIM_MOVE_IDS.cursor,
    startup: 14,
    active: 4,
    recovery: 28,
    damage: 82,
    hitstop: [11, 15],
    hitstun: 28,
    blockstun: 18,
    box: box(0.82, 1.28, 0.58, 0.7),
    knockback: { x: fixed(0.16), y: fixed(0.3) },
  },
  {
    id: MIM_MOVE_IDS.banana,
    startup: 8,
    active: 3,
    recovery: 18,
    damage: 48,
    hitstop: [8, 10],
    hitstun: 19,
    blockstun: 13,
    box: box(0.94, 0.35, 0.58, 0.24),
    knockback: { x: fixed(0.13), y: fixed(0.05) },
    cancels: [MIM_MOVE_IDS.chair],
  },
  {
    id: MIM_MOVE_IDS.chair,
    startup: 18,
    active: 5,
    recovery: 32,
    damage: 96,
    hitstop: [13, 17],
    hitstun: 32,
    blockstun: 21,
    box: box(0.9, 0.92, 0.76, 0.58),
    knockback: { x: fixed(0.29), y: fixed(0.18) },
  },
];

export const MIM_MOVES: readonly MoveFrameData[] = rows.map((row) => {
  const activeTo = row.startup + row.active;
  return {
    id: row.id,
    startup: row.startup,
    active: row.active,
    recovery: row.recovery,
    hitboxes: [{
      hitId: 'primary',
      frames: { from: row.startup, toExclusive: activeTo },
      boxes: [row.box],
      hit: {
        damage: row.damage,
        hitstop: { attacker: row.hitstop[0], defender: row.hitstop[1] },
        hitstun: row.hitstun,
        knockback: row.knockback,
        block: {
          blockstun: row.blockstun,
          hitstop: { attacker: row.hitstop[0], defender: row.hitstop[1] },
          knockback: { x: fixed(0.12), y: 0 },
        },
      },
    }],
    cancels: row.cancels === undefined
      ? undefined
      : [{
          frames: { from: row.startup, toExclusive: activeTo + 4 },
          into: row.cancels,
        }],
  };
});

function box(
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
