'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Group } from 'three';
import { MIM_MOVE_IDS } from '@/src/data/mim-moves';
import { readCombatFighter } from '@/src/game/combatRuntime';
import { combatAnimationProgress } from '../combatAnimationProgress';

export function MimAttackEffects({
  fighterId,
}: {
  readonly fighterId: 'p1' | 'p2';
}) {
  const effect = useRef<Group>(null);
  const epicEffect = useRef<Group>(null);

  useFrame(({ clock }) => {
    const group = effect.current;
    const epic = epicEffect.current;
    const fighter = readCombatFighter(fighterId);
    if (group === null || fighter?.action === null || fighter === null) {
      if (group !== null) group.visible = false;
      if (epic !== null) epic.visible = false;
      return;
    }
    const kind = attackKind(fighter.action.moveId);
    // J and I now use the roster-wide lead-limb trails. Keeping the older MIM
    // diamond on top made those two normals much noisier than everyone else's.
    const usesLeadTrail = kind === 0 || kind === 2;
    group.visible = kind !== -1 && !usesLeadTrail;
    if (epic !== null) epic.visible = kind === 4;
    if (kind === -1 || usesLeadTrail) return;

    const progress = combatAnimationProgress(
      fighter.action.moveId,
      fighter.action.frame,
    );
    const pulse = Math.sin(Math.min(1, progress * 1.7) * Math.PI);
    if (kind === 4 && epic !== null) {
      const spin = Math.min(1, Math.max(0, (progress - 0.12) / 0.68));
      const flare = Math.sin(spin * Math.PI);
      group.visible = false;
      epic.position.set(0.12 + spin * 0.48, 1.08 + flare * 0.58, 0.16);
      epic.rotation.z = -0.4 + spin * Math.PI * 3;
      epic.rotation.y = clock.elapsedTime * 3.8;
      epic.scale.setScalar(0.6 + flare * 0.72);
      return;
    }
    group.position.set(
      0.62 + kind * 0.08,
      [1.52, 1.36, 0.45, 1.28][kind] ?? 1,
      0.12,
    );
    group.rotation.z = [-0.12, 0.42, -0.78, 1.25][kind] ?? 0;
    group.rotation.y = clock.elapsedTime * (kind % 2 === 0 ? 1.4 : -1.1);
    group.scale.setScalar(0.25 + pulse * (0.72 + kind * 0.12));
  });

  return (
    <>
      <group ref={effect} visible={false}>
        <mesh rotation-z={Math.PI / 4}>
          <ringGeometry args={[0.34, 0.405, 4]} />
          <meshBasicMaterial color="#d22e22" depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh>
          <torusGeometry args={[0.48, 0.035, 6, 32, Math.PI * 1.35]} />
          <meshBasicMaterial color="#ead6ad" depthWrite={false} toneMapped={false} />
        </mesh>
        {[-0.34, 0, 0.34].map((offset) => (
          <mesh key={offset} position={[offset, offset * 0.34, 0.02]} rotation-z={Math.PI / 4}>
            <planeGeometry args={[0.13, 0.13]} />
            <meshBasicMaterial color={offset === 0 ? '#fff4dc' : '#7f1716'} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <group ref={epicEffect} visible={false}>
        {[0.42, 0.58, 0.74].map((radius, index) => (
          <mesh key={radius} rotation-z={index * 0.72}>
            <torusGeometry args={[radius, 0.035 + index * 0.012, 6, 40, Math.PI * 1.55]} />
            <meshBasicMaterial
              color={['#fff4b0', '#ff8a1f', '#f02d7d'][index]}
              depthWrite={false}
              toneMapped={false}
              transparent
              opacity={0.92 - index * 0.18}
            />
          </mesh>
        ))}
        <mesh>
          <ringGeometry args={[0.2, 0.32, 8]} />
          <meshBasicMaterial color="#ffffff" depthWrite={false} toneMapped={false} />
        </mesh>
        {[-0.62, -0.31, 0, 0.31, 0.62].map((offset) => (
          <mesh key={offset} position={[offset, offset * 0.38, 0.03]} rotation-z={offset}>
            <planeGeometry args={[0.09, 0.36]} />
            <meshBasicMaterial color="#ffd15c" depthWrite={false} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </>
  );
}

function attackKind(moveId: string): number {
  if (moveId === MIM_MOVE_IDS.maskJab) return 0;
  if (moveId === MIM_MOVE_IDS.backElbow) return 1;
  if (moveId === MIM_MOVE_IDS.capoeiraKick) return 2;
  if (moveId === MIM_MOVE_IDS.spinningKick) return 3;
  if (moveId === MIM_MOVE_IDS.vaultKnee) return 4;
  return -1;
}
