'use client';

import { Canvas } from '@react-three/fiber';
import { ACESFilmicToneMapping, PCFShadowMap, SRGBColorSpace } from 'three';
import type { CharacterSelection } from '@/src/data/characterRoster';
import type { ArenaId } from '@/src/data/arenas';
import { RenderScene } from './RenderScene';
import { useRenderStore } from '@/src/store/renderStore';
import { useHudStore } from '@/src/store/hudStore';

export function RenderCanvas({
  fighterSelection,
  arenaId,
}: {
  readonly fighterSelection: CharacterSelection;
  readonly arenaId: ArenaId;
}) {
  const graphicsPreset = useRenderStore((state) => state.graphicsPreset);
  const simulationActive = useHudStore((state) => state.screen === 'fight');
  const dpr: [number, number] = graphicsPreset === 'high' ? [1, 1.5] : graphicsPreset === 'medium' ? [1, 1.25] : [1, 1];
  return (
    <Canvas
      camera={{ fov: 40, far: 80, near: 0.1, position: [0, 2.42, 8.2] }}
      dpr={dpr}
      fallback={(
        <div role="alert">
          WebGL недоступен. Включите аппаратное ускорение или используйте современный браузер.
        </div>
      )}
      frameloop={simulationActive ? 'always' : 'never'}
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
        gl.shadowMap.type = PCFShadowMap;
      }}
      shadows={graphicsPreset !== 'low'}
    >
      <RenderScene arenaId={arenaId} fighterSelection={fighterSelection} />
    </Canvas>
  );
}
