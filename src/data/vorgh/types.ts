import type { AttackLevel, MoveFrameData } from '../../sim/frame-data.js';

export type VorghAttackLevel = AttackLevel;
export type VorghRageTier = 'low' | 'medium' | 'charged' | 'high' | 'berserk';

export interface VorghPresentation {
  readonly animation: string;
  readonly vfx: readonly string[];
  readonly sounds: readonly string[];
  readonly camera: readonly string[];
}

export interface VorghMoveSpec {
  readonly move: MoveFrameData;
  readonly name: string;
  readonly attackLevel: VorghAttackLevel;
  readonly rageGain: number;
  readonly rageCost: number;
  readonly presentation: VorghPresentation;
}
