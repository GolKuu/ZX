'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Group } from 'three';
import { GLITCH_MOVE_IDS } from '@/src/data/glitch-combat-moves';
import {
  GLITCH_AIR_IDS,
  GLITCH_NORMAL_IDS,
  GLITCH_SPECIAL_IDS,
  GLITCH_UTILITY_IDS,
} from '@/src/data/glitch/ids';
import { readCombatFighter } from '@/src/game/combatRuntime';
import { combatAnimationProgress } from '../combatAnimationProgress';
import type { LoadedSpriteRig } from '../sprite2d/spriteRig';
import { GlitchGhosts } from './GlitchGhosts';
import {
  CorruptDataProjectile,
  GlitchImpactTears,
  GlitchScreenTear,
  LagSpikeField,
} from './GlitchSpriteVfxMeshes';
import { speakGlitchMove } from './glitchVoiceLines';
import { playGlitchMoveSound } from './glitchSoundEvents';
import { GlitchEnergyScarf } from './GlitchEnergyScarf';
import {
  animateScarf,
  hideGlitchEffects,
  showAttackTears,
  showCorruptData,
  showDesync,
  showGuardRift,
  showLagSpike,
} from './glitchSpriteEffectMotion';

const SPECIALS = new Set<string>(Object.values(GLITCH_SPECIAL_IDS));
const NORMALS = new Set<string>([
  ...Object.values(GLITCH_NORMAL_IDS),
  ...Object.values(GLITCH_AIR_IDS),
  ...Object.values(GLITCH_UTILITY_IDS),
]);
const SHIFTS = new Set<string>([
  GLITCH_SPECIAL_IDS.spatialDash,
  GLITCH_SPECIAL_IDS.shiftForward,
  GLITCH_SPECIAL_IDS.shiftBackward,
  GLITCH_SPECIAL_IDS.airShift,
  GLITCH_SPECIAL_IDS.doubleJump,
  GLITCH_SPECIAL_IDS.teleportStrike,
  GLITCH_SPECIAL_IDS.exTeleportStrike,
]);

export function GlitchSpriteEffects({
  fighterId,
  rig,
}: {
  readonly fighterId: 'p1' | 'p2';
  readonly rig?: LoadedSpriteRig;
}) {
  const tears = useRef<Group>(null);
  const projectile = useRef<Group>(null);
  const lagField = useRef<Group>(null);
  const ghosts = useRef<Group>(null);
  const screenTear = useRef<Group>(null);
  const scarf = useRef<Group>(null);
  const lastMove = useRef<string | null>(null);

  useFrame(({ clock }) => {
    const fighter = readCombatFighter(fighterId);
    const action = fighter?.action ?? null;
    const moveId = action?.moveId ?? null;
    const hasMotion = fighter !== null && (
      action !== null
      || fighter.hitstun > 0
      || fighter.guarding
      || !fighter.grounded
      || fighter.dashFrames > 0
      || Math.abs(fighter.velocity.x) > 16
    );
    hideGlitchEffects(
      tears.current,
      projectile.current,
      lagField.current,
      ghosts.current,
      screenTear.current,
    );
    animateScarf(
      scarf.current,
      clock.elapsedTime,
      action?.frame ?? 0,
      hasMotion,
    );

    if (moveId !== lastMove.current) {
      if (
        moveId !== null
        && SPECIALS.has(moveId)
      ) {
        speakGlitchMove(moveId);
      }
      if (moveId !== null) playGlitchMoveSound(moveId);
      lastMove.current = moveId;
    }
    if (fighter === null || action === null) {
      if (fighter?.guarding === true) {
        showGuardRift(
          tears.current,
          fighter.guardFrames,
          fighter.hitstun,
          fighter.crouching,
        );
      }
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
      showLagSpike(
        lagField.current,
        ghosts.current,
        screenTear.current,
        progress,
        action.frame,
      );
    } else if (activeMoveId === GLITCH_MOVE_IDS.desyncJump) {
      showDesync(ghosts.current, tears.current, progress, action.frame);
    } else if (SHIFTS.has(activeMoveId)) {
      showDesync(ghosts.current, tears.current, progress, action.frame);
    }
  });

  return (
    <>
      <GlitchImpactTears root={tears} />
      <CorruptDataProjectile root={projectile} />
      <LagSpikeField root={lagField} />
      <GlitchScreenTear root={screenTear} />
      {rig === undefined ? null : (
        <GlitchGhosts fighterId={fighterId} root={ghosts} rig={rig} />
      )}
      {rig === undefined ? null : <GlitchEnergyScarf root={scarf} />}
    </>
  );
}
