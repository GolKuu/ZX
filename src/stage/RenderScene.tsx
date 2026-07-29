'use client';

import { Arena } from './Arena';
import { CameraRig } from './CameraRig';
import { FrameProfiler } from './FrameProfiler';
import { ImpactBurst } from './ImpactBurst';
import { LazyPostEffects } from './LazyPostEffects';
import { SpeedLines } from './SpeedLines';
import { ZoroFighter } from './ZoroFighter';

export function RenderScene() {
  return (
    <>
      <color attach="background" args={['#050814']} />
      <fog attach="fog" args={['#050814', 8, 17]} />
      <ambientLight color="#7895c9" intensity={1.25} />
      <directionalLight color="#fff4dd" intensity={3.2} position={[-3, 7, 5]} />
      <directionalLight color="#4fcfff" intensity={1.5} position={[5, 3, -2]} />

      <SpeedLines />
      <Arena />
      <ZoroFighter
        auraColor="#3dff9a"
        controlled
        position={[-1.55, 0, 0]}
        facing={1}
      />
      <ZoroFighter
        auraColor="#ff6d72"
        position={[1.55, 0, 0]}
        facing={-1}
      />
      <ImpactBurst />
      <CameraRig />
      <LazyPostEffects />
      <FrameProfiler />
    </>
  );
}
