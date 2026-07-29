'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { MathUtils, type ColorRepresentation } from 'three';
import { createAuraMaterial } from '@/src/render/auraMaterial';
import { useRenderStore } from '@/src/store/renderStore';

type AuraProps = {
  color: ColorRepresentation;
  position: [number, number, number];
};

export function Aura({ color, position }: AuraProps) {
  const material = useMemo(() => createAuraMaterial(color), [color]);
  const enabledRef = useRef(useRenderStore.getState().effectsEnabled);
  const intensityRef = useRef(0.7);

  useEffect(() => {
    const unsubscribe = useRenderStore.subscribe((state) => {
      enabledRef.current = state.effectsEnabled;
    });
    return () => {
      unsubscribe();
      material.dispose();
    };
  }, [material]);

  useFrame(({ clock }, delta) => {
    const target = enabledRef.current ? 0.72 : 0;
    intensityRef.current = MathUtils.damp(intensityRef.current, target, 8, delta);
    material.uniforms.uTime!.value = clock.elapsedTime;
    material.uniforms.uIntensity!.value = intensityRef.current;
  });

  return (
    <mesh material={material} position={position} scale={[0.9, 1.75, 0.82]}>
      <sphereGeometry args={[1, 24, 18]} />
    </mesh>
  );
}
