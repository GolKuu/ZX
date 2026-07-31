import type {
  GroundBounceData,
  MoveArmourData,
  MoveDisplacementData,
  WallBounceData,
} from '../../sim/frame-data.js';

export type GlitchHitLevel = 'high' | 'mid' | 'low' | 'overhead' | 'throw';
export type GlitchCameraEvent = 'none' | 'nudge' | 'shake' | 'freeze' | 'cinematic';

export interface GlitchHit {
  readonly id: string;
  readonly from: number;
  readonly to: number;
  readonly box: readonly [number, number, number, number];
  readonly level: GlitchHitLevel;
  readonly damage: number;
  readonly hitstun: number;
  readonly blockstun?: number;
  readonly hitstop: readonly [number, number];
  readonly knockback: readonly [number, number];
  readonly blockKnockback?: readonly [number, number];
  readonly chip?: number;
  readonly guardDamage?: number;
  readonly wallBounce?: WallBounceData;
  readonly groundBounce?: GroundBounceData;
}

export interface GlitchHurt {
  readonly from: number;
  readonly to: number;
  /** Empty during the short intangible section of a teleport. */
  readonly boxes: readonly (readonly [number, number, number, number])[];
}

export interface GlitchCancel {
  readonly from: number;
  readonly to: number;
  readonly into: readonly string[];
  readonly limit?: number;
}

export interface GlitchPresentation {
  readonly animation: string;
  readonly vfx: string;
  readonly startupSound: string;
  readonly impactSound: string;
  readonly camera: GlitchCameraEvent;
}

export interface GlitchMoveRow {
  readonly id: string;
  readonly startup: number;
  readonly active: number;
  readonly recovery: number;
  readonly hits?: readonly GlitchHit[];
  readonly hurtboxes?: readonly GlitchHurt[];
  readonly cancels?: readonly GlitchCancel[];
  readonly displacements?: readonly MoveDisplacementData[];
  readonly armour?: MoveArmourData;
  readonly meterCost?: number;
  readonly onHitFollowUp?: string;
  readonly presentation: GlitchPresentation;
  readonly tags: readonly string[];
}

export interface GlitchMoveDefinition {
  readonly id: string;
  readonly startup: number;
  readonly active: number;
  readonly recovery: number;
  readonly hitLevels: readonly GlitchHitLevel[];
  readonly cancelLimit: number;
  readonly presentation: GlitchPresentation;
  readonly tags: readonly string[];
}
