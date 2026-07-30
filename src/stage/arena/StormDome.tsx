'use client';

import { useEffect, useMemo } from 'react';
import { BackSide, Color, ShaderMaterial } from 'three';
import { domeFragment, domeVertex } from './arenaShaders';

export function StormDome() {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uTop: { value: new Color('#030714') },
          uHorizon: { value: new Color('#242357') },
          uStorm: { value: new Color('#4c2b75') },
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
