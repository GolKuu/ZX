import type {
  AuthoredHitbox,
  AuthoredHurtbox,
  GroundBounceData,
  MoveCounterData,
  MoveFrameData,
  WallBounceData,
} from '../../sim/frame-data.js';
import { fixed, type FixedBox } from '../../sim/math.js';
import type { WallCommandData, WallSpawnData } from '../../sim/walls/types.js';

/** `[x, y, halfWidth, halfHeight]` in engine units, local to the fighter. */
export type BoxTuple = readonly [number, number, number, number];

export interface MimHit {
  readonly hitId: string;
  /** Absolute move frames. Authored per hit so a hitbox can never lead the limb. */
  readonly from: number;
  readonly to: number;
  readonly box: BoxTuple;
  readonly damage: number;
  readonly hitstop: readonly [number, number];
  readonly hitstun: number;
  /** Omitted for supers and ultimates, which have no guard interaction. */
  readonly blockstun?: number;
  readonly knockback: readonly [number, number];
  readonly blockKnockback?: readonly [number, number];
  readonly chip?: number;
  readonly wallBounce?: WallBounceData;
  readonly groundBounce?: GroundBounceData;
}

export interface MimHurt {
  readonly from: number;
  readonly to: number;
  /** Empty means invulnerable for that window. */
  readonly boxes: readonly BoxTuple[];
}

export interface MimCancel {
  readonly from: number;
  readonly to: number;
  readonly into: readonly string[];
}

export interface MimMoveRow {
  readonly id: string;
  readonly attackLevel?: MoveFrameData['attackLevel'];
  readonly startup: number;
  readonly active: number;
  readonly recovery: number;
  readonly hits?: readonly MimHit[];
  readonly hurtboxes?: readonly MimHurt[];
  readonly cancels?: readonly MimCancel[];
  readonly walls?: readonly WallSpawnData[];
  readonly wallCommand?: WallCommandData;
  readonly wallPiercing?: boolean;
  readonly wallDamage?: number;
  readonly counter?: MoveCounterData;
  readonly onHitFollowUp?: string;
}

export function box(tuple: BoxTuple): FixedBox {
  return {
    offset: { x: fixed(tuple[0]), y: fixed(tuple[1]) },
    halfSize: { x: fixed(tuple[2]), y: fixed(tuple[3]) },
  };
}

export function wall(
  data: Omit<WallSpawnData, 'offset' | 'halfSize'> & {
    readonly at: readonly [number, number];
    readonly size: readonly [number, number];
  },
): WallSpawnData {
  const { at, size, ...rest } = data;
  return {
    ...rest,
    offset: { x: fixed(at[0]), y: fixed(at[1]) },
    halfSize: { x: fixed(size[0]), y: fixed(size[1]) },
  };
}

export function buildMove(row: MimMoveRow): MoveFrameData {
  return {
    id: row.id,
    attackLevel: row.attackLevel,
    startup: row.startup,
    active: row.active,
    recovery: row.recovery,
    hitboxes: (row.hits ?? []).map(toHitbox),
    hurtboxes: row.hurtboxes === undefined
      ? undefined
      : row.hurtboxes.map(toHurtbox),
    cancels: row.cancels === undefined
      ? undefined
      : row.cancels.map((cancel) => ({
          frames: { from: cancel.from, toExclusive: cancel.to },
          into: [...cancel.into],
        })),
    walls: row.walls,
    wallCommand: row.wallCommand,
    wallPiercing: row.wallPiercing,
    wallDamage: row.wallDamage,
    counter: row.counter,
    onHitFollowUp: row.onHitFollowUp,
  };
}

export function buildMoves(rows: readonly MimMoveRow[]): readonly MoveFrameData[] {
  return rows.map(buildMove);
}

function toHitbox(hit: MimHit): AuthoredHitbox {
  const hitstop = { attacker: hit.hitstop[0], defender: hit.hitstop[1] };
  return {
    hitId: hit.hitId,
    frames: { from: hit.from, toExclusive: hit.to },
    boxes: [box(hit.box)],
    hit: {
      damage: hit.damage,
      hitstop,
      hitstun: hit.hitstun,
      knockback: { x: fixed(hit.knockback[0]), y: fixed(hit.knockback[1]) },
      block: hit.blockstun === undefined
        ? undefined
        : {
            blockstun: hit.blockstun,
            hitstop,
            knockback: {
              x: fixed(hit.blockKnockback?.[0] ?? 0.11),
              y: fixed(hit.blockKnockback?.[1] ?? 0),
            },
            chipDamage: hit.chip,
          },
      wallBounce: hit.wallBounce,
      groundBounce: hit.groundBounce,
    },
  };
}

function toHurtbox(hurt: MimHurt): AuthoredHurtbox {
  return {
    frames: { from: hurt.from, toExclusive: hurt.to },
    boxes: hurt.boxes.map(box),
  };
}
