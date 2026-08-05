'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { AdditiveBlending, Group, MeshBasicMaterial } from 'three';
import { readCombatFighter } from '@/src/game/combatRuntime';
import { combatAnimationProgress } from '../combatAnimationProgress';
import {
  LEAD_ATTACK_PALETTES,
  leadAttackVfxState,
  type PhotoFighterKind,
} from './leadAttackVfx';

export function LeadAttackEffects({
  fighterId,
  kind,
}: {
  readonly fighterId: 'p1' | 'p2';
  readonly kind: PhotoFighterKind;
}) {
  const root = useRef<Group>(null);
  const jab = useRef<Group>(null);
  const kick = useRef<Group>(null);
  const core = useRef<MeshBasicMaterial>(null);
  const edge = useRef<MeshBasicMaterial>(null);
  const ember = useRef<MeshBasicMaterial>(null);
  const palette = LEAD_ATTACK_PALETTES[kind];

  useFrame(({ clock }) => {
    const effect = root.current;
    const fighter = readCombatFighter(fighterId);
    const action = fighter?.action ?? null;
    if (effect === null || action === null) {
      if (effect !== null) effect.visible = false;
      return;
    }
    const state = leadAttackVfxState(
      action.moveId,
      combatAnimationProgress(action.moveId, action.frame),
    );
    if (state === null) {
      effect.visible = false;
      return;
    }

    effect.visible = true;
    effect.position.set(state.x, state.y, 0.2);
    effect.rotation.z = state.rotation;
    effect.rotation.y = Math.sin(clock.elapsedTime * 18) * 0.055;
    // Collapse almost to a point at the envelope edges; otherwise the fixed
    // material opacity makes the first/last rendered frame pop into view.
    effect.scale.setScalar(0.2 + state.intensity * 1.05);
    if (jab.current !== null) jab.current.visible = state.kind === 'jab';
    if (kick.current !== null) kick.current.visible = state.kind !== 'jab';

    if (core.current !== null) core.current.opacity = 0.34 + state.intensity * 0.66;
    if (edge.current !== null) edge.current.opacity = 0.18 + state.intensity * 0.62;
    if (ember.current !== null) ember.current.opacity = state.intensity * 0.72;
    if (kick.current !== null) {
      kick.current.rotation.z = state.travel * 0.34;
      kick.current.scale.set(1 + state.travel * 0.2, 0.9 + state.intensity * 0.22, 1);
    }
    if (jab.current !== null) {
      jab.current.scale.set(0.78 + state.travel * 0.46, 0.82 + state.intensity * 0.28, 1);
    }
  });

  return (
    <group ref={root} visible={false}>
      <group ref={jab}>
        {[0, 1, 2].map((index) => (
          <mesh key={index} position={[-0.18 - index * 0.16, (index - 1) * 0.085, -index * 0.006]} rotation-z={(index - 1) * 0.08}>
            <planeGeometry args={[0.78 - index * 0.13, 0.115 - index * 0.018]} />
            <meshBasicMaterial
              ref={index === 0 ? core : index === 1 ? edge : ember}
              blending={AdditiveBlending}
              color={index === 0 ? palette.core : index === 1 ? palette.edge : palette.ember}
              depthWrite={false}
              opacity={0.8 - index * 0.2}
              toneMapped={false}
              transparent
            />
          </mesh>
        ))}
        <mesh position-x={0.24} rotation-z={Math.PI / 2}>
          <ringGeometry args={[0.17, 0.235, 24]} />
          <meshBasicMaterial blending={AdditiveBlending} color={palette.core} depthWrite={false} opacity={0.86} toneMapped={false} transparent />
        </mesh>
        {[-0.2, 0, 0.2].map((offset) => (
          <mesh key={offset} position={[0.08, offset, 0.01]} rotation-z={offset * 1.8}>
            <planeGeometry args={[0.62, 0.025]} />
            <meshBasicMaterial blending={AdditiveBlending} color={palette.edge} depthWrite={false} opacity={0.75} toneMapped={false} transparent />
          </mesh>
        ))}
      </group>

      <group ref={kick}>
        {[0.48, 0.61, 0.74].map((radius, index) => (
          <mesh key={radius} rotation-z={-0.62 + index * 0.07}>
            <torusGeometry args={[radius, 0.055 - index * 0.009, 6, 40, Math.PI * 1.2]} />
            <meshBasicMaterial
              ref={index === 0 ? core : index === 1 ? edge : ember}
              blending={AdditiveBlending}
              color={index === 0 ? palette.core : index === 1 ? palette.edge : palette.ember}
              depthWrite={false}
              opacity={0.82 - index * 0.2}
              toneMapped={false}
              transparent
            />
          </mesh>
        ))}
        <mesh position={[0.46, 0.05, 0.02]} rotation-z={Math.PI / 2}>
          <ringGeometry args={[0.13, 0.24, 20]} />
          <meshBasicMaterial blending={AdditiveBlending} color={palette.core} depthWrite={false} opacity={0.9} toneMapped={false} transparent />
        </mesh>
        {[-0.46, -0.2, 0.08, 0.34].map((offset, index) => (
          <mesh key={offset} position={[offset, -0.37 - Math.abs(offset) * 0.16, -0.01]} rotation-z={0.2 + index * 0.11}>
            <planeGeometry args={[0.08 + index * 0.025, 0.18 + index * 0.035]} />
            <meshBasicMaterial blending={AdditiveBlending} color={index % 2 === 0 ? palette.ember : palette.edge} depthWrite={false} opacity={0.68} toneMapped={false} transparent />
          </mesh>
        ))}
      </group>
    </group>
  );
}
