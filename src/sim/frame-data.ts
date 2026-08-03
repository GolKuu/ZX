import type { FixedBox, FixedVector, Ratio } from './math.js';
import type { WallCommandData, WallSpawnData } from './walls/types.js';

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
  /** Damage dealt to the guard gauge. Omitted moves use the engine default. */
  readonly guardDamage?: number;
  /** A guard-break attack defeats Pain Guard and perfect-block timing. */
  readonly guardBreak?: boolean;
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
  /** When true, the bounce is granted only if the defender was already acting. */
  readonly counterHitOnly?: boolean;
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
  /** Throw-tech windows reject grapples without countering ordinary strikes. */
  readonly grappleOnly?: boolean;
  /**
   * The mirror of `grappleOnly`: catches strikes and is beaten by throws.
   *
   * A counter stance that also answered grabs would have no counter-play at
   * all, so every parry-shaped move needs to name which half of the offence it
   * loses to.
   */
  readonly strikeOnly?: boolean;
}

export interface MoveArmourData {
  readonly frames: FrameRange;
  readonly hits: number;
  /** Percent of incoming damage kept while armour absorbs the stagger. */
  readonly damagePercent: number;
}

export interface MoveStatusData {
  readonly id: string;
  readonly durationFrames: number;
  readonly recoveryPercent: number;
  readonly resourceDrainIntervalFrames?: number;
  readonly resourceDrainAmount?: number;
  readonly armourHits?: number;
  readonly armourDamagePercent?: number;
  readonly cancelInto?: readonly string[];
  readonly cancelFrom?: readonly string[];
}

export type AttackLevel = 'high' | 'mid' | 'low' | 'throw' | 'unblockable';

export type GrappleKind =
  | 'normal'
  | 'command'
  | 'antiAir'
  | 'air'
  | 'wall'
  | 'slam'
  | 'armoured'
  | 'carry'
  | 'reposition'
  | 'escape';

/** Authored throw rules. Throws are unblockable and defeat strike armour. */
export interface MoveGrappleData {
  readonly kind: GrappleKind;
  readonly pairedFrames: number;
  readonly targetSize: 'any' | 'grounded' | 'airborne';
}

/**
 * A deterministic displacement authored on one exact action frame.
 *
 * Existing moves omit this field and keep their original physics. Teleports
 * use it instead of renderer-only tricks, so collision, side switches and
 * punish windows agree with what the player sees.
 */
export interface MoveDisplacementData {
  readonly frame: number;
  readonly offset: FixedVector;
  readonly clearVelocity?: boolean;
}

export interface AirComboRuleData {
  readonly juggleLimit: number;
  readonly hitstunDecayPerHit: number;
  readonly repeatedMoveDamagePercent: number;
}

export interface MoveObstacleData {
  /** Local-space obstacle volume, mirrored by fighter facing. */
  readonly box: FixedBox;
  /** The obstacle disappears after this many confirmed attack contacts. */
  readonly hitsToBreak: number;
}

export interface MoveFrameData {
  readonly id: string;
  readonly attackLevel?: AttackLevel;
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
  /** Recovery clip started only when this move reached its end without contact. */
  readonly onWhiffFollowUp?: string;
  /** Generic character-resource gates used by Rage and future stance meters. */
  readonly minimumResource?: number;
  readonly resourceCost?: number;
  readonly resourceGainOnHit?: number;
  readonly resourceGainOnBlock?: number;
  /** Limited, authored armour. It never removes damage or recovery entirely. */
  readonly armour?: MoveArmourData;
  readonly status?: MoveStatusData;
  /** Marks the active hitbox as a real grab instead of an unblockable strike. */
  readonly grapple?: MoveGrappleData;
  readonly displacements?: readonly MoveDisplacementData[];
  readonly airCombo?: AirComboRuleData;
  readonly cooldownFrames?: number;
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
  if (recoveryPercent === 100) {
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
