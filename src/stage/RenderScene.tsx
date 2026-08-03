'use client';

import type {
  CharacterId,
  CharacterSelection,
} from '@/src/data/characterRoster';
import { getArenaDefinition, type ArenaId } from '@/src/data/arenas';
import { modelUrlFor } from '@/src/data/characterModels';
import { Arena } from './Arena';
import { LazyModelFighter } from './LazyModelFighter';
import { CameraRig } from './CameraRig';
import { CombatGameLoop } from './CombatGameLoop';
import { AttackCue } from './AttackCue';
import { FrameProfiler } from './FrameProfiler';
import { HitBlood } from './HitBlood';
import { HitSparkBurst } from './HitSparkBurst';
import { ImpactPulse } from './ImpactPulse';
import { LazyPostEffects } from './LazyPostEffects';
import { PhotoSpriteFighter } from './photoSprite/PhotoSpriteFighter';
import { SpeedLines } from './SpeedLines';
import { RenderDebugBridge } from './RenderDebugBridge';
import { Sprite2DFighter } from './sprite2d/Sprite2DFighter';
import { StageLighting } from './StageLighting';
import { TrainingTarget } from './TrainingTarget';
import { useHudStore } from '@/src/store/hudStore';

export function RenderScene({
  fighterSelection,
  arenaId,
}: {
  readonly fighterSelection: CharacterSelection;
  readonly arenaId: ArenaId;
}) {
  const arena = getArenaDefinition(arenaId);
  const training = useHudStore((state) => state.mode === 'training');
  return (
    <>
      <color attach="background" args={[arena.background]} />
      <fog attach="fog" args={[arena.fog, 14, 34]} />
      <StageLighting />

      <Arena />
      <CombatGameLoop fighterSelection={fighterSelection} />
      <SelectedFighter
        auraColor="#5cd8ff"
        characterId={fighterSelection[0]}
        fighterId="p1"
      />
      {training ? (
        <TrainingTarget />
      ) : (
        <SelectedFighter
          auraColor="#b07cff"
          characterId={fighterSelection[1]}
          fighterId="p2"
        />
      )}
      <SpeedLines />
      <AttackCue />
      <HitBlood />
      <HitSparkBurst />
      <ImpactPulse />
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

/**
 * Characters drawn as a 2D cut-out of their own sheet rather than as geometry.
 *
 * The value is exactness: the parts *are* the artwork, so the fighter cannot
 * drift from its sheet. Adding a character means slicing it —
 * `node scripts/slice-characters.mjs <name>-profile` — and adding a row here.
 */
const SPRITE_RIGS: Partial<Record<CharacterId, {
  readonly rig: string;
  /** Sliced clean attack panels, shown at the strike impact frame. */
  readonly attacks?: string;
}>> = {
};

function primitiveFighter(
  auraColor: string,
  characterId: CharacterId,
  fighterId: 'p1' | 'p2',
) {
  if (characterId === 'vorgh' || characterId === 'titan') {
    return <PhotoSpriteFighter fighterId={fighterId} kind={characterId} />;
  }
  const sprite = SPRITE_RIGS[characterId];
  if (sprite !== undefined) {
    return (
      <Sprite2DFighter
        attackPoseName={sprite.attacks}
        fighterId={fighterId}
        rigName={sprite.rig}
      />
    );
  }
  if (characterId === 'mim') {
    return <PhotoSpriteFighter fighterId={fighterId} kind="mim" />;
  }
  if (characterId === 'glitch') {
    return <PhotoSpriteFighter fighterId={fighterId} kind="glitch" />;
  }
  if (characterId === 'lucky') {
    return <PhotoSpriteFighter fighterId={fighterId} kind="lucky" />;
  }
  return null;
}
