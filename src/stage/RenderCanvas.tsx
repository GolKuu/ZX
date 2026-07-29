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
      // `far` has to clear the storm dome (radius 52). It did not before, so
      // the dome was culled every frame and the sky was just the clear colour.
      camera={{ fov: 42, far: 120, near: 0.1, position: [0, 3.25, 8.2] }}
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
