'use client';

import { useEffect, useMemo } from 'react';
import { createArenaFloorTexture } from './arenaFloorTexture';

export function RetroGridFloor() {
  const texture = useMemo(() => createArenaFloorTexture(), []);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <group position-y={-0.012}>
      <mesh position={[0, -0.025, -8.5]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[46, 34]} />
        <meshBasicMaterial color="#294e45" fog={false} />
      </mesh>
      <mesh position={[0, 0, -8.2]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[44, 32]} />
        <meshBasicMaterial fog={false} map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.018, -5.4]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[1.28, 1.48, 64]} />
        <meshBasicMaterial
          color="#f4dfa0"
          depthWrite={false}
          fog={false}
          opacity={0.74}
          toneMapped={false}
          transparent
        />
      </mesh>
    </group>
  );
}
