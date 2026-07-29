import type { FixedBox, FixedVector, Ratio } from './math.js';

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

export interface MoveFrameData {
  readonly id: string;
  readonly startup: number;
  readonly active: number;
  readonly recovery: number;
  readonly hitboxes: readonly AuthoredHitbox[];
  readonly hurtboxes?: readonly AuthoredHurtbox[];
  readonly cancels?: readonly CancelWindow[];
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
