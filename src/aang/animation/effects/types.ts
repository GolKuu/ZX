import type { EffectMotion } from '../../types';

export interface EffectAnimation {
  readonly selector: string;
  readonly keyframes: readonly Keyframe[];
}

export type EffectLibrary = Partial<Record<EffectMotion, EffectAnimation>>;
