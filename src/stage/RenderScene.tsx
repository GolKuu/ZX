'use client';

import { Arena } from './Arena';
import { CameraRig } from './CameraRig';
import { CombatGameLoop } from './CombatGameLoop';
import { FrameProfiler } from './FrameProfiler';
import { ImpactBurst } from './ImpactBurst';
import { LazyPostEffects } from './LazyPostEffects';
import { SpeedLines } from './SpeedLines';
import { VoidWalkerFighter } from './VoidWalkerFighter';

export function RenderScene() {
  return (
    <>
      <color attach="background" args={['#10071b']} />
      <fog attach="fog" args={['#1c0b2d', 9, 23]} />
      <ambientLight color="#9a73ca" intensity={1.18} />
      <directionalLight color="#fff4dd" intensity={3.2} position={[-3, 7, 5]} />
      <directionalLight color="#b05cff" intensity={1.65} position={[5, 4, -4]} />

      <SpeedLines />
      <Arena />
      <CombatGameLoop />
      <VoidWalkerFighter
        auraColor="#5cd8ff"
        fighterId="p1"
      />
      <VoidWalkerFighter
        auraColor="#b07cff"
        fighterId="p2"
      />
      <ImpactBurst />
      <CameraRig />
      <LazyPostEffects />
      <FrameProfiler />
    </>
  );
}
