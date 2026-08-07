'use client';

import { useMemo } from 'react';
import {
  Bloom,
  BrightnessContrast,
  ChromaticAberration,
  EffectComposer,
  HueSaturation,
  Noise,
  SMAA,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import { Vector2 } from 'three';

/**
 * Lightweight cinematic composite for the 4K sprite presentation.
 *
 * Fighter contact is handled by local ground shadows, so the expensive
 * full-screen AO pass is intentionally absent. Bloom, grading and SMAA keep
 * the premium highlights and clean silhouettes at a much lower GPU cost.
 */
export function PostEffects() {
  const chromaticOffset = useMemo(() => new Vector2(0.0013, 0.0008), []);

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={1.18}
        luminanceSmoothing={0.28}
        luminanceThreshold={0.5}
        mipmapBlur
        radius={0.88}
      />

      <ChromaticAberration
        modulationOffset={0.42}
        offset={chromaticOffset}
        radialModulation
      />

      <HueSaturation hue={0} saturation={0.12} />
      <BrightnessContrast brightness={0.015} contrast={0.1} />
      <Noise blendFunction={BlendFunction.OVERLAY} opacity={0.16} premultiply />
      <Vignette darkness={0.3} eskil={false} offset={0.34} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <SMAA />
    </EffectComposer>
  );
}
