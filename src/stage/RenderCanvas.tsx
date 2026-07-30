'use client';

import { Canvas } from '@react-three/fiber';
import { ACESFilmicToneMapping, PCFSoftShadowMap, SRGBColorSpace } from 'three';
import type { CharacterSelection } from '@/src/data/characterRoster';
import { RenderScene } from './RenderScene';

export function RenderCanvas({
  fighterSelection,
}: {
  readonly fighterSelection: CharacterSelection;
}) {
  return (
    <Canvas
      camera={{ fov: 40, far: 80, near: 0.1, position: [0, 2.42, 8.2] }}
      dpr={[1, 1.5]}
      frameloop="always"
      gl={{
        alpha: false,
        // AA is SMAA in the composite chain — MSAA cannot coexist cheaply with
        // the AO pass's normal buffer.
        antialias: false,
        depth: true,
        powerPreference: 'high-performance',
        stencil: false,
      }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = SRGBColorSpace;
        // Only in effect while the composite chain is unmounted — mounting it
        // moves the curve into `PostEffects`. Kept so the first frames, and the
        // FX-off path, are not written out linear.
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.shadowMap.type = PCFSoftShadowMap;
      }}
      shadows
    >
      <RenderScene fighterSelection={fighterSelection} />
    </Canvas>
  );
}
