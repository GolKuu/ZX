'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { BackSide, Color, ShaderMaterial, type IUniform } from 'three';
import { domeFragment, domeVertex } from './arenaShaders';

export function StormDome() {
  const timeUniform = useRef<IUniform<number> | null>(null);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uTop: { value: new Color('#090613') },
          uHorizon: { value: new Color('#2d114d') },
          uStorm: { value: new Color('#8f35d7') },
          uTime: { value: 0 },
        },
        vertexShader: domeVertex,
        fragmentShader: domeFragment,
        side: BackSide,
        depthWrite: false,
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
    <mesh material={material} renderOrder={-10}>
      <sphereGeometry args={[52, 32, 20]} />
    </mesh>
  );
}
