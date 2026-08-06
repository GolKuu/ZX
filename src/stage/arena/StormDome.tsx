'use client';

import { useEffect, useMemo } from 'react';
import { BackSide, Color, ShaderMaterial } from 'three';
import { domeFragment, domeVertex } from './arenaShaders';

export function StormDome() {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uTop: { value: new Color('#07091f') },
          uHorizon: { value: new Color('#d45a68') },
          uStorm: { value: new Color('#73345f') },
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
