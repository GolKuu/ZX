import type { FixedBox, FixedVector } from './math.js';

export interface FighterDefinition {
  readonly id: string;
  readonly team: number;
  readonly maxHealth: number;
  readonly spawn: FixedVector;
  readonly facing: -1 | 1;
  readonly hurtboxes: readonly FixedBox[];
}

export interface FighterInput {
  readonly move?: string;
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
  health: number;
  position: { x: number; y: number };
  previousPosition: { x: number; y: number };
  velocity: { x: number; y: number };
  facing: -1 | 1;
  grounded: boolean;
  hitstop: number;
  hitstun: number;
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
  readonly hitstop: number;
  readonly hitstun: number;
  readonly action: Readonly<Omit<ActiveMoveState, 'hitLedger'>> | null;
}

export interface WorldSnapshot {
  readonly frame: number;
  readonly fighters: readonly FighterSnapshot[];
}
