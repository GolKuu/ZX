'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Group } from 'three';
import { readCombatFighter } from '@/src/game/combatRuntime';

export function LuckySpriteEffects({ fighterId }: {
  readonly fighterId: 'p1' | 'p2';
}) {
  const ring = useRef<Group>(null);
  const tokens = useRef<Group>(null);
  const flare = useRef<Group>(null);

  useFrame(({ clock }) => {
    const fighter = readCombatFighter(fighterId);
    if (fighter === null) return;
    const time = clock.elapsedTime;
    const perfect = fighter.guarding && fighter.guardFrames <= 3;
    if (ring.current !== null) {
      ring.current.visible = fighter.guarding;
      ring.current.position.y = fighter.crouching ? 0.86 : 1.34;
      ring.current.scale.setScalar(perfect ? 1.12 : fighter.hitstop > 0 ? 0.92 : 0.7);
      ring.current.rotation.z = perfect ? time * 3.4 : 0;
    }
    if (tokens.current !== null) {
      const powered = fighter.resource >= 25;
      tokens.current.visible = powered;
      tokens.current.rotation.z = time * (fighter.resource >= 100 ? 2.8 : 1.2);
      tokens.current.scale.setScalar(0.72 + fighter.resource / 250);
    }
    if (flare.current !== null) {
      const moveId = fighter.action?.moveId ?? '';
      const active = moveId.startsWith('lucky.');
      flare.current.visible = active;
      flare.current.rotation.z = time * 5;
      flare.current.scale.setScalar(
        moveId.includes('ultimate') ? 1.8 : moveId.includes('enhanced') ? 1.2 : 0.72,
      );
    }
  });

  return (
    <>
      <group ref={ring} visible={false}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.55, 0.035, 4, 24]} />
          <meshBasicMaterial color="#e5bc4e" transparent opacity={0.8} toneMapped={false} />
        </mesh>
      </group>
      <group ref={tokens} position={[0, 1.25, -0.02]} visible={false}>
        {[-1, 0, 1].map((slot) => (
          <mesh key={slot} position={[slot * 0.72, Math.abs(slot) * 0.24, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.1, 0.1, 0.02]} />
            <meshBasicMaterial color={slot === 0 ? '#9f1e37' : '#e5bc4e'} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <group ref={flare} position={[0.58, 1.2, 0.02]} visible={false}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.42, 0.025, 4, 12, Math.PI * 1.45]} />
          <meshBasicMaterial color="#d8af45" transparent opacity={0.72} toneMapped={false} />
        </mesh>
      </group>
    </>
  );
}
