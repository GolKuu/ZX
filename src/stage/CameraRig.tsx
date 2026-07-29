'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { useRenderStore } from '@/src/store/renderStore';

export function CameraRig() {
  const camera = useThree((state) => state.camera);
  const cameraRef = useRef(camera);
  const impactRef = useRef(useRenderStore.getState().impactVersion);
  const shakeRef = useRef(0);

  useEffect(() => useRenderStore.subscribe((state) => {
    if (state.impactVersion !== impactRef.current) {
      impactRef.current = state.impactVersion;
      shakeRef.current = 1;
    }
  }), []);

  useFrame(({ clock }, delta) => {
    const activeCamera = cameraRef.current;
    const time = clock.elapsedTime;
    shakeRef.current *= Math.exp(-14 * delta);
    const shake = shakeRef.current;

    activeCamera.position.x = Math.sin(time * 0.24) * 0.09 + Math.sin(time * 67) * 0.055 * shake;
    activeCamera.position.y = 3.25 + Math.sin(time * 51) * 0.035 * shake;
    activeCamera.position.z = 8.2 + Math.sin(time * 59) * 0.06 * shake;
    activeCamera.lookAt(0, 1.3, 0);
  });

  return null;
}
