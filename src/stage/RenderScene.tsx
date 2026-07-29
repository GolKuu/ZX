'use client';

import type {
  CharacterId,
  CharacterSelection,
} from '@/src/data/characterRoster';
import { modelUrlFor } from '@/src/data/characterModels';
import { AangFighter } from './AangFighter';
import { AangElementVfx } from './AangElementVfx';
import { Arena } from './Arena';
import { LazyModelFighter } from './LazyModelFighter';
import { CameraRig } from './CameraRig';
import { CombatGameLoop } from './CombatGameLoop';
import { FrameProfiler } from './FrameProfiler';
import { IdolFighter } from './IdolFighter';
import { LazyPostEffects } from './LazyPostEffects';
import { RenderDebugBridge } from './RenderDebugBridge';
import { StageLighting } from './StageLighting';
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
      {/* Near plane pushed out just past the arena rim so the disc itself is
          never hazed, far plane short enough that the skyline stays a value
          behind the fight rather than competing with it. */}
      <fog attach="fog" args={['#1c0b2d', 10, 27]} />
      <StageLighting />

      <Arena />
      <CombatGameLoop fighterSelection={fighterSelection} />
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
      {fighterSelection[0] === 'aang' && <AangElementVfx fighterId="p1" />}
      {fighterSelection[1] === 'aang' && <AangElementVfx fighterId="p2" />}
      <CameraRig />
      <LazyPostEffects />
      <FrameProfiler />
      {process.env.NODE_ENV !== 'production' && <RenderDebugBridge />}
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
  const blockout = primitiveFighter(auraColor, characterId, fighterId);
  const url = modelUrlFor(characterId);

  // The rigged model is preferred whenever its file is present. The primitive
  // blockout stays as the fallback rather than being deleted — the models are
  // untracked assets, and a missing file must never blank the scene.
  if (url === null) return blockout;
  return (
    <LazyModelFighter
      characterId={characterId}
      auraColor={auraColor}
      fallback={blockout}
      fighterId={fighterId}
      url={url}
    />
  );
}

function primitiveFighter(
  auraColor: string,
  characterId: CharacterId,
  fighterId: 'p1' | 'p2',
) {
  if (characterId === 'zoro') {
    return <ZoroFighter auraColor={auraColor} fighterId={fighterId} />;
  }
  if (characterId === 'aang') {
    return <AangFighter auraColor={auraColor} fighterId={fighterId} />;
  }
  if (characterId === 'idol') {
    return <IdolFighter auraColor={auraColor} fighterId={fighterId} />;
  }
  return <VoidWalkerFighter auraColor={auraColor} fighterId={fighterId} />;
}
