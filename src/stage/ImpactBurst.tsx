'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { MathUtils } from 'three';
import { createImpactMaterial } from '@/src/render/impactMaterial';
import { useRenderStore } from '@/src/store/renderStore';

const IMPACT_DURATION = 0.72;
const AUTO_REPLAY_SECONDS = 5;

export function ImpactBurst() {
  const material = useMemo(createImpactMaterial, []);
  const startTimeRef = useRef(0.8);
  const triggerRef = useRef(useRenderStore.getState().impactVersion);
  const handledTriggerRef = useRef(triggerRef.current);
  const enabledRef = useRef(useRenderStore.getState().effectsEnabled);

  useEffect(() => {
    const unsubscribe = useRenderStore.subscribe((state) => {
      triggerRef.current = state.impactVersion;
      enabledRef.current = state.effectsEnabled;
    });
    return () => {
      unsubscribe();
      material.dispose();
    };
  }, [material]);

  useFrame(({ clock }) => {
    const elapsed = clock.elapsedTime;
    const wasTriggered = triggerRef.current !== handledTriggerRef.current;
    const shouldReplay = elapsed - startTimeRef.current >= AUTO_REPLAY_SECONDS;

    if (wasTriggered || shouldReplay) {
      startTimeRef.current = elapsed;
      handledTriggerRef.current = triggerRef.current;
    }

    const progress = (elapsed - startTimeRef.current) / IMPACT_DURATION;
    const isActive = progress >= 0 && progress <= 1;
    material.uniforms.uProgress!.value = MathUtils.clamp(progress, 0, 1);
    material.uniforms.uStrength!.value = enabledRef.current && isActive ? 1 : 0;
  });

  return (
    <mesh material={material} position={[0, 1.55, 2.4]} renderOrder={20}>
      <planeGeometry args={[8.8, 5.4]} />
    </mesh>
  );
}
