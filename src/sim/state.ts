import type { FixedBox, FixedVector } from './math.js';

export interface FighterDefinition {
  readonly id: string;
  readonly team: number;
  readonly maxHealth: number;
  readonly spawn: FixedVector;
  readonly facing: -1 | 1;
  readonly hurtboxes: readonly FixedBox[];
  readonly movement?: FighterMovementData;
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
  readonly jump?: boolean;
  /** Ground dash request on the press frame, facing-relative: 1 forward, −1 back. */
  readonly dash?: -1 | 0 | 1;
}

export type CombatInputs = Readonly<Record<string, FighterInput | undefined>>;

export interface ActiveMoveState {
  moveId: string;
  frame: number;
  serial: number;
  hitLedger: string[];
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
  hitstop: number;
  hitstun: number;
  /**
   * Recovery-length modifier as an integer percentage; 100 is unmodified.
   * Driven by character passives (Frame Inertia). Integer so the simulation
   * stays exact.
   */
  recoveryPercent: number;
  /** Dash frames left; 0 when not dashing. */
  dashFrames: number;
  dashDirection: -1 | 0 | 1;
  /** Frames of dash momentum left inside the current move — the dash attack. */
  lungeFrames: number;
  action: ActiveMoveState | null;
  bounce: BounceState;
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
  /** Dash frames left; 0 when not dashing. Animation reads it as a timeline. */
  readonly dashFrames: number;
  readonly hitstop: number;
  readonly hitstun: number;
  readonly action: Readonly<Omit<ActiveMoveState, 'hitLedger'>> | null;
}

export interface WorldSnapshot {
  readonly frame: number;
  readonly fighters: readonly FighterSnapshot[];
}
