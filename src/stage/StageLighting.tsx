'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { MathUtils, type DirectionalLight, type PointLight } from 'three';
import { ARENA_RADIUS } from './arena/arenaData';
import { useRenderStore } from '@/src/store/renderStore';

const SHADOW_EXTENT = ARENA_RADIUS + 3.4;
const HARMONIC_RATE = 4.7;

export function StageLighting() {
  const keyLightRef = useRef<DirectionalLight>(null);
  const impactPulseRef = useRef<PointLight>(null);
  const superPulseRef = useRef<PointLight>(null);
  const superWashRef = useRef<PointLight>(null);

  const impactVersion = useRenderStore((state) => state.impactVersion);
  const superVersion = useRenderStore(
    (state) =>
      state.mimSuperVersion
      + state.echoSuperVersion
      + state.chronoSuperVersion
      + state.glitchSuperVersion,
  );
  const impactVersionRef = useRef(impactVersion);
  const superVersionRef = useRef(superVersion);
  const impactEnergy = useRef(0);
  const superEnergy = useRef(0);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    if (impactVersion !== impactVersionRef.current) {
      impactVersionRef.current = impactVersion;
      impactEnergy.current = 1;
    }
    if (superVersion !== superVersionRef.current) {
      superVersionRef.current = superVersion;
      superEnergy.current = 1;
    }

    impactEnergy.current = Math.max(0, impactEnergy.current - delta * 2.1);
    superEnergy.current = Math.max(0, superEnergy.current - delta * 1.35);

    const impactPulse = MathUtils.smoothstep(0.06, 1, impactEnergy.current);
    const superPulse = MathUtils.smoothstep(0.04, 1, superEnergy.current);
    const rimPulse = Math.max(impactPulse, superPulse * 1.2);

    const breathing = 0.5 + Math.sin(time * 0.4) * 0.02;
    const key = keyLightRef.current;
    const impactPulseLight = impactPulseRef.current;
    const superPulseLight = superPulseRef.current;
    const superWash = superWashRef.current;
    if (key !== null) {
      key.intensity = MathUtils.lerp(2.95, 4.35, rimPulse);
      key.color.setHSL(0.07 + superPulse * 0.1 + impactPulse * 0.05, 0.25, 0.55 + rimPulse * 0.15);
      key.shadow.radius = MathUtils.lerp(2.6, 3.2, rimPulse);
    }
    if (impactPulseLight !== null) {
      impactPulseLight.intensity = MathUtils.lerp(0.1, 3.4, impactPulse);
      impactPulseLight.color.setHSL(
        0.71,
        MathUtils.lerp(0.6, 0.75, rimPulse),
        MathUtils.lerp(0.72, 0.85, impactPulse),
      );
    }
    if (superPulseLight !== null) {
      superPulseLight.intensity = MathUtils.lerp(0.2, 6.2, superPulse);
      superPulseLight.color.setHSL(
        0.58 - superPulse * 0.03,
        0.84,
        0.5 + superPulse * 0.16,
      );
    }
    if (superWash !== null) {
      superWash.intensity = 0.8 + superPulse * 1.2 + impactPulse * 0.24;
      superWash.color.setHSL(
        0.58 - superPulse * 0.08,
        0.66,
        0.42 + superPulse * 0.12,
      );
    }

    if (key !== null) {
      const keyWave = (Math.sin(time * HARMONIC_RATE + breathing) + 1) * 0.5;
      key.position.set(
        MathUtils.lerp(-5.2, -4.8, 0.5 + rimPulse * 0.5),
        MathUtils.lerp(8.6, 9.1, rimPulse),
        MathUtils.lerp(5.4, 5.0 + keyWave * 0.16, impactPulse),
      );
    }
  });

  return (
    <>
      <hemisphereLight args={['#516da2', '#090914', 0.46]} />
      <ambientLight color="#1b2540" intensity={0.18} />

      <directionalLight
        ref={keyLightRef}
        castShadow
        color="#ffe8c9"
        intensity={3.25}
        position={[-5.2, 8.6, 5.4]}
        shadow-bias={-0.0006}
        shadow-camera-bottom={-SHADOW_EXTENT}
        shadow-camera-far={34}
        shadow-camera-left={-SHADOW_EXTENT}
        shadow-camera-near={0.5}
        shadow-camera-right={SHADOW_EXTENT}
        shadow-camera-top={SHADOW_EXTENT}
        shadow-mapSize-height={2048}
        shadow-mapSize-width={2048}
        shadow-normalBias={0.028}
        shadow-radius={3}
      />
      <pointLight
        ref={impactPulseRef}
        color="#d8cbff"
        decay={2}
        distance={25}
        intensity={0}
        position={[0, 4.4, -0.2]}
      />
      <pointLight
        ref={superPulseRef}
        color="#7be8ff"
        decay={2}
        distance={38}
        intensity={0}
        position={[0, 6.1, 5.2]}
      />
      <pointLight
        ref={superWashRef}
        color="#ffe9a2"
        decay={2}
        distance={28}
        intensity={0}
        position={[0, 2.6, 0.2]}
      />

      <directionalLight
        color="#697bff"
        intensity={1.65}
        position={[4.6, 5.8, -6.2]}
      />

      <directionalLight
        color="#43cfff"
        intensity={1.05}
        position={[6.4, 2.1, 4.2]}
      />

      <pointLight
        color="#7b5cff"
        decay={2}
        distance={34}
        intensity={12}
        position={[-4.8, 4.8, -9]}
      />

      <pointLight
        color="#1e9bd1"
        decay={2}
        distance={9}
        intensity={2.8}
        position={[0, 0.55, 0.6]}
      />
    </>
  );
}
