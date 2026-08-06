'use client';

import { useMemo } from 'react';
import {
  Bloom,
  BrightnessContrast,
  ChromaticAberration,
  EffectComposer,
  HueSaturation,
  N8AO,
  Noise,
  SMAA,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
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
 * applied once, in HDR, at the end of the chain.
 *
 * The grade is a dark-room grade now. The stage is lit by one key, some fire and
 * two coloured rims against near-black stone, and the whole look lives in the
 * gap between those highlights and the dark — so this chain is tuned to protect
 * that gap rather than to even the picture out.
 */
export function PostEffects() {
  const chromaticOffset = useMemo(() => new Vector2(0.0013, 0.0008), []);

  return (
    <EffectComposer multisampling={0}>
      {/* Contact darkening. This is the single biggest step from "assets on a
          plane" to "objects in a room": creases, the gap under a boot, the seam
          where a fighter meets the disc. */}
      {/* Half resolution, with the denoiser turned up to pay for it.
          Full res costs roughly a third of the frame budget on integrated
          graphics, and AO is the one pass whose job — darkening the seam where
          two surfaces meet — survives being resolved at half the pixels. The
          radius is tighter than it was so the darkening describes contact
          instead of pooling across the open floor. */}
      <N8AO
        aoRadius={0.42}
        color="#0b0a14"
        denoiseSamples={8}
        distanceFalloff={0.9}
        halfRes
        intensity={0.95}
        quality="medium"
      />

      {/* Bloom carries the look. Fire, rim lights, the disc's engraving and
          every impact spark are the only bright things in the frame, so the
          threshold sits low and the radius wide — that spill is what makes a
          dark stage read as *lit* instead of as underexposed. */}
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

      {/* Cool the shadows, keep the fire warm. A single hue rotation would drag
          the fighters with it, so the work is done with contrast and a light
          saturation lift instead. */}
      <HueSaturation hue={0} saturation={0.12} />
      <BrightnessContrast brightness={-0.02} contrast={0.16} />

      {/* Grain, at the threshold of visibility. Digital black is perfectly flat
          and reads as *missing* rather than as dark; a little noise in the
          shadows is what makes an underlit frame look photographed. */}
      <Noise blendFunction={BlendFunction.OVERLAY} opacity={0.16} premultiply />

      {/* Fighters live near the frame edges whenever the camera is panned, so
          the vignette stays gentle — it shapes the corners, it does not dim
          whichever fighter the player is watching. */}
      <Vignette darkness={0.42} eskil={false} offset={0.3} />

      {/* ACES rather than AgX: AgX rolls saturated highlights toward white, and
          this stage is built out of saturated highlights — the fire and the rim
          lights are the look, and desaturating them costs more than the extra
          highlight latitude buys. */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <SMAA />
    </EffectComposer>
  );
}
