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
 * Cinematic composite for the fight presentation.
 *
 * Fighter contact is handled by local ground shadows, so the expensive
 * full-screen AO pass is intentionally absent. Bloom, grading and SMAA keep
 * the premium highlights and clean silhouettes at a much lower GPU cost.
 *
 * Order is the whole design here. Everything that describes *the scene* —
 * bloom, saturation, contrast — happens in linear light, where doubling a
 * value means twice the photons and a bloom threshold means something
 * physical. Everything that describes *the camera that filmed it* — grain,
 * vignette, edge antialiasing — happens after the tone map, in display
 * referred values, because that is where those artefacts are formed on real
 * equipment. Grain applied before the tone curve is squashed by it, which is
 * why it previously had to be dialled up until it looked like video noise.
 */
export function PostEffects() {
  const chromaticOffset = useMemo(() => new Vector2(0.0013, 0.0008), []);

  return (
    <EffectComposer multisampling={0}>
      {/* Threshold sits above the fighters' lit range and below the emissives,
          so braziers, nav strips and impact flashes bloom and skin does not.
          A lower threshold blooms the whole frame and reads as fog on a lens,
          not as light. */}
      <Bloom
        intensity={1.05}
        luminanceSmoothing={0.32}
        luminanceThreshold={0.62}
        mipmapBlur
        radius={0.85}
      />

      <ChromaticAberration
        modulationOffset={0.42}
        offset={chromaticOffset}
        radialModulation
      />

      <HueSaturation hue={0} saturation={0.12} />
      <BrightnessContrast brightness={0.015} contrast={0.1} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />

      {/* Post-tone-map, and far weaker than it was.
          At 0.16 this was not film grain, it was video noise: strong enough to
          crawl over flat floor panels and to be the first thing the eye found
          in a still. Its real job is much narrower — breaking up the smooth
          gradients on the floor and sky so they band into steps instead of
          rolling off. A few percent does that, and the tone curve is no longer
          eating most of it. */}
      <Noise blendFunction={BlendFunction.OVERLAY} opacity={0.045} premultiply />
      <Vignette darkness={0.3} eskil={false} offset={0.34} />
      <SMAA />
    </EffectComposer>
  );
}
