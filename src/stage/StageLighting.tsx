'use client';

import { ARENA_RADIUS } from './arena/arenaData';

const SHADOW_EXTENT = ARENA_RADIUS + 3.4;

export function StageLighting() {
  return (
    <>
      <hemisphereLight args={['#516da2', '#090914', 0.46]} />
      <ambientLight color="#1b2540" intensity={0.18} />

      <directionalLight
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
