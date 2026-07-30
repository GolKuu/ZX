'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Group } from 'three';
import { GLITCH_MOVE_IDS } from '@/src/data/glitch-combat-moves';
import { readCombatFighter } from '@/src/game/combatRuntime';
import { combatAnimationProgress } from '../combatAnimationProgress';
import type { LoadedSpriteRig } from '../sprite2d/spriteRig';
import { GlitchGhosts } from './GlitchGhosts';
import {
  CorruptDataProjectile,
  GlitchImpactTears,
  LagSpikeField,
} from './GlitchSpriteVfxMeshes';
import { speakGlitchMove } from './glitchVoiceLines';

const SPECIALS = new Set<string>(Object.values(GLITCH_MOVE_IDS).slice(4));
const NORMALS = new Set<string>(Object.values(GLITCH_MOVE_IDS).slice(0, 4));

export function GlitchSpriteEffects({
  fighterId,
  rig,
}: {
  readonly fighterId: 'p1' | 'p2';
  readonly rig: LoadedSpriteRig;
}) {
  const tears = useRef<Group>(null);
  const projectile = useRef<Group>(null);
  const lagField = useRef<Group>(null);
  const ghosts = useRef<Group>(null);
  const lastMove = useRef<string | null>(null);

  useFrame(({ clock }) => {
    const fighter = readCombatFighter(fighterId);
    const action = fighter?.action ?? null;
    const moveId = action?.moveId ?? null;
    hide(tears.current, projectile.current, lagField.current, ghosts.current);

    if (moveId !== lastMove.current) {
      if (
        moveId !== null
        && SPECIALS.has(moveId)
      ) {
        speakGlitchMove(moveId);
      }
      lastMove.current = moveId;
    }
    if (fighter === null || action === null) {
      showIdleFault(tears.current, clock.elapsedTime, fighterId);
      return;
    }

    const activeMoveId = action.moveId;
    const progress = combatAnimationProgress(activeMoveId, action.frame);
    showAttackTears(
      tears.current,
      progress,
      action.frame,
      NORMALS.has(activeMoveId),
    );
    if (activeMoveId === GLITCH_MOVE_IDS.packetLoss) {
      showCorruptData(projectile.current, progress, action.frame);
    } else if (activeMoveId === GLITCH_MOVE_IDS.corruptedZone) {
      showLagSpike(lagField.current, ghosts.current, progress, action.frame);
    } else if (activeMoveId === GLITCH_MOVE_IDS.desyncJump) {
      showDesync(ghosts.current, tears.current, progress, action.frame);
    }
  });

  return (
    <>
      <GlitchImpactTears root={tears} />
      <CorruptDataProjectile root={projectile} />
      <LagSpikeField root={lagField} />
      <GlitchGhosts root={ghosts} rig={rig} />
    </>
  );
}

function showIdleFault(
  group: Group | null,
  time: number,
  fighterId: string,
): void {
  if (group === null) return;
  const tick = Math.floor(time * 7) + (fighterId === 'p1' ? 0 : 5);
  group.visible = tick % 17 === 8 || tick % 23 === 2;
  group.position.x = tick % 2 === 0 ? 0.05 : -0.04;
  group.scale.set(0.72, 0.72, 0.72);
}

function showAttackTears(
  group: Group | null,
  progress: number,
  frame: number,
  normal: boolean,
): void {
  if (group === null) return;
  const impact = progress > 0.29 && progress < (normal ? 0.72 : 0.9);
  group.visible = impact && frame % 3 !== 1;
  group.position.x = (frame % 2 === 0 ? 0.14 : -0.12) * (0.5 + progress);
  group.scale.set(0.8 + progress * 0.45, 0.85 + progress * 0.18, 1);
}

function showCorruptData(
  group: Group | null,
  progress: number,
  frame: number,
): void {
  if (group === null) return;
  const rawTravel = clamp((progress - 0.24) / 0.64);
  const steppedTravel = Math.floor(rawTravel * 9) / 9;
  group.visible = progress > 0.22 && progress < 0.91;
  group.position.set(0.65 + steppedTravel * 3, 1.15, 0.16);
  group.rotation.set(frame * 0.23, frame * 0.31, frame * 0.17);
  const spike = frame % 5 === 0 ? 1.34 : 1;
  group.scale.setScalar((0.72 + Math.sin(rawTravel * Math.PI) * 0.46) * spike);
}

function showLagSpike(
  field: Group | null,
  ghosts: Group | null,
  progress: number,
  frame: number,
): void {
  if (field !== null) {
    field.visible = progress > 0.16 && progress < 0.92;
    field.rotation.y = Math.floor(progress * 10) * 0.42;
    const scale = 0.45 + Math.sin(progress * Math.PI) * 0.88;
    field.scale.setScalar(scale);
  }
  if (ghosts !== null) {
    ghosts.visible = progress > 0.22 && progress < 0.82 && frame % 4 !== 1;
    ghosts.position.x = frame % 2 === 0 ? -0.38 : 0.3;
    ghosts.position.y = frame % 3 === 0 ? 0.06 : -0.02;
  }
}

function showDesync(
  ghosts: Group | null,
  tears: Group | null,
  progress: number,
  frame: number,
): void {
  if (ghosts !== null) {
    ghosts.visible = progress > 0.08 && progress < 0.94;
    const delayed = Math.floor(progress * 7) / 7;
    ghosts.position.set(-0.48 - delayed * 0.5, delayed * 0.24, -0.05);
    ghosts.rotation.z = frame % 6 === 0 ? -0.08 : 0.03;
  }
  if (tears !== null) tears.scale.x = 1.25 + Math.sin(progress * Math.PI) * 0.8;
}

function hide(...groups: Array<Group | null>): void {
  groups.forEach((group) => {
    if (group !== null) group.visible = false;
  });
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}
