'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  DoubleSide,
  Group,
  MathUtils,
  MeshBasicMaterial,
} from 'three';
import { CHRONO_MOVE_IDS } from '@/src/data/chrono-combat-moves';
import { CHRONO_SUPER_MOVE_IDS } from '@/src/data/chrono-super-moves';
import { readCombatFighter } from '@/src/game/combatRuntime';
import { dashPhase } from '@/src/sim/dash';
import { combatAnimationProgress } from '../combatAnimationProgress';
import type { FighterResources } from '../fighterResources';

const ECHO_COUNT = 3;

export function ChronoTemporalFx({
  fighterId,
  resources,
}: {
  readonly fighterId: 'p1' | 'p2';
  readonly resources: FighterResources;
}) {
  const root = useRef<Group>(null);
  const materials = useMemo(
    () => Array.from({ length: ECHO_COUNT }, () => new MeshBasicMaterial({
      blending: AdditiveBlending,
      color: '#77d5ff',
      depthWrite: false,
      opacity: 0,
      side: DoubleSide,
      toneMapped: false,
      transparent: true,
      wireframe: true,
    })),
    [],
  );

  useEffect(() => () => {
    for (const material of materials) material.dispose();
  }, [materials]);

  useFrame(({ clock }) => {
    const fighter = readCombatFighter(fighterId);
    const group = root.current;
    if (fighter === null || group === null) return;
    const dash = dashPhase(fighter.dashFrames);
    const action = fighter.action;
    const progress = action === null
      ? 0
      : combatAnimationProgress(action.moveId, action.frame);
    const attack = action === null ? 0 : attackEnvelope(action.moveId, progress);
    const parallel = action?.moveId === CHRONO_SUPER_MOVE_IDS.outcomes;
    const amount = Math.max(dash > 0 ? Math.sin(dash * Math.PI) : 0, attack);
    group.visible = amount > 0.025;
    if (!group.visible) return;

    const facing = fighter.facing;
    group.children.forEach((child, index) => {
      const delay = (index + 1) * 0.095;
      const dashTrail = dash > 0 ? delay * (1.6 + dash) : delay * 0.48;
      const timeline = index - 1;
      child.position.x = (
        -facing * dashTrail
        + (parallel ? facing * timeline * attack * 0.18 : 0)
      );
      child.position.y = (
        Math.sin(clock.elapsedTime * 8 - index) * 0.012
        + (dash > 0 ? timeline * 0.075 : 0)
      );
      child.position.z = dash > 0 ? timeline * 0.11 : -0.025 * (index + 1);
      child.rotation.z = (
        -facing * attack * (index + 1) * 0.018
        + (parallel ? timeline * attack * 0.075 : 0)
      );
      child.scale.setScalar(1 + amount * index * 0.025);
      const material = materials[index];
      if (material !== undefined) {
        material.opacity = amount * (0.24 - index * 0.055);
      }
    });
  });

  return (
    <group ref={root} visible={false}>
      {materials.map((material, index) => (
        <group key={index} scale={1.2}>
          <mesh geometry={resources.coat} material={material} position={[0, 0.82, -0.03]} scale={[0.92, 1.78, 0.82]} />
          <mesh geometry={resources.chest} material={material} position={[0, 1.4, 0]} scale={[0.84, 0.78, 0.82]} />
          <mesh geometry={resources.head} material={material} position={[0, 1.86, 0]} scale={[0.9, 1.02, 0.9]} />
          <mesh geometry={resources.upperArm} material={material} position={[-0.34, 1.38, 0]} rotation-z={0.34 + index * 0.08} scale={[0.72, 0.78, 0.72]} />
          <mesh geometry={resources.forearm} material={material} position={[-0.46, 1.08, 0]} rotation-z={0.48 + index * 0.12} scale={[0.74, 0.78, 0.74]} />
          <mesh geometry={resources.upperArm} material={material} position={[0.34, 1.38, 0]} rotation-z={-0.5 + index * 0.1} scale={[0.72, 0.78, 0.72]} />
          <mesh geometry={resources.forearm} material={material} position={[0.48, 1.11, 0]} rotation-z={-0.62 + index * 0.14} scale={[0.74, 0.78, 0.74]} />
          <mesh geometry={resources.thigh} material={material} position={[-0.16, 0.62, 0]} rotation-z={0.04 + index * 0.03} scale={[0.76, 0.78, 0.74]} />
          <mesh geometry={resources.shin} material={material} position={[-0.18, 0.28, 0]} rotation-z={0.06 + index * 0.04} scale={[0.74, 0.76, 0.74]} />
          <mesh geometry={resources.thigh} material={material} position={[0.16, 0.62, 0]} rotation-z={-0.06 - index * 0.03} scale={[0.76, 0.78, 0.74]} />
          <mesh geometry={resources.shin} material={material} position={[0.18, 0.28, 0]} rotation-z={-0.08 - index * 0.04} scale={[0.74, 0.76, 0.74]} />
          <mesh material={material} position={[0, 1.22, 0.08]}>
            <torusGeometry args={[0.53, 0.018, 6, 32]} />
          </mesh>
          <mesh material={material} position={[0, 1.22, 0.08]} rotation-z={index * 0.52}>
            <torusGeometry args={[0.72, 0.014, 5, 28, Math.PI * 1.35]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function attackEnvelope(moveId: string, progress: number): number {
  const normal = Object.values(CHRONO_MOVE_IDS).includes(
    moveId as (typeof CHRONO_MOVE_IDS)[keyof typeof CHRONO_MOVE_IDS],
  );
  const temporalMove = normal
    || moveId.startsWith('chrono.super.')
    || moveId.startsWith('chrono.finisher.');
  if (!temporalMove) return 0;
  const start = MathUtils.smoothstep(progress, 0.22, 0.48);
  const end = 1 - MathUtils.smoothstep(progress, 0.62, 0.96);
  return start * end;
}
