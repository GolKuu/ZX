import type { FixedVector } from '../math.js';

/**
 * MIM's energy planes. The kind is not decoration: it decides what the plane
 * blocks, whether it can be run on, and how the renderer draws it.
 */
export type WallKind =
  | 'standard'
  | 'shield'
  | 'moving'
  | 'rear'
  | 'platform'
  | 'run'
  | 'prison'
  | 'ultimate';

/**
 * `materializing` planes are transparent to everything — that is the window in
 * which MIM is punished for a bad summon. Only `solid` blocks.
 */
export type WallState = 'materializing' | 'solid' | 'shattering';

/** Authored on a move: what that move puts into the world, and when. */
export interface WallSpawnData {
  readonly kind: WallKind;
  /** Local-space centre, mirrored by the owner's facing at spawn time. */
  readonly offset: FixedVector;
  readonly halfSize: FixedVector;
  /** Move frame the plane appears on. Never earlier than the readable gesture. */
  readonly spawnFrame: number;
  readonly materializeFrames: number;
  readonly lifetimeFrames: number;
  /** Confirmed attack contacts the plane survives. */
  readonly integrity: number;
  readonly runnable?: boolean;
  readonly platform?: boolean;
  /** Moving planes only: fixed units per frame, along the owner's facing. */
  readonly pushSpeed?: number;
  readonly pushDamage?: number;
  readonly pushHitstun?: number;
}

/**
 * A move's instruction to the field about planes that already exist.
 *
 * Kept as data rather than a branch in the engine so "push the wall" and "climb
 * the wall" stay authored rows, per the project's frame-data rule.
 */
export interface WallCommandData {
  readonly frame: number;
  readonly action: 'launch' | 'mount' | 'shatterOwn';
  readonly pushSpeed?: number;
  readonly pushDamage?: number;
  readonly pushHitstun?: number;
}

export interface WallEntity {
  readonly id: number;
  readonly ownerId: string;
  readonly team: number;
  readonly kind: WallKind;
  readonly facing: -1 | 1;
  center: { x: number; y: number };
  readonly halfSize: FixedVector;
  age: number;
  readonly materializeFrames: number;
  readonly lifetimeFrames: number;
  integrity: number;
  readonly maxIntegrity: number;
  readonly runnable: boolean;
  readonly platform: boolean;
  pushSpeed: number;
  pushDamage: number;
  pushHitstun: number;
  state: WallState;
  shatterFrames: number;
  /** `hitId:defenderId` keys already consumed, so one swing breaks one layer. */
  readonly contactLedger: string[];
}

export interface WallSnapshot {
  readonly id: number;
  readonly ownerId: string;
  readonly kind: WallKind;
  readonly state: WallState;
  readonly center: FixedVector;
  readonly halfSize: FixedVector;
  readonly facing: -1 | 1;
  readonly age: number;
  readonly lifetimeFrames: number;
  readonly materializeFrames: number;
  readonly integrity: number;
  readonly maxIntegrity: number;
  readonly runnable: boolean;
  readonly platform: boolean;
}

/** Frames a broken plane stays visible while it falls apart. */
export const WALL_SHATTER_FRAMES = 9;

/**
 * Caps exist so a wall character cannot simply out-build the opponent.
 * Blocking planes are the scarce resource; platforms and run rails are not,
 * because neither of them stops an attack.
 */
export const WALL_BLOCKING_LIMIT = 3;
export const WALL_TOTAL_LIMIT = 7;

const BLOCKING_KINDS: ReadonlySet<WallKind> = new Set<WallKind>([
  'standard',
  'shield',
  'moving',
  'rear',
  'prison',
  'ultimate',
]);

export function isBlockingKind(kind: WallKind): boolean {
  return BLOCKING_KINDS.has(kind);
}
