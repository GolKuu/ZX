import type { MoveFrameData } from '../sim/frame-data.js';
import { fixed, type FixedBox, type FixedVector } from '../sim/math.js';

interface ChronoMoveRow {
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

export const CHRONO_MOVE_IDS = {
  lp: 'chrono.lp',
  hp: 'chrono.hp',
  lk: 'chrono.lk',
  hk: 'chrono.hk',
} as const;

const rows: readonly ChronoMoveRow[] = [
  row(CHRONO_MOVE_IDS.lp, 4, 2, 10, 27, 15, 0.8, 1.06, 0.38, 0.22, 0.08, 0, [
    CHRONO_MOVE_IDS.lk,
    CHRONO_MOVE_IDS.hp,
  ]),
  row(CHRONO_MOVE_IDS.hp, 14, 4, 29, 88, 28, 1.18, 1.12, 0.68, 0.5, 0.22, 0.16, [
    CHRONO_MOVE_IDS.hk,
  ]),
  row(CHRONO_MOVE_IDS.lk, 7, 3, 17, 41, 18, 0.92, 0.28, 0.54, 0.2, 0.12, 0, [
    CHRONO_MOVE_IDS.hp,
  ]),
  row(CHRONO_MOVE_IDS.hk, 15, 5, 31, 80, 26, 1.08, 1.18, 0.72, 0.5, 0.25, 0.3),
];

export const CHRONO_MOVES: readonly MoveFrameData[] = rows.map((move) => {
  const heavy = move.damage >= 70;
  return {
    id: move.id,
    startup: move.startup,
    active: move.active,
    recovery: move.recovery,
    hitboxes: [{
      hitId: 'time-strike',
      frames: {
        from: move.startup,
        toExclusive: move.startup + move.active,
      },
      boxes: [move.box],
      hit: {
        damage: move.damage,
        hitstop: { attacker: heavy ? 10 : 6, defender: heavy ? 14 : 8 },
        hitstun: move.hitstun,
        knockback: move.knockback,
        block: {
          blockstun: heavy ? 18 : 11,
          hitstop: { attacker: heavy ? 8 : 5, defender: heavy ? 11 : 7 },
          knockback: { x: fixed(heavy ? 0.16 : 0.08), y: 0 },
        },
      },
    }],
    cancels: move.cancels === undefined ? undefined : [{
      frames: {
        from: move.startup,
        toExclusive: move.startup + move.active + move.recovery,
      },
      into: move.cancels,
    }],
  };
});

function row(
  id: string,
  startup: number,
  active: number,
  recovery: number,
  damage: number,
  hitstun: number,
  x: number,
  y: number,
  halfWidth: number,
  halfHeight: number,
  knockbackX: number,
  knockbackY: number,
  cancels?: readonly string[],
): ChronoMoveRow {
  return {
    id,
    startup,
    active,
    recovery,
    damage,
    hitstun,
    box: attackBox(x, y, halfWidth, halfHeight),
    knockback: { x: fixed(knockbackX), y: fixed(knockbackY) },
    cancels,
  };
}

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
