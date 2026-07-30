'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Group } from 'three';
import {
  combatRenderFrame,
  readCombatFighter,
} from '@/src/game/combatRuntime';
import { combatAnimationProgress } from '../combatAnimationProgress';
import type { LoadedSpriteRig } from '../sprite2d/spriteRig';
import {
  createEchoObservation,
  observeOpponent,
} from './echoObservation';
import { layoutEchoSpriteFx } from './echoSpriteFxLayout';
import {
  EchoDataFragments,
  EchoFutureTrajectories,
  EchoPredictionReticle,
} from './EchoSpriteVfxMeshes';
import { EchoSpriteGhosts } from './EchoSpriteGhosts';
import {
  speakEchoMove,
  speakFinalPredictionResult,
} from './echoVoiceLines';
import { ECHO_SUPER_MOVE_IDS } from '@/src/data/echo-super-moves';

export function EchoSpriteEffects({
  fighterId,
  rig,
}: {
  readonly fighterId: 'p1' | 'p2';
  readonly rig: LoadedSpriteRig;
}) {
  const reticle = useRef<Group>(null);
  const paths = useRef<Group>(null);
  const data = useRef<Group>(null);
  const clones = useRef<Group>(null);
  const observation = useRef(createEchoObservation());
  const lastMove = useRef<string | null>(null);
  const opponentId = fighterId === 'p1' ? 'p2' : 'p1';
  const forward = rig.facesRight === true ? 1 : -1;

  useFrame(({ clock }, delta) => {
    const fighter = readCombatFighter(fighterId);
    const opponent = readCombatFighter(opponentId);
    if (fighter === null) return;
    const moveId = fighter.action?.moveId ?? null;
    if (moveId !== lastMove.current) {
      if (moveId !== null) {
        speakEchoMove(moveId);
      } else if (lastMove.current === ECHO_SUPER_MOVE_IDS.statistics) {
        speakFinalPredictionResult();
      }
      lastMove.current = moveId;
    }
    const readout = observeOpponent(observation.current, opponent, delta);
    const progress = fighter.action === null
      ? 0
      : combatAnimationProgress(
        fighter.action.moveId,
        fighter.action.frame + combatRenderFrame.interpolationAlpha,
      );
    layoutEchoSpriteFx(
      {
        clones: clones.current,
        data: data.current,
        paths: paths.current,
        reticle: reticle.current,
      },
      readout,
      fighter,
      opponent,
      progress,
      clock.elapsedTime,
      forward,
    );
  });

  return (
    <group>
      <EchoPredictionReticle root={reticle} />
      <EchoFutureTrajectories root={paths} />
      <EchoDataFragments root={data} />
      <EchoSpriteGhosts rig={rig} root={clones} />
    </group>
  );
}
