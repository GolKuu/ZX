'use client';

import { Canvas } from '@react-three/fiber';
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three';
import { RenderScene } from './RenderScene';

export function RenderCanvas() {
  return (
    <Canvas
      camera={{ fov: 42, far: 40, near: 0.1, position: [0, 3.25, 8.2] }}
      dpr={[1, 1.5]}
      frameloop="always"
      gl={{
        alpha: false,
        antialias: false,
        depth: true,
        powerPreference: 'high-performance',
        stencil: false,
      }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = SRGBColorSpace;
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
      shadows={false}
    >
      <RenderScene />
    </Canvas>
  );
}
