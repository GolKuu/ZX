'use client';

import {
  Bloom,
  EffectComposer,
  SMAA,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';

/**
 * Cinematic composite for the fight presentation.
 *
 * Fighter contact is handled by local ground shadows, so the expensive
 * full-screen AO pass is intentionally absent. Bloom, grading and SMAA keep
 * the premium highlights and clean silhouettes at a much lower GPU cost.
 *
 * Order is the whole design here. Everything that describes *the scene* —
 * bloom — happens in linear light, where doubling a
 * value means twice the photons and a bloom threshold means something
 * physical. Everything that describes *the camera that filmed it* —
 * vignette, edge antialiasing — happens after the tone map, in display
 * referred values, because that is where those artefacts are formed on real
 * equipment. Fine material detail stays free of film grain or color fringing.
 */
export function PostEffects() {
  return (
    <EffectComposer multisampling={0}>
      {/* Threshold sits above the fighters' lit range and below the emissives,
          so braziers, nav strips and impact flashes bloom and skin does not.
          A lower threshold blooms the whole frame and reads as fog on a lens,
          not as light. */}
      <Bloom
        intensity={0.45}
        luminanceSmoothing={0.32}
        luminanceThreshold={1.05}
        mipmapBlur
        radius={0.85}
      />

      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette darkness={0.18} eskil={false} offset={0.34} />
      <SMAA />
    </EffectComposer>
  );
}
