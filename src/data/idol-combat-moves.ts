import type { MoveFrameData } from '../sim/frame-data.js';
import { fixed, type FixedBox, type FixedVector } from '../sim/math.js';

interface IdolMoveRow {
  readonly id: string;
  readonly startup: number;
  readonly active: number;
  readonly recovery: number;
  readonly damage: number;
  readonly hitstun: number;
  readonly box: FixedBox;
  readonly knockback: FixedVector;
  readonly cancels?: readonly string[];
}

export const IDOL_MOVE_IDS = {
  lp: 'idol.lp',
  hp: 'idol.hp',
  lk: 'idol.lk',
  hk: 'idol.hk',
} as const;

const rows: readonly IdolMoveRow[] = [
  {
    id: IDOL_MOVE_IDS.lp,
    startup: 5,
    active: 2,
    recovery: 11,
    damage: 28,
    hitstun: 15,
    box: attackBox(0.76, 1.08, 0.38, 0.22),
    knockback: { x: fixed(0.08), y: 0 },
    cancels: [IDOL_MOVE_IDS.lk, IDOL_MOVE_IDS.hp],
  },
  {
    id: IDOL_MOVE_IDS.hp,
    startup: 13,
    active: 5,
    recovery: 29,
    damage: 86,
    hitstun: 27,
    box: attackBox(1.02, 1.16, 0.68, 0.56),
    knockback: { x: fixed(0.2), y: fixed(0.22) },
    cancels: [IDOL_MOVE_IDS.hk],
  },
  {
    id: IDOL_MOVE_IDS.lk,
    startup: 7,
    active: 3,
    recovery: 17,
    damage: 42,
    hitstun: 18,
    box: attackBox(0.82, 0.3, 0.5, 0.22),
    knockback: { x: fixed(0.11), y: 0 },
    cancels: [IDOL_MOVE_IDS.hp],
  },
  {
    id: IDOL_MOVE_IDS.hk,
    startup: 15,
    active: 5,
    recovery: 31,
    damage: 78,
    hitstun: 25,
    box: attackBox(1.04, 1.02, 0.72, 0.54),
    knockback: { x: fixed(0.24), y: fixed(0.28) },
  },
];

export const IDOL_MOVES: readonly MoveFrameData[] = rows.map((row) => {
  const heavy = row.damage > 60;
  return {
    id: row.id,
    startup: row.startup,
    active: row.active,
    recovery: row.recovery,
    hitboxes: [{
      hitId: 'performance',
      frames: { from: row.startup, toExclusive: row.startup + row.active },
      boxes: [row.box],
      hit: {
        damage: row.damage,
        hitstop: { attacker: heavy ? 10 : 6, defender: heavy ? 14 : 8 },
        hitstun: row.hitstun,
        knockback: row.knockback,
        block: {
          blockstun: heavy ? 18 : 11,
          hitstop: { attacker: heavy ? 8 : 5, defender: heavy ? 11 : 7 },
          knockback: { x: fixed(heavy ? 0.16 : 0.08), y: 0 },
        },
      },
    }],
    cancels: row.cancels === undefined ? undefined : [{
      frames: {
        from: row.startup,
        toExclusive: row.startup + row.active + row.recovery,
      },
      into: row.cancels,
    }],
  };
});

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
