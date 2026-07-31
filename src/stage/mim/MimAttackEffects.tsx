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

  useFrame(({ clock }) => {
    const group = effect.current;
    const fighter = readCombatFighter(fighterId);
    if (group === null || fighter?.action === null || fighter === null) {
      if (group !== null) group.visible = false;
      return;
    }
    const kind = attackKind(fighter.action.moveId);
    group.visible = kind !== -1;
    if (kind === -1) return;

    const progress = combatAnimationProgress(
      fighter.action.moveId,
      fighter.action.frame,
    );
    const pulse = Math.sin(Math.min(1, progress * 1.7) * Math.PI);
    group.position.set(
      fighter.facing * (0.62 + kind * 0.08),
      [1.52, 1.36, 0.45, 1.28][kind] ?? 1,
      0.12,
    );
    group.rotation.z = fighter.facing * (
      [-0.12, 0.42, -0.78, 1.25][kind] ?? 0
    );
    group.rotation.y = clock.elapsedTime * (kind % 2 === 0 ? 1.4 : -1.1);
    group.scale.setScalar(0.25 + pulse * (0.72 + kind * 0.12));
  });

  return (
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
  );
}

function attackKind(moveId: string): number {
  if (moveId === MIM_MOVE_IDS.maskJab) return 0;
  if (moveId === MIM_MOVE_IDS.backElbow) return 1;
  if (moveId === MIM_MOVE_IDS.capoeiraKick) return 2;
  if (moveId === MIM_MOVE_IDS.spinningKick) return 3;
  return -1;
}
