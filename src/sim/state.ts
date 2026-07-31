import type { FixedBox, FixedVector } from './math.js';
import type { WallSnapshot } from './walls/types.js';

export interface FighterDefinition {
  readonly id: string;
  readonly team: number;
  readonly maxHealth: number;
  readonly spawn: FixedVector;
  readonly facing: -1 | 1;
  readonly hurtboxes: readonly FixedBox[];
  readonly movement?: FighterMovementData;
  readonly resource?: FighterResourceData;
}

export interface FighterResourceData {
  readonly maximum: number;
  readonly initial?: number;
  /** Percent of real damage converted to resource. */
  readonly damageTakenPercent: number;
  readonly counterHitBonus?: number;
  readonly perfectBlockGain?: number;
  readonly painGuardChipPercent?: number;
  readonly painGuardCost?: number;
  readonly guardBreakLoss?: number;
  readonly guardBreakLockFrames?: number;
  readonly drainAtMaximumPerFrame?: number;
}

export interface FighterMovementData {
  readonly forwardPerFrame: number;
  readonly backwardPerFrame: number;
  readonly jumpPerFrame: number;
}

export interface FighterInput {
  readonly move?: string;
  readonly movement?: -1 | 0 | 1;
  readonly guard?: boolean;
  readonly guardMode?: GuardMode;
  readonly jump?: boolean;
  /** Ground dash request on the press frame, facing-relative: 1 forward, −1 back. */
  readonly dash?: -1 | 0 | 1;
  /** Asks to mount a runnable energy plane this frame. */
  readonly wallMount?: boolean;
  /** While mounted: −1 descend, 0 hold, 1 climb. */
  readonly wallClimb?: -1 | 0 | 1;
  /** While mounted: leave forward (1) or backward (−1) without jumping. */
  readonly wallExit?: -1 | 0 | 1;
  /** While mounted: kick off the plane. Up plus a horizontal, never up alone. */
  readonly wallJump?: boolean;
}

/**
 * Phases of the wall-run machine. Each one owns its own physics, so none of
 * them may be collapsed into the ordinary jump states.
 */
export type WallRunPhase =
  | 'none'
  | 'contact'
  | 'runStart'
  | 'runLoop'
  | 'runUp'
  | 'runDown'
  | 'pause';

export interface WallRunState {
  phase: WallRunPhase;
  wallId: number | null;
  frame: number;
  climb: -1 | 0 | 1;
}

export type CombatInputs = Readonly<Record<string, FighterInput | undefined>>;

export interface ActiveMoveState {
  moveId: string;
  frame: number;
  serial: number;
  hitLedger: string[];
  armourHitsUsed: number;
}

export interface BounceState {
  wallRemaining: number;
  wallHorizontalSpeed: number;
  wallVerticalSpeed: number;
  wallMinimumHitstun: number;
  groundRemaining: number;
  groundVerticalSpeed: number;
  groundHorizontalNumerator: number;
  groundHorizontalDenominator: number;
  groundMinimumHitstun: number;
}

export interface MutableFighterState {
  readonly id: string;
  readonly team: number;
  readonly maxHealth: number;
  readonly defaultHurtboxes: readonly FixedBox[];
  readonly movement: FighterMovementData;
  health: number;
  position: { x: number; y: number };
  previousPosition: { x: number; y: number };
  velocity: { x: number; y: number };
  facing: -1 | 1;
  grounded: boolean;
  guarding: boolean;
  guardMode: GuardMode;
  guardFrames: number;
  guardHealth: number;
  hitstop: number;
  hitstun: number;
  /**
   * Recovery-length modifier as an integer percentage; 100 is unmodified.
   * Driven by character passives (Frame Inertia). Integer so the simulation
   * stays exact.
   */
  recoveryPercent: number;
  resource: number;
  resourceMaximum: number;
  resourceLockFrames: number;
  readonly resourceRules: FighterResourceData | null;
  /** Dash frames left; 0 when not dashing. */
  dashFrames: number;
  dashDirection: -1 | 0 | 1;
  /** Frames of dash momentum left inside the current move — the dash attack. */
  lungeFrames: number;
  action: ActiveMoveState | null;
  bounce: BounceState;
  wallRun: WallRunState;
}

export interface FighterSnapshot {
  readonly id: string;
  readonly team: number;
  readonly health: number;
  readonly maxHealth: number;
  readonly position: FixedVector;
  readonly previousPosition: FixedVector;
  readonly velocity: FixedVector;
  readonly facing: -1 | 1;
  readonly grounded: boolean;
  readonly guarding: boolean;
  readonly guardMode: GuardMode;
  readonly guardHealth: number;
  readonly resource: number;
  readonly resourceMaximum: number;
  readonly resourceLockFrames: number;
  /** Dash frames left; 0 when not dashing. Animation reads it as a timeline. */
  readonly dashFrames: number;
  readonly hitstop: number;
  readonly hitstun: number;
  readonly action: Readonly<Omit<ActiveMoveState, 'hitLedger'>> | null;
  /** Animation reads this to pick a wall clip instead of a jump clip. */
  readonly wallRun: Readonly<WallRunState>;
}

export type GuardMode = 'normal' | 'pain';

export interface WorldSnapshot {
  readonly frame: number;
  readonly fighters: readonly FighterSnapshot[];
  readonly walls: readonly WallSnapshot[];
}
