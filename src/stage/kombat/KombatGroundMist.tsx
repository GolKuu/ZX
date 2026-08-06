'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  CanvasTexture,
  Color,
  Group,
  MeshBasicMaterial,
  NormalBlending,
} from 'three';
import type { KombatTheme } from './kombatTheme';

/**
 * Haze lying on the sunken floor around the platform.
 *
 * This is the cheapest thing on the stage and it does more for the sense of a
 * real room than any of the geometry: it hides where the floor ends, it puts
 * something between the camera and the far architecture so distance is
 * readable, and it gives the fire somewhere to bloom into. Kept below the disc,
 * so it never fogs the fighters themselves.
 */
const LAYERS = [
  { y: -0.82, radius: 30, spin: 0.014 },
  { y: -0.5, radius: 24, spin: -0.021 },
  // Sits just under the lip of the bottom step and reaches past it. The step
  // ring is the strongest value break on the stage — bright lit stone against
  // the sunken floor, right where the camera's pan puts it in the corner of
  // frame — and haze lying across that seam is what a real set would have there
  // anyway.
  { y: -0.24, radius: 17, spin: 0.03 },
] as const;

function createMistTexture(): CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (context === null) return new CanvasTexture(canvas);

  context.clearRect(0, 0, size, size);
  // Overlapping soft blobs, faded to nothing at the edge of the disc so the
  // quad's own boundary can never be seen.
  for (let index = 0; index < 26; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.sqrt(Math.random()) * size * 0.36;
    const x = size / 2 + Math.cos(angle) * distance;
    const y = size / 2 + Math.sin(angle) * distance;
    const radius = size * (0.08 + Math.random() * 0.16);
    const blob = context.createRadialGradient(x, y, 0, x, y, radius);
    blob.addColorStop(0, 'rgba(255,255,255,0.5)');
    blob.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = blob;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }
  const mask = context.createRadialGradient(
    size / 2, size / 2, size * 0.22, size / 2, size / 2, size * 0.5,
  );
  mask.addColorStop(0, 'rgba(0,0,0,1)');
  mask.addColorStop(1, 'rgba(0,0,0,0)');
  context.globalCompositeOperation = 'destination-in';
  context.fillStyle = mask;
  context.fillRect(0, 0, size, size);

  return new CanvasTexture(canvas);
}

export function KombatGroundMist({ theme }: { readonly theme: KombatTheme }) {
  const root = useRef<Group>(null);
  const material = useMemo(() => {
    const texture = createMistTexture();
    return new MeshBasicMaterial({
      blending: NormalBlending,
      color: new Color(theme.mist),
      depthWrite: false,
      map: texture,
      opacity: 0.34,
      transparent: true,
    });
  }, [theme]);

  useEffect(
    () => () => {
      material.map?.dispose();
      material.dispose();
    },
    [material],
  );

  useFrame(({ clock }) => {
    const group = root.current;
    if (group === null) return;
    const time = clock.elapsedTime;
    for (let index = 0; index < group.children.length; index += 1) {
      const layer = group.children[index];
      const spin = LAYERS[index]?.spin ?? 0.02;
      if (layer !== undefined) layer.rotation.z = time * spin;
    }
  });

  return (
    <group ref={root}>
      {LAYERS.map((layer) => (
        <mesh
          key={layer.y}
          material={material}
          position={[0, layer.y, -2]}
          renderOrder={-3}
          rotation-x={-Math.PI / 2}
          scale={[layer.radius, layer.radius, 1]}
        >
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
    </group>
  );
}
