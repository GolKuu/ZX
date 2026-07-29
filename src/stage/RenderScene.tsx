'use client';

import type {
  CharacterId,
  CharacterSelection,
} from '@/src/data/characterRoster';
import { AangFighter } from './AangFighter';
import { Arena } from './Arena';
import { CameraRig } from './CameraRig';
import { CombatGameLoop } from './CombatGameLoop';
import { FrameProfiler } from './FrameProfiler';
import { LazyPostEffects } from './LazyPostEffects';
import { VoidWalkerFighter } from './VoidWalkerFighter';
import { ZoroFighter } from './ZoroFighter';

export function RenderScene({
  fighterSelection,
}: {
  readonly fighterSelection: CharacterSelection;
}) {
  return (
    <>
      <color attach="background" args={['#10071b']} />
      <fog attach="fog" args={['#1c0b2d', 9, 23]} />
      <ambientLight color="#9a73ca" intensity={1.18} />
      <directionalLight color="#fff4dd" intensity={3.2} position={[-3, 7, 5]} />
      <directionalLight color="#b05cff" intensity={1.65} position={[5, 4, -4]} />

      <Arena />
      <CombatGameLoop />
      <SelectedFighter
        auraColor="#5cd8ff"
        characterId={fighterSelection[0]}
        fighterId="p1"
      />
      <SelectedFighter
        auraColor="#b07cff"
        characterId={fighterSelection[1]}
        fighterId="p2"
      />
      <CameraRig />
      <LazyPostEffects />
      <FrameProfiler />
    </>
  );
}

function SelectedFighter({
  auraColor,
  characterId,
  fighterId,
}: {
  readonly auraColor: string;
  readonly characterId: CharacterId;
  readonly fighterId: 'p1' | 'p2';
}) {
  if (characterId === 'zoro') {
    return <ZoroFighter auraColor={auraColor} fighterId={fighterId} />;
  }
  if (characterId === 'aang') {
    return <AangFighter auraColor={auraColor} fighterId={fighterId} />;
  }
  return <VoidWalkerFighter auraColor={auraColor} fighterId={fighterId} />;
}
