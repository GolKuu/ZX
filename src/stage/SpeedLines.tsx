'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { MathUtils, ShaderMaterial } from 'three';
import { createSpeedLinesMaterial } from '@/src/render/speedLinesMaterial';
import { useRenderStore } from '@/src/store/renderStore';

export function SpeedLines() {
  const material = useMemo(() => createSpeedLinesMaterial(), []);
  const materialRef = useRef<ShaderMaterial>(material);
  const enabledRef = useRef(useRenderStore.getState().effectsEnabled);
  const intensityRef = useRef(0.85);

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
    const shader = materialRef.current;
    const target = enabledRef.current ? 0.85 : 0;
    intensityRef.current = MathUtils.damp(intensityRef.current, target, 7, delta);
    shader.uniforms.uTime!.value = clock.elapsedTime;
    shader.uniforms.uIntensity!.value = intensityRef.current;
  });

  return (
    <mesh material={material} position={[0, 2.2, -4.4]} renderOrder={-10}>
      <planeGeometry args={[18, 10]} />
    </mesh>
  );
}
