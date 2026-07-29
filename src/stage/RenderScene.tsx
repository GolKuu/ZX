'use client';

import { Arena } from './Arena';
import { Aura } from './Aura';
import { CameraRig } from './CameraRig';
import { Fighter } from './Fighter';
import { FrameProfiler } from './FrameProfiler';
import { ImpactBurst } from './ImpactBurst';
import { LazyPostEffects } from './LazyPostEffects';
import { SpeedLines } from './SpeedLines';

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
      <Aura color="#42ceff" position={[-1.45, 1.35, -0.08]} />
      <Aura color="#ff4f7b" position={[1.45, 1.35, -0.08]} />
      <Fighter color="#2b8fc2" accent="#71dcff" position={[-1.45, 0, 0]} facing={1} />
      <Fighter color="#a62f57" accent="#ff6d93" position={[1.45, 0, 0]} facing={-1} />
      <ImpactBurst />
      <CameraRig />
      <LazyPostEffects />
      <FrameProfiler />
    </>
  );
}
