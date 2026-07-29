'use client';

import { useMemo } from 'react';
import {
  Bloom,
  BrightnessContrast,
  ChromaticAberration,
  EffectComposer,
  HueSaturation,
  N8AO,
  SMAA,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { Vector2 } from 'three';

/**
 * Composite chain, in application order.
 *
 * Order is not cosmetic here. AO has to land before bloom, or the occlusion
 * darkening gets bloomed straight back out of existence; the grade sits after
 * bloom so the contrast curve applies to the finished image; SMAA must be last
 * because it resolves edges and anything drawn after it re-aliases them.
 *
 * The canvas requests `antialias: false` — MSAA and a depth-sampling AO pass do
 * not combine cheaply — so SMAA is not a nicety here, it is the only AA in the
 * frame.
 *
 * Tone mapping has to live *in this chain*, not on the renderer. Mounting an
 * `EffectComposer` sets `gl.toneMapping` to `NoToneMapping` so the curve can be
 * applied once, in HDR, at the end of the chain — which meant that while this
 * component was mounted the renderer's ACES setting silently did nothing and
 * the frame was written out linear. That is what blew the stage highlights to
 * flat magenta and buried the shadow contrast: everything above 1.0 clipped.
 */
export function PostEffects() {
  const chromaticOffset = useMemo(() => new Vector2(0.0011, 0.00065), []);

  return (
    <EffectComposer enableNormalPass multisampling={0}>
      {/* Contact darkening. This is the single biggest step from "assets on a
          plane" to "objects in a room": creases, the gap under a boot, the seam
          where a fighter meets the disc. Tinted violet rather than black, so
          occlusion obeys the same never-grey rule as the toon shadows. */}
      <N8AO
        aoRadius={1.15}
        color="#150a24"
        denoiseSamples={5}
        distanceFalloff={0.85}
        halfRes
        intensity={2.6}
        quality="medium"
      />

      {/* The threshold sits low enough that the rift core, the rim lights and
          the engraved ring all bleed. At the previous 0.72 effectively only
          pure white bloomed, so the stage's own light sources stayed inert. */}
      <Bloom
        intensity={0.82}
        luminanceSmoothing={0.3}
        luminanceThreshold={0.62}
        mipmapBlur
        radius={0.78}
      />

      <ChromaticAberration
        modulationOffset={0.42}
        offset={chromaticOffset}
        radialModulation
      />

      {/* Grade: a saturation lift and a contrast push to reclaim the black
          point that AO and bloom both soften. */}
      <HueSaturation hue={0} saturation={0.14} />
      <BrightnessContrast brightness={-0.015} contrast={0.14} />

      <Vignette darkness={0.66} eskil={false} offset={0.22} />

      {/* ACES rather than AgX: AgX rolls saturated highlights toward white, and
          this stage is built out of saturated highlights — the rift core and
          the rim lights are the look, and desaturating them costs more than the
          extra highlight latitude buys. */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <SMAA />
    </EffectComposer>
  );
}
