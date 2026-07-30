'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Group } from 'three';
import {
  combatRenderFrame,
  readCombatFighter,
} from '@/src/game/combatRuntime';
import { combatAnimationProgress } from '../combatAnimationProgress';
import {
  createEchoObservation,
  observeOpponent,
} from './echoObservation';
import { layoutEchoSpriteFx } from './echoSpriteFxLayout';
import {
  EchoAdaptiveField,
  EchoDataFragments,
  EchoFutureTrajectories,
  EchoPredictionReticle,
} from './EchoSpriteVfxMeshes';

export function EchoSpriteEffects({
  facesRight,
  fighterId,
}: {
  readonly facesRight: boolean;
  readonly fighterId: 'p1' | 'p2';
}) {
  const reticle = useRef<Group>(null);
  const paths = useRef<Group>(null);
  const data = useRef<Group>(null);
  const clones = useRef<Group>(null);
  const observation = useRef(createEchoObservation());
  const opponentId = fighterId === 'p1' ? 'p2' : 'p1';
  const forward = facesRight ? 1 : -1;

  useFrame(({ clock }, delta) => {
    const fighter = readCombatFighter(fighterId);
    const opponent = readCombatFighter(opponentId);
    if (fighter === null) return;
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
      <EchoAdaptiveField root={clones} />
    </group>
  );
}
