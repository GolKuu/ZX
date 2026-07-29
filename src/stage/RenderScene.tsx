'use client';

import type { CharacterSelection } from '@/src/data/characterRoster';
import { Arena } from './Arena';
import { CameraRig } from './CameraRig';
import { CombatGameLoop } from './CombatGameLoop';
import { FrameProfiler } from './FrameProfiler';
import { LazyPostEffects } from './LazyPostEffects';
import { RenderDebugBridge } from './RenderDebugBridge';
import { StageLighting } from './StageLighting';

export function RenderScene({
  fighterSelection,
}: {
  readonly fighterSelection: CharacterSelection;
}) {
  return (
    <>
      <color attach="background" args={['#10071b']} />
      {/* Near plane pushed out just past the arena rim so the disc itself is
          never hazed, far plane short enough that the skyline stays a value
          behind the fight rather than competing with it. */}
      <fog attach="fog" args={['#1c0b2d', 10, 27]} />
      <StageLighting />

      <Arena />
      <CombatGameLoop fighterSelection={fighterSelection} />
      <CameraRig />
      <LazyPostEffects />
      <FrameProfiler />
      {process.env.NODE_ENV !== 'production' && <RenderDebugBridge />}
    </>
  );
}
