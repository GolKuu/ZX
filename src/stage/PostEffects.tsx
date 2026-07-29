'use client';

import { useMemo } from 'react';
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from '@react-three/postprocessing';
import { Vector2 } from 'three';

export function PostEffects() {
  const chromaticOffset = useMemo(() => new Vector2(0.00125, 0.00075), []);

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.9}
        luminanceThreshold={0.72}
        luminanceSmoothing={0.22}
        mipmapBlur
      />
      <ChromaticAberration
        offset={chromaticOffset}
        radialModulation
        modulationOffset={0.38}
      />
      <Vignette eskil={false} offset={0.18} darkness={0.72} />
    </EffectComposer>
  );
}
