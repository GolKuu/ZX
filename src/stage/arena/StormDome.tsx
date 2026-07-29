'use client';

import { useEffect, useMemo } from 'react';
import { BackSide, Color, ShaderMaterial } from 'three';
import { domeFragment, domeVertex } from './arenaShaders';

export function StormDome() {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uTop: { value: new Color('#090613') },
          uHorizon: { value: new Color('#2d114d') },
          uStorm: { value: new Color('#8f35d7') },
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
    return () => material.dispose();
  }, [material]);

  return (
    <mesh material={material} renderOrder={-10}>
      <sphereGeometry args={[52, 32, 20]} />
    </mesh>
  );
}
