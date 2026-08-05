'use client';

import { useEffect, useMemo } from 'react';
import { createPixelArenaTexture } from './pixelArenaTexture';

export function ArenaBackdrop2D() {
  const texture = useMemo(() => createPixelArenaTexture(), []);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <group renderOrder={-20}>
      <mesh position={[0, 4.2, -22]}>
        <planeGeometry args={[64, 36]} />
        <meshBasicMaterial depthWrite={false} fog={false} map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, -3.6, -20.5]}>
        <planeGeometry args={[68, 12]} />
        <meshBasicMaterial color="#315e50" depthWrite={false} fog={false} />
      </mesh>
    </group>
  );
}
