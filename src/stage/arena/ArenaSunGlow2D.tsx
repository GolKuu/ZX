'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  CanvasTexture,
  MeshBasicMaterial,
  SRGBColorSpace,
} from 'three';

function createSunGlowTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (context === null) return new CanvasTexture(canvas);

  const gradient = context.createRadialGradient(128, 128, 6, 128, 128, 126);
  gradient.addColorStop(0, 'rgba(255, 250, 190, 1)');
  gradient.addColorStop(0.14, 'rgba(255, 224, 112, 0.9)');
  gradient.addColorStop(0.42, 'rgba(255, 170, 72, 0.34)');
  gradient.addColorStop(1, 'rgba(255, 130, 40, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function ArenaSunGlow2D() {
  const materialRef = useRef<MeshBasicMaterial>(null);
  const texture = useMemo(() => createSunGlowTexture(), []);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(({ clock }) => {
    const material = materialRef.current;
    if (material === null) return;
    material.opacity = 0.78 + Math.sin(clock.elapsedTime * 0.72) * 0.06;
  });

  return (
    <mesh position={[7.75, 5.65, -17.4]} renderOrder={-18}>
      <planeGeometry args={[9.4, 9.4]} />
      <meshBasicMaterial
        ref={materialRef}
        blending={AdditiveBlending}
        depthTest={false}
        depthWrite={false}
        map={texture}
        opacity={0.82}
        toneMapped={false}
        transparent
      />
    </mesh>
  );
}
