import type { FixedBox, FixedVector, Ratio } from './math.js';
import type { WallSpawnData } from './walls/types.js';

export interface FrameRange {
  readonly from: number;
  readonly toExclusive: number;
}

export interface HitstopData {
  readonly attacker: number;
  readonly defender: number;
}

export interface BlockData {
  readonly blockstun: number;
  readonly hitstop: HitstopData;
  readonly knockback: FixedVector;
  /** Damage dealt through guard. Fire attacks use this for chip damage. */
  readonly chipDamage?: number;
}

export interface WallBounceData {
  readonly count: number;
  readonly horizontalSpeed: number;
  readonly verticalSpeed: number;
  readonly minimumHitstun: number;
}

export interface GroundBounceData {
  readonly count: number;
  readonly verticalSpeed: number;
  readonly horizontalScale: Ratio;
  readonly minimumHitstun: number;
}

export interface HitData {
  readonly damage: number;
  readonly hitstop: HitstopData;
  readonly hitstun: number;
  readonly knockback: FixedVector;
  readonly block?: BlockData;
  readonly wallBounce?: WallBounceData;
  readonly groundBounce?: GroundBounceData;
}

export interface AuthoredHitbox {
  readonly hitId: string;
  readonly frames: FrameRange;
  readonly boxes: readonly FixedBox[];
  readonly hit: HitData;
}

export interface AuthoredHurtbox {
  readonly frames: FrameRange;
  readonly boxes: readonly FixedBox[];
}

export interface CancelWindow {
  readonly frames: FrameRange;
  readonly into: readonly string[];
}

/**
 * A window in which being attacked converts the incoming blow into a punish.
 *
 * The bait has to be a real hurtbox for this to be honest: the attacker is not
 * denied their hit by invulnerability, they are denied it by having taken it.
 */
export interface MoveCounterData {
  readonly frames: FrameRange;
  /** Move the defender is thrown into when the bait is taken. */
  readonly into: string;
  /** Frames the baited attacker is frozen for, so the read is readable. */
  readonly attackerHitstop: number;
}

export interface MoveObstacleData {
  /** Local-space obstacle volume, mirrored by fighter facing. */
  readonly box: FixedBox;
  /** The obstacle disappears after this many confirmed attack contacts. */
  readonly hitsToBreak: number;
}

export interface MoveFrameData {
  readonly id: string;
  readonly startup: number;
  readonly active: number;
  readonly recovery: number;
  readonly hitboxes: readonly AuthoredHitbox[];
  readonly hurtboxes?: readonly AuthoredHurtbox[];
  readonly cancels?: readonly CancelWindow[];
  /** Optional movement blocker active only during this move's active frames. */
  readonly obstacle?: MoveObstacleData;
  /** Energy planes this move puts into the world. */
  readonly walls?: readonly WallSpawnData[];
  /** What this move does to planes that already exist. */
  readonly wallCommand?: WallCommandData;
  /**
   * The move ignores energy planes completely — it is neither stopped by one
   * nor able to break one. Supers, ultimates and throws set this, which is the
   * counter-play that stops a wall from answering everything.
   */
  readonly wallPiercing?: boolean;
  /** Integrity removed per confirmed contact with a plane. Defaults to 1. */
  readonly wallDamage?: number;
  /** Turns an incoming blow into a punish during the authored window. */
  readonly counter?: MoveCounterData;
  /**
   * Move to continue into the instant this one lands a clean hit.
   *
   * This is how a cinematic can be gated on a confirmed hit rather than played
   * unconditionally: the follow-up simply never starts if nothing connected.
   */
  readonly onHitFollowUp?: string;
}

export type MovePhase = 'startup' | 'active' | 'recovery';

export function totalMoveFrames(move: MoveFrameData): number {
  return move.startup + move.active + move.recovery;
}

/**
 * Move length with a recovery modifier applied.
 *
 * `recoveryPercent` is an integer where 100 is unmodified, so the arithmetic
 * stays exact — a float scale here would desync two clients running the same
 * inputs. Startup and active are never scaled: shortening those would change
 * what the move *is*, not how quickly the character gets back to neutral.
 *
 * Recovery never drops below one frame, so a move can never become
 * instantaneous no matter how many stacks are held.
 */
export function effectiveMoveFrames(
  move: MoveFrameData,
  recoveryPercent: number,
): number {
  if (recoveryPercent >= 100) {
    return totalMoveFrames(move);
  }
  const scaled = Math.ceil((move.recovery * recoveryPercent) / 100);
  const recovery = move.recovery === 0 ? 0 : Math.max(1, scaled);
  return move.startup + move.active + recovery;
}

export function movePhaseAt(move: MoveFrameData, frame: number): MovePhase | null {
  if (frame < 0 || frame >= totalMoveFrames(move)) {
    return null;
  }
  if (frame < move.startup) {
    return 'startup';
  }
  if (frame < move.startup + move.active) {
    return 'active';
  }
  return 'recovery';
}
