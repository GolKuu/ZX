'use client';

import { useMemo } from 'react';
import { DoubleSide } from 'three';
import type { LoadedSpritePart } from './spriteRig';

/**
 * One sliced piece of artwork, hung so its joint sits at the parent's origin.
 *
 * The plane is offset by its pivot rather than being centred, which is what lets
 * the parent group rotate it about the joint instead of about its middle.
 *
 * `DoubleSide` is required, not cosmetic: the rig is mirrored with a negative
 * scale for a fighter facing left, which flips every winding order.
 */
export function SpritePart({
  part,
  pixelScale,
  tint,
}: {
  readonly part: LoadedSpritePart | undefined;
  readonly pixelScale: number;
  readonly tint?: string;
}) {
  const geometry = useMemo(() => {
    if (part === undefined) return null;
    const width = part.width * pixelScale;
    const height = part.height * pixelScale;
    return {
      width,
      height,
      // Pivot is measured from the top-left of the image; the plane is centred,
      // so shift it by the distance from its centre to that point.
      offsetX: (0.5 - part.pivot[0]) * width,
      offsetY: (part.pivot[1] - 0.5) * height,
    };
  }, [part, pixelScale]);

  if (part === undefined || geometry === null) return null;

  return (
    <mesh position={[geometry.offsetX, geometry.offsetY, 0]}>
      <planeGeometry args={[geometry.width, geometry.height]} />
      <meshBasicMaterial
        alphaTest={0.45}
        color={tint ?? '#ffffff'}
        map={part.texture}
        side={DoubleSide}
        toneMapped={false}
        transparent
      />
    </mesh>
  );
}
