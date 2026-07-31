'use client';

import { useEffect, useMemo } from 'react';
import type { LoadedSpritePart } from '../sprite2d/spriteRig';
import { createMimCutoutMaterial } from './mimCutoutMaterial';

export function MimTexturedPart({
  part,
  pixelScale,
}: {
  readonly part: LoadedSpritePart;
  readonly pixelScale: number;
}) {
  const width = part.width * pixelScale;
  const height = part.height * pixelScale;
  const material = useMemo(
    () => createMimCutoutMaterial(part.texture),
    [part.texture],
  );

  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh
      position={[
        (0.5 - part.pivot[0]) * width,
        (part.pivot[1] - 0.5) * height,
        0,
      ]}
    >
      <planeGeometry args={[width, height]} />
      <primitive attach="material" object={material} />
    </mesh>
  );
}
