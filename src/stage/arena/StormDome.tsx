'use client';

import { useEffect, useMemo } from 'react';
import { BackSide, Color, ShaderMaterial } from 'three';
import { domeFragment, domeVertex } from './arenaShaders';

export function StormDome() {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          // Raised across the board. These values were authored against an
          // untone-mapped frame; once the ACES curve moved into the composite
          // chain it applies to the dome too, and at the old levels the sky
          // crushed to black and took the skyline's separation with it.
          uTop: { value: new Color('#150c28') },
          uHorizon: { value: new Color('#50208a') },
          uStorm: { value: new Color('#b455ff') },
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
