'use client';

import type {
  CharacterId,
  CharacterSelection,
} from '@/src/data/characterRoster';
import type { ArenaId } from '@/src/data/arenas';
import { modelUrlFor } from '@/src/data/characterModels';
import { Arena } from './Arena';
import { kombatTheme } from './kombat/kombatTheme';
import { LazyModelFighter } from './LazyModelFighter';
import { CameraRig } from './CameraRig';
import { CombatGameLoop } from './CombatGameLoop';
import { AttackCue } from './AttackCue';
import { FrameProfiler } from './FrameProfiler';
import { HitBlood } from './HitBlood';
import { HitSparkBurst } from './HitSparkBurst';
import { GuardImpact } from './GuardImpact';
import { GroundDust } from './impact/GroundDust';
import { ImpactFlash } from './impact/ImpactFlash';
import { ImpactShockwave } from './impact/ImpactShockwave';
import { LazyPostEffects } from './LazyPostEffects';
import { KombatFighter } from './fighter3d/KombatFighter';
import { SpeedLines } from './SpeedLines';
import { RenderDebugBridge } from './RenderDebugBridge';
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
  const theme = kombatTheme(arenaId);
  const training = useHudStore((state) => state.mode === 'training');
  return (
    <>
      <color attach="background" args={[theme.skyTop]} />
      {/* Fog is the stage's depth cue, so its range is authored per theme
          alongside the colours rather than being a fixed pair of numbers. It
          starts past the fighting disc — fogging the fighters would grey out the
          very silhouettes the rim lights exist to carve. */}
      <fog attach="fog" args={[theme.fog, theme.fogNear, theme.fogFar]} />
      <StageLighting arenaId={arenaId} />

      <Arena arenaId={arenaId} />
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
      <ImpactShockwave />
      <GroundDust />
      <GuardImpact />
      <ImpactFlash />
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
  const blockout = primitiveFighter(characterId, fighterId);
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
const LEGACY_SPRITE_RIGS: Partial<Record<CharacterId, {
  readonly rig: string;
  /** Sliced clean attack panels, shown at the strike impact frame. */
  readonly attacks?: string;
}>> = {
};
void LEGACY_SPRITE_RIGS;

function primitiveFighter(
  characterId: CharacterId,
  fighterId: 'p1' | 'p2',
) {
  // GLB files remain the preferred production path. Until those optimized
  // assets are installed, every roster member uses the same authored 3D rig
  // rather than dropping back to a flat sprite. The rig reads the authoritative
  // combat runtime, so attacks, hit reactions, facing and knockdowns stay in
  // lockstep with the simulation.
  return <KombatFighter characterId={characterId} fighterId={fighterId} />;
}
