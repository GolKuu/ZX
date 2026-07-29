import type { MoveFrameData } from '../sim/frame-data.js';
import { fixed, type FixedBox, type FixedVector } from '../sim/math.js';

interface EchoMoveRow {
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

export const ECHO_MOVE_IDS = {
  lp: 'echo.lp',
  hp: 'echo.hp',
  lk: 'echo.lk',
  hk: 'echo.hk',
} as const;

const rows: readonly EchoMoveRow[] = [
  {
    id: ECHO_MOVE_IDS.lp,
    startup: 5,
    active: 2,
    recovery: 9,
    damage: 28,
    hitstun: 16,
    box: attackBox(0.76, 1.02, 0.38, 0.24),
    knockback: { x: fixed(0.08), y: 0 },
    cancels: [ECHO_MOVE_IDS.lk, ECHO_MOVE_IDS.hp],
  },
  {
    id: ECHO_MOVE_IDS.hp,
    startup: 12,
    active: 3,
    recovery: 23,
    damage: 74,
    hitstun: 24,
    box: attackBox(1.08, 1.04, 0.58, 0.34),
    knockback: { x: fixed(0.21), y: fixed(0.08) },
  },
  {
    id: ECHO_MOVE_IDS.lk,
    startup: 8,
    active: 3,
    recovery: 18,
    damage: 44,
    hitstun: 17,
    box: attackBox(0.94, 0.28, 0.54, 0.2),
    knockback: { x: fixed(0.13), y: fixed(0.04) },
    cancels: [ECHO_MOVE_IDS.hk],
  },
  {
    id: ECHO_MOVE_IDS.hk,
    startup: 11,
    active: 4,
    recovery: 25,
    damage: 70,
    hitstun: 24,
    box: attackBox(1.16, 0.88, 0.66, 0.34),
    knockback: { x: fixed(0.22), y: fixed(0.12) },
  },
];

export const ECHO_MOVES: readonly MoveFrameData[] = rows.map((row) => {
  const heavy = row.id === ECHO_MOVE_IDS.hp || row.id === ECHO_MOVE_IDS.hk;
  return {
    id: row.id,
    startup: row.startup,
    active: row.active,
    recovery: row.recovery,
    hitboxes: [{
      hitId: 'prediction',
      frames: { from: row.startup, toExclusive: row.startup + row.active },
      boxes: [row.box],
      hit: {
        damage: row.damage,
        hitstop: { attacker: heavy ? 9 : 6, defender: heavy ? 13 : 8 },
        hitstun: row.hitstun,
        knockback: row.knockback,
        block: {
          blockstun: heavy ? 17 : 11,
          hitstop: { attacker: heavy ? 7 : 5, defender: heavy ? 10 : 7 },
          knockback: { x: fixed(heavy ? 0.14 : 0.08), y: 0 },
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
