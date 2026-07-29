'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  ShaderMaterial,
  type IUniform,
} from 'three';
import { shaftFragment, shaftVertex } from './arenaShaders';

const SHAFTS = [
  { x: -3.7, y: 3.8, width: 3.2, height: 15, rotation: -0.34 },
  { x: 0.2, y: 4.7, width: 4.4, height: 17, rotation: 0.03 },
  { x: 4.1, y: 3.6, width: 3.0, height: 14, rotation: 0.36 },
] as const;

export function LightShafts() {
  const timeUniform = useRef<IUniform<number> | null>(null);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uColor: { value: new Color('#b95cff') },
          uTime: { value: 0 },
        },
        vertexShader: shaftVertex,
        fragmentShader: shaftFragment,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        side: DoubleSide,
        blending: AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );

  useEffect(() => {
    timeUniform.current = material.uniforms.uTime ?? null;
    return () => material.dispose();
  }, [material]);

  useFrame(({ clock }) => {
    if (timeUniform.current !== null) {
      timeUniform.current.value = clock.elapsedTime;
    }
  });

  return (
    <group position-z={-11.5} renderOrder={-6}>
      {SHAFTS.map((shaft) => (
        <mesh
          key={shaft.x}
          material={material}
          position={[shaft.x, shaft.y, 0]}
          rotation-z={shaft.rotation}
        >
          <planeGeometry args={[shaft.width, shaft.height, 1, 1]} />
        </mesh>
      ))}
    </group>
  );
}
