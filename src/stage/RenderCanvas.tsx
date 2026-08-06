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
  // High preset targets a 4K-class internal surface on a 2x display while
  // retaining a safe floor for older hardware. The sprite atlases remain
  // source-limited, but the arena, lighting and post stack now resolve at the
  // display's native high-density pixel grid instead of a 1.5x ceiling.
  const dpr: [number, number] = graphicsPreset === 'high' ? [1, 2] : graphicsPreset === 'medium' ? [1, 1.25] : [1, 1];
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
        // Keep the arena's emissive architecture cinematic instead of letting
        // white panels clip and wash the fighter silhouettes out of the frame.
        gl.toneMappingExposure = 0.98;
        gl.shadowMap.type = PCFShadowMap;
      }}
      shadows={graphicsPreset !== 'low'}
    >
      <RenderScene arenaId={arenaId} fighterSelection={fighterSelection} />
    </Canvas>
  );
}
