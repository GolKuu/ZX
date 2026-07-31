import type { MoveFrameData } from '../../sim/frame-data.js';

export type VorghAttackLevel = 'high' | 'mid' | 'low' | 'throw' | 'unblockable';
export type VorghRageTier = 'low' | 'medium' | 'high' | 'berserk';

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
