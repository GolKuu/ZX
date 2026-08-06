'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { MathUtils, type DirectionalLight, type PointLight } from 'three';
import { ARENA_RADIUS } from './arena/arenaData';
import { FighterRimLights } from './kombat/FighterRimLights';
import { kombatTheme } from './kombat/kombatTheme';
import { useRenderStore } from '@/src/store/renderStore';
import type { ArenaId } from '@/src/data/arenas';

const SHADOW_EXTENT = ARENA_RADIUS + 3.4;

/**
 * Cinematic rig: one hard key, coloured rims, everything else dark.
 *
 * The rig this replaces lit the stage from six directions at once. That is the
 * safe way to light a scene and the reason nothing in it had a shadow side —
 * with light arriving from everywhere, a fighter's silhouette is filled in from
 * behind and dissolves into the set. The rule here is the one a fight is shot
 * with: *one* source describes the form, a rim separates it from the
 * background, and the fill is only strong enough to keep the shadows off black.
 *
 * Ambient totals stay deliberately low. On a dark stage the fire, the rims and
 * the impact flashes carry the exposure, and that contrast is the look.
 */
export function StageLighting({ arenaId }: { readonly arenaId: ArenaId }) {
  const keyLightRef = useRef<DirectionalLight>(null);
  const impactPulseRef = useRef<PointLight>(null);
  const superPulseRef = useRef<PointLight>(null);
  const superWashRef = useRef<PointLight>(null);

  const impactVersion = useRenderStore((state) => state.impactVersion);
  const superVersion = useRenderStore(
    (state) => state.mimSuperVersion + state.glitchSuperVersion,
  );
  const impactVersionRef = useRef(impactVersion);
  const superVersionRef = useRef(superVersion);
  const impactEnergy = useRef(0);
  const superEnergy = useRef(0);
  const theme = kombatTheme(arenaId);

  useFrame((_, delta) => {
    if (impactVersion !== impactVersionRef.current) {
      impactVersionRef.current = impactVersion;
      impactEnergy.current = 1;
    }
    if (superVersion !== superVersionRef.current) {
      superVersionRef.current = superVersion;
      superEnergy.current = 1;
    }

    // Fast decay: a flash that lingers stops reading as a blow landing and
    // starts reading as the room getting brighter.
    impactEnergy.current = Math.max(0, impactEnergy.current - delta * 3.4);
    superEnergy.current = Math.max(0, superEnergy.current - delta * 1.5);

    const impactPulse = MathUtils.smoothstep(0.06, 1, impactEnergy.current);
    const superPulse = MathUtils.smoothstep(0.04, 1, superEnergy.current);

    const key = keyLightRef.current;
    if (key !== null) {
      key.intensity = MathUtils.lerp(2.5, 3.5, Math.max(impactPulse, superPulse));
    }
    const impactPulseLight = impactPulseRef.current;
    if (impactPulseLight !== null) {
      impactPulseLight.intensity = impactPulse * 26;
    }
    const superPulseLight = superPulseRef.current;
    if (superPulseLight !== null) {
      superPulseLight.intensity = superPulse * 22;
    }
    const superWash = superWashRef.current;
    if (superWash !== null) {
      superWash.intensity = superPulse * 6 + impactPulse * 1.4;
    }
  });

  return (
    <>
      {/* Sky/ground bounce, not illumination. Enough that the stone's shadow
          side is a colour rather than a hole. */}
      <hemisphereLight args={[theme.bounce, theme.stoneShadow, 0.42]} />
      <ambientLight color={theme.bounce} intensity={0.12} />

      {/* Key. High, front-left, hard: it draws the fighters' lit side and drops
          their cast shadow back and to the right across the disc. */}
      <directionalLight
        ref={keyLightRef}
        castShadow
        color={theme.key}
        intensity={2.5}
        position={[-6.2, 9.4, 6.6]}
        shadow-bias={-0.0006}
        shadow-camera-bottom={-SHADOW_EXTENT}
        shadow-camera-far={38}
        shadow-camera-left={-SHADOW_EXTENT}
        shadow-camera-near={0.5}
        shadow-camera-right={SHADOW_EXTENT}
        shadow-camera-top={SHADOW_EXTENT}
        {/* 1024, not 2048. The soft PCF kernel blurs a shadow across several
            texels anyway, so the extra resolution was being filtered straight
            back off — it cost a quarter of the frame on integrated graphics and
            produced an image nobody could tell apart. */}
        shadow-mapSize-height={1024}
        shadow-mapSize-width={1024}
        shadow-normalBias={0.028}
        shadow-radius={3}
      />

      {/* Stage-wide back rim. Catches the tops of the columns and the arcade so
          the architecture reads as edges against the sky rather than as mass. */}
      <directionalLight color={theme.rimCool} intensity={1.35} position={[5.4, 6.2, -8.4]} />
      <directionalLight color={theme.rimWarm} intensity={0.85} position={[-5.8, 3.6, -7.2]} />

      {/* Fill from the floor, warm, very low: keeps the fighters' undersides
          from crushing without touching the key's modelling. */}
      <pointLight
        color={theme.fire}
        decay={2}
        distance={13}
        intensity={2.4}
        position={[0, -0.4, 2.4]}
      />

      <FighterRimLights theme={theme} />

      <pointLight
        ref={impactPulseRef}
        color="#fff4e2"
        decay={2}
        distance={16}
        intensity={0}
        position={[0, 1.8, 1.6]}
      />
      <pointLight
        ref={superPulseRef}
        color={theme.rimCool}
        decay={2}
        distance={30}
        intensity={0}
        position={[0, 4.2, 3.4]}
      />
      <pointLight
        ref={superWashRef}
        color={theme.fireCore}
        decay={2}
        distance={24}
        intensity={0}
        position={[0, 2.2, -1.2]}
      />
    </>
  );
}
