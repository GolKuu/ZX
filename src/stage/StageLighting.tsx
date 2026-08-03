'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { MathUtils, type DirectionalLight, type PointLight } from 'three';
import { ARENA_RADIUS } from './arena/arenaData';
import { useRenderStore } from '@/src/store/renderStore';

const SHADOW_EXTENT = ARENA_RADIUS + 3.4;

export function StageLighting() {
  const keyLightRef = useRef<DirectionalLight>(null);
  const impactPulseRef = useRef<PointLight>(null);
  const superPulseRef = useRef<PointLight>(null);
  const superWashRef = useRef<PointLight>(null);

  const impactVersion = useRenderStore((state) => state.impactVersion);
  const superVersion = useRenderStore(
    (state) =>
      state.mimSuperVersion
      + state.glitchSuperVersion,
  );
  const impactVersionRef = useRef(impactVersion);
  const superVersionRef = useRef(superVersion);
  const impactEnergy = useRef(0);
  const superEnergy = useRef(0);

  useFrame((_, delta) => {
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

    const key = keyLightRef.current;
    const impactPulseLight = impactPulseRef.current;
    const superPulseLight = superPulseRef.current;
    const superWash = superWashRef.current;
    if (key !== null) {
      key.intensity = MathUtils.lerp(2.75, 3.45, rimPulse);
      key.shadow.radius = MathUtils.lerp(2.6, 3.2, rimPulse);
    }
    if (impactPulseLight !== null) {
      impactPulseLight.intensity = MathUtils.lerp(0, 1.6, impactPulse);
    }
    if (superPulseLight !== null) {
      superPulseLight.intensity = MathUtils.lerp(0, 3.4, superPulse);
    }
    if (superWash !== null) {
      superWash.intensity = superPulse * 0.7 + impactPulse * 0.12;
    }
  });

  return (
    <>
      <hemisphereLight args={['#9aa8c4', '#090914', 0.38]} />
      <ambientLight color="#394052" intensity={0.16} />

      <directionalLight
        ref={keyLightRef}
        castShadow
        color="#ffe8c9"
        intensity={2.75}
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
        color="#f3f0e8"
        decay={2}
        distance={25}
        intensity={0}
        position={[0, 4.4, -0.2]}
      />
      <pointLight
        ref={superPulseRef}
        color="#b8dfff"
        decay={2}
        distance={38}
        intensity={0}
        position={[0, 6.1, 5.2]}
      />
      <pointLight
        ref={superWashRef}
        color="#ffe9c7"
        decay={2}
        distance={28}
        intensity={0}
        position={[0, 2.6, 0.2]}
      />

      <directionalLight
        color="#8794b8"
        intensity={0.75}
        position={[4.6, 5.8, -6.2]}
      />

      <directionalLight
        color="#b8c6dc"
        intensity={0.42}
        position={[6.4, 2.1, 4.2]}
      />

      <pointLight
        color="#66708c"
        decay={2}
        distance={34}
        intensity={3.2}
        position={[-4.8, 4.8, -9]}
      />

      <pointLight
        color="#8290a8"
        decay={2}
        distance={9}
        intensity={1.1}
        position={[0, 0.55, 0.6]}
      />
    </>
  );
}
