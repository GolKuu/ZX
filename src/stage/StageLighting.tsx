'use client';

import { ARENA_RADIUS } from './arena/arenaData';

/**
 * Lighting is reserved for the fighters. The arena itself uses unlit planes,
 * keeping the new side-on background visibly flat and graphic.
 */

const SHADOW_EXTENT = ARENA_RADIUS + 3.4;

export function StageLighting() {
  return (
    <>
      <hemisphereLight args={['#7168a5', '#2b1727', 0.4]} />
      <ambientLight color="#332843" intensity={0.14} />

      <directionalLight
        castShadow
        color="#ffe1bd"
        intensity={3}
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

      <directionalLight
        color="#df7774"
        intensity={2.05}
        position={[4.6, 5.8, -6.2]}
      />

      <directionalLight
        color="#617ac4"
        intensity={0.8}
        position={[6.4, 2.1, 4.2]}
      />

      <pointLight
        color="#f1a275"
        decay={2}
        distance={34}
        intensity={15}
        position={[4.8, 4.8, -9]}
      />

      <pointLight
        color="#8c536e"
        decay={2}
        distance={9}
        intensity={3.2}
        position={[0, 0.55, 0.6]}
      />
    </>
  );
}
