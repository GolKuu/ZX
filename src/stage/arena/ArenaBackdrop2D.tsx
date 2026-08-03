'use client';

import { useEffect, useMemo } from 'react';
import { createPixelArenaTexture } from './pixelArenaTexture';

export function ArenaBackdrop2D() {
  const texture = useMemo(() => createPixelArenaTexture(), []);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={[0, 3.55, -18]} renderOrder={-20}>
      <planeGeometry args={[32, 18]} />
      <meshBasicMaterial depthWrite={false} fog={false} map={texture} toneMapped={false} />
    </mesh>
  );
}
