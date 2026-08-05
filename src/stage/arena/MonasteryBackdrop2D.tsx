'use client';

import { useEffect, useMemo } from 'react';
import { createMonasteryTexture } from './monasteryTexture';

export function MonasteryBackdrop2D() {
  const texture = useMemo(() => createMonasteryTexture(), []);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <group renderOrder={-20}>
      <mesh position={[0, 4.15, -22]}>
        <planeGeometry args={[64, 36]} />
        <meshBasicMaterial depthWrite={false} fog={false} map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, -3.7, -20.5]}>
        <planeGeometry args={[68, 12]} />
        <meshBasicMaterial color="#201b16" depthWrite={false} fog={false} />
      </mesh>
    </group>
  );
}
