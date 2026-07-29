/**
 * Move data for the remaining two roster slots.
 *
 * Original IP, per the standing constraint. Mechanics are preserved exactly as
 * briefed; only the names are ours:
 *
 *   Velocity King  → Kade Ruven    (rushdown / frame trap)
 *   Elastic Brawler → Tamsin Oduya (mid-range / stance)
 *
 * Ids are namespaced by character (`vk.` / `eb.`) because the engine takes one
 * flat move table and ids must be globally unique. The command tables in
 * `src/input/rosterCommands.ts` are what gate who can actually use what.
 *
 * Adding a move is adding a row here — never a branch (rule R6).
 */

import type { MoveFrameData } from '../sim/frame-data.js';
import { fixed, type FixedBox, type FixedVector } from '../sim/math.js';

interface MoveRow {
  readonly id: string;
  readonly startup: number;
  readonly active: number;
  readonly recovery: number;
  /** Omitted for pure movement and stance moves — they hit nothing. */
  readonly damage?: number;
  readonly hitstop?: readonly [attacker: number, defender: number];
  readonly hitstun?: number;
  readonly box?: FixedBox;
  readonly knockback?: FixedVector;
  /** Absent block data means unblockable — used by the command throw. */
  readonly blockstun?: number;
  readonly blockPushback?: number;
  readonly cancels?: readonly string[];
}

/* ------------------------------------------------------------------ */
/* Velocity King — Kade Ruven                                          */
/* ------------------------------------------------------------------ */

const velocityRows: readonly MoveRow[] = [
  {
    // Projection Sorcery [QCF + K]
    //
    // Movement only — no hitbox at all. Its value is the position it buys and
    // the Frame Inertia stack it grants, which is what turns this character's
    // pressure into a genuine frame trap rather than a mix-up.
    //
    // 3 frames of startup is "instant" in practice: it is inside the 7-frame
    // input leeway, so the dash comes out on the frame the player believes
    // they pressed. The 24 afterimages are a render concern
    // (`ProjectionTrail`), never a simulation one.
    id: 'vk.projection',
    startup: 3,
    active: 1,
    recovery: 8,
    cancels: ['vk.throw', '5L', '5M', '5H'],
  },
  {
    // Command Throw [Half-Circle Back + LP+LK]
    //
    // Unblockable by omission: no `blockstun` row means no block data reaches
    // the engine, so guarding does not apply. That is the whole point of a
    // command throw and it is why the startup is slow and the recovery is
    // punishing.
    //
    // The meter drain is not expressible in frame data; it is applied by
    // `game/mechanics/meterDrain.ts` when this move connects.
    id: 'vk.throw',
    startup: 5,
    active: 3,
    recovery: 30,
    damage: 90,
    hitstop: [12, 16],
    hitstun: 34,
    box: box(0.62, 0.9, 0.34, 0.5),
    knockback: { x: fixed(0.24), y: fixed(0.2) },
  },
];

/* ------------------------------------------------------------------ */
/* Elastic Brawler — Tamsin Oduya                                      */
/* ------------------------------------------------------------------ */

const elasticRows: readonly MoveRow[] = [
  {
    // Pistol [QCF + P] — the mid-range poke the whole kit is built around.
    // Long reach, low commitment, safe on block at this recovery.
    id: 'eb.pistol',
    startup: 11,
    active: 4,
    recovery: 20,
    damage: 62,
    hitstop: [9, 12],
    hitstun: 22,
    blockstun: 16,
    blockPushback: fixed(0.18),
    box: box(1.52, 1.0, 0.78, 0.24),
    knockback: { x: fixed(0.22), y: 0 },
    cancels: ['eb.gear'],
  },
  {
    // Axe [QCB + K] — overhead. Must be blocked standing.
    //
    // The overhead property is a *hit* property the current engine does not
    // model (there is no high/low guard axis yet), so it is enforced on the
    // input side for now. Startup is deliberately slow enough to react to,
    // which is what keeps an overhead fair.
    id: 'eb.axe',
    startup: 22,
    active: 3,
    recovery: 26,
    damage: 78,
    hitstop: [11, 15],
    hitstun: 28,
    blockstun: 18,
    blockPushback: fixed(0.14),
    box: box(1.05, 1.42, 0.52, 0.62),
    knockback: { x: fixed(0.16), y: fixed(0.3) },
  },
  {
    // Gear Shift [Down, Down + P+K] — stance switch, no hitbox.
    //
    // Cycles base → Gear 2 → Gear 4 → base. The recovery is the cost: shifting
    // in neutral is free, shifting under pressure is a gamble. Gear state
    // itself lives in `game/mechanics/gearShift.ts`.
    id: 'eb.gear',
    startup: 6,
    active: 1,
    recovery: 18,
  },
];

/* ------------------------------------------------------------------ */

function toFrameData(row: MoveRow): MoveFrameData {
  const hasHit = row.box !== undefined && row.damage !== undefined;
  const hitstop = row.hitstop ?? [8, 10];
  const activeTo = row.startup + row.active;

  return {
    id: row.id,
    startup: row.startup,
    active: row.active,
    recovery: row.recovery,
    hitboxes: hasHit
      ? [
          {
            hitId: 'primary',
            frames: { from: row.startup, toExclusive: activeTo },
            boxes: [row.box as FixedBox],
            hit: {
              damage: row.damage ?? 0,
              hitstop: { attacker: hitstop[0], defender: hitstop[1] },
              hitstun: row.hitstun ?? 16,
              knockback: row.knockback ?? { x: 0, y: 0 },
              block:
                row.blockstun === undefined
                  ? undefined
                  : {
                      blockstun: row.blockstun,
                      hitstop: {
                        attacker: hitstop[0],
                        defender: hitstop[1],
                      },
                      knockback: { x: row.blockPushback ?? 0, y: 0 },
                    },
            },
          },
        ]
      : [],
    cancels:
      row.cancels === undefined
        ? undefined
        : [
            {
              frames: { from: row.startup, toExclusive: activeTo + row.recovery },
              into: row.cancels,
            },
          ],
  };
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

export const VELOCITY_KING_MOVES: readonly MoveFrameData[] =
  velocityRows.map(toFrameData);

export const ELASTIC_BRAWLER_MOVES: readonly MoveFrameData[] =
  elasticRows.map(toFrameData);

/** Everything the two new slots add, for registration with the engine. */
export const ROSTER_ADDITION_MOVES: readonly MoveFrameData[] = [
  ...VELOCITY_KING_MOVES,
  ...ELASTIC_BRAWLER_MOVES,
];

export const PROJECTION_MOVE_ID = 'vk.projection';
export const COMMAND_THROW_MOVE_ID = 'vk.throw';
export const GEAR_SHIFT_MOVE_ID = 'eb.gear';
export const AXE_MOVE_ID = 'eb.axe';
