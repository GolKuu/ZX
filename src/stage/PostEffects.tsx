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
    <EffectComposer multisampling={0}>
      {/* Contact darkening. This is the single biggest step from "assets on a
          plane" to "objects in a room": creases, the gap under a boot, the seam
          where a fighter meets the disc. Tinted violet rather than black, so
          occlusion obeys the same never-grey rule as the toon shadows. */}
      {/* Intensity was 2.6 — around two and a half times a normal setting. At
          that strength AO stops describing contact and starts painting: two
          fighters standing a metre apart occlude each other so heavily that both
          went solid black, while the open floor kept its colour. That single
          value, not the shading, is why the characters never matched their
          sheets. Radius is down too — 1.15 m reached across the whole gap
          between the pair. */}
      <N8AO
        aoRadius={0.55}
        color="#150a24"
        denoiseSamples={5}
        distanceFalloff={1.1}
        halfRes
        intensity={0.9}
        quality="medium"
      />

      {/* The threshold sits low enough that the rift core, the rim lights and
          the engraved ring all bleed. At the previous 0.72 effectively only
          pure white bloomed, so the stage's own light sources stayed inert. */}
      <Bloom
        intensity={0.78}
        luminanceSmoothing={0.32}
        luminanceThreshold={0.64}
        mipmapBlur
        radius={0.82}
      />

      <ChromaticAberration
        modulationOffset={0.42}
        offset={chromaticOffset}
        radialModulation
      />

      {/* Grade: gentle now. The old +0.14 saturation was clipping the middle
          channel of every violet to zero — sampled floor pixels came back as
          (58, 0, 151), which is not a colour any palette in this project
          contains. Contrast eased for the same reason: stacked on AO and the
          vignette it was crushing the shade band out of the characters. */}
      <HueSaturation hue={0} saturation={0.06} />
      <BrightnessContrast brightness={0} contrast={0.075} />

      {/* Fighters live near the frame edges whenever the camera is panned, so a
          0.66 vignette was dimming whichever one the player was watching. */}
      <Vignette darkness={0.24} eskil={false} offset={0.38} />

      {/* ACES rather than AgX: AgX rolls saturated highlights toward white, and
          this stage is built out of saturated highlights — the rift core and
          the rim lights are the look, and desaturating them costs more than the
          extra highlight latitude buys. */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <SMAA />
    </EffectComposer>
  );
}
