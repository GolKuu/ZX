import type { MoveFrameData } from '../sim/frame-data.js';
import { fixed, type FixedBox, type FixedVector } from '../sim/math.js';

interface GlitchMoveRow {
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

export const GLITCH_MOVE_IDS = {
  lp: 'glitch.lp',
  hp: 'glitch.hp',
  lk: 'glitch.lk',
  hk: 'glitch.hk',
  packetLoss: 'glitch.packet-loss',
  corruptedZone: 'glitch.corrupted-zone',
  desyncJump: 'glitch.desync-jump',
} as const;

const rows: readonly GlitchMoveRow[] = [
  move(GLITCH_MOVE_IDS.lp, 4, 2, 10, 26, 15, box(0.76, 1.02, 0.34, 0.2), vector(0.08, 0), [
    GLITCH_MOVE_IDS.lk,
    GLITCH_MOVE_IDS.hp,
    GLITCH_MOVE_IDS.packetLoss,
  ]),
  move(GLITCH_MOVE_IDS.hp, 15, 5, 30, 92, 29, box(1.02, 1.04, 0.7, 0.58), vector(0.23, 0.24), [
    GLITCH_MOVE_IDS.hk,
    GLITCH_MOVE_IDS.corruptedZone,
  ]),
  move(GLITCH_MOVE_IDS.lk, 7, 3, 17, 42, 18, box(0.9, 0.3, 0.54, 0.2), vector(0.11, 0), [
    GLITCH_MOVE_IDS.hp,
    GLITCH_MOVE_IDS.packetLoss,
  ]),
  move(GLITCH_MOVE_IDS.hk, 14, 5, 28, 80, 26, box(1.12, 1.04, 0.72, 0.5), vector(0.26, 0.32)),
  move(GLITCH_MOVE_IDS.packetLoss, 18, 8, 26, 68, 24, box(2.05, 1.08, 1.22, 0.3), vector(0.2, 0.08)),
  move(GLITCH_MOVE_IDS.corruptedZone, 23, 10, 31, 64, 27, box(1.15, 0.42, 1.22, 0.4), vector(0.12, 0.18)),
  move(GLITCH_MOVE_IDS.desyncJump, 11, 4, 24, 58, 22, box(0.76, 1.64, 0.58, 0.5), vector(0.14, 0.46)),
];

export const GLITCH_MOVES: readonly MoveFrameData[] = rows.map((row) => {
  const heavy = row.damage >= 64;
  return {
    id: row.id,
    startup: row.startup,
    active: row.active,
    recovery: row.recovery,
    hitboxes: [{
      hitId: 'corruption',
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

function move(
  id: string,
  startup: number,
  active: number,
  recovery: number,
  damage: number,
  hitstun: number,
  hitbox: FixedBox,
  knockback: FixedVector,
  cancels?: readonly string[],
): GlitchMoveRow {
  return { id, startup, active, recovery, damage, hitstun, box: hitbox, knockback, cancels };
}

function box(x: number, y: number, halfWidth: number, halfHeight: number): FixedBox {
  return {
    offset: { x: fixed(x), y: fixed(y) },
    halfSize: { x: fixed(halfWidth), y: fixed(halfHeight) },
  };
}

function vector(x: number, y: number): FixedVector {
  return { x: fixed(x), y: fixed(y) };
}
