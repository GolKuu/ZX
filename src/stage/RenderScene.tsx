'use client';

import type {
  CharacterId,
  CharacterSelection,
} from '@/src/data/characterRoster';
import { modelUrlFor } from '@/src/data/characterModels';
import { Arena } from './Arena';
import { LazyModelFighter } from './LazyModelFighter';
import { CameraRig } from './CameraRig';
import { CombatGameLoop } from './CombatGameLoop';
import { ChronoFighter } from './ChronoFighter';
import { EchoFighter } from './EchoFighter';
import { AttackCue } from './AttackCue';
import { FrameProfiler } from './FrameProfiler';
import { GlitchFighter } from './GlitchFighter';
import { HitBlood } from './HitBlood';
import { ImpactPulse } from './ImpactPulse';
import { LazyPostEffects } from './LazyPostEffects';
import { MimFighter } from './MimFighter';
import { SpeedLines } from './SpeedLines';
import { RenderDebugBridge } from './RenderDebugBridge';
import { Sprite2DFighter } from './sprite2d/Sprite2DFighter';
import { StageLighting } from './StageLighting';

export function RenderScene({
  fighterSelection,
}: {
  readonly fighterSelection: CharacterSelection;
}) {
  return (
    <>
      <color attach="background" args={['#030714']} />
      <fog attach="fog" args={['#06091a', 13, 34]} />
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
      <SpeedLines />
      <AttackCue />
      <HitBlood />
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
  chrono: { rig: 'chrono-profile', attacks: 'chrono-attacks' },
  echo: { rig: 'echo-profile', attacks: 'echo-attacks' },
  glitch: { rig: 'glitch-profile', attacks: 'glitch-attacks' },
};

function primitiveFighter(
  auraColor: string,
  characterId: CharacterId,
  fighterId: 'p1' | 'p2',
) {
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
  if (characterId === 'chrono') {
    return <ChronoFighter auraColor={auraColor} fighterId={fighterId} />;
  }
  if (characterId === 'echo') {
    return <EchoFighter auraColor={auraColor} fighterId={fighterId} />;
  }
  if (characterId === 'glitch') {
    return <GlitchFighter fighterId={fighterId} />;
  }
  if (characterId === 'mim') {
    return <MimFighter auraColor={auraColor} fighterId={fighterId} />;
  }
  return null;
}
