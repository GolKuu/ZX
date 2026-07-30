import type { MoveFrameData } from '../sim/frame-data.js';
import { fixed, type FixedBox, type FixedVector } from '../sim/math.js';

export const MIM_SUPER_MOVE_IDS = {
  prank: 'mim.super.prank',
  hero: 'mim.super.hero',
  altF4: 'mim.finisher.alt-f4',
} as const;

export type MimSuperKind = keyof typeof MIM_SUPER_MOVE_IDS;

export const MIM_LEVEL_ONE_COST = 34;
export const MIM_LEVEL_THREE_COST = 100;

interface MimSuperRow {
  readonly id: string;
  readonly startup: number;
  readonly active: number;
  readonly recovery: number;
  readonly damage: number;
  readonly hitstop: readonly [number, number];
  readonly hitstun: number;
  readonly box: FixedBox;
  readonly knockback: FixedVector;
}

const rows: readonly MimSuperRow[] = [
  {
    id: MIM_SUPER_MOVE_IDS.prank,
    startup: 18,
    active: 4,
    recovery: 108,
    damage: 105,
    hitstop: [14, 20],
    hitstun: 72,
    box: box(1.05, 0.44, 0.72, 0.42),
    knockback: { x: fixed(0.08), y: fixed(0.1) },
  },
  {
    id: MIM_SUPER_MOVE_IDS.hero,
    startup: 24,
    active: 5,
    recovery: 168,
    damage: 380,
    hitstop: [20, 28],
    hitstun: 128,
    box: box(1.12, 1.02, 0.9, 0.9),
    knockback: { x: fixed(0.04), y: fixed(-0.02) },
  },
  {
    id: MIM_SUPER_MOVE_IDS.altF4,
    startup: 14,
    active: 5,
    recovery: 286,
    damage: 1_000,
    hitstop: [24, 34],
    hitstun: 210,
    box: box(1.14, 1.02, 0.94, 0.94),
    knockback: { x: 0, y: 0 },
  },
];

export const MIM_SUPER_MOVES: readonly MoveFrameData[] = rows.map((row) => ({
  id: row.id,
  startup: row.startup,
  active: row.active,
  recovery: row.recovery,
  hitboxes: [{
    hitId: 'cinematic',
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
    },
  }],
}));

export function mimSuperKindForMove(moveId: string): MimSuperKind | null {
  for (const [kind, id] of Object.entries(MIM_SUPER_MOVE_IDS)) {
    if (id === moveId) return kind as MimSuperKind;
  }
  return null;
}

export function mimSuperCostForMove(moveId: string): number | null {
  const kind = mimSuperKindForMove(moveId);
  if (kind === null) return null;
  return kind === 'prank' ? MIM_LEVEL_ONE_COST : MIM_LEVEL_THREE_COST;
}

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
