'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { AdditiveBlending, Group, MeshBasicMaterial } from 'three';
import { readLatestBlock } from '@/src/game/combatRuntime';

const LIFE_SECONDS = 0.24;

export function GuardImpact() {
  return (
    <>
      <FighterGuardImpact fighterId="p1" />
      <FighterGuardImpact fighterId="p2" />
    </>
  );
}

function FighterGuardImpact({ fighterId }: {
  readonly fighterId: 'p1' | 'p2';
}) {
  const root = useRef<Group>(null);
  const shield = useRef<MeshBasicMaterial>(null);
  const flash = useRef<MeshBasicMaterial>(null);
  const seen = useRef(0);
  const startedAt = useRef(-1);
  const perfect = useRef(false);

  useFrame(({ clock }) => {
    const block = readLatestBlock(fighterId);
    const group = root.current;
    if (group === null) return;
    if (block !== null && block.serial !== seen.current) {
      seen.current = block.serial;
      startedAt.current = clock.elapsedTime;
      perfect.current = block.perfect;
      group.position.set(block.x, block.y, 0.58);
      group.rotation.z = block.away < 0 ? Math.PI : 0;
    }
    const age = clock.elapsedTime - startedAt.current;
    const active = startedAt.current >= 0 && age < LIFE_SECONDS;
    group.visible = active;
    if (!active) return;
    const progress = age / LIFE_SECONDS;
    const burst = Math.sin(Math.min(1, progress * 2.6) * Math.PI * 0.5);
    const fade = (1 - progress) ** 1.5;
    group.scale.setScalar((perfect.current ? 1.18 : 0.92) * (0.72 + burst * 0.48));
    if (shield.current !== null) shield.current.opacity = fade * (perfect.current ? 0.92 : 0.7);
    if (flash.current !== null) flash.current.opacity = fade * (perfect.current ? 0.9 : 0.55);
  });

  return (
    <group ref={root} visible={false}>
      <mesh rotation={[0, 0, -Math.PI * 0.42]}>
        <ringGeometry args={[0.62, 0.76, 32, 1, 0, Math.PI * 1.35]} />
        <meshBasicMaterial
          ref={shield}
          blending={AdditiveBlending}
          color="#68dfff"
          depthWrite={false}
          opacity={0}
          toneMapped={false}
          transparent
        />
      </mesh>
      <mesh>
        <circleGeometry args={[0.34, 24]} />
        <meshBasicMaterial
          ref={flash}
          blending={AdditiveBlending}
          color="#eaffff"
          depthWrite={false}
          opacity={0}
          toneMapped={false}
          transparent
        />
      </mesh>
    </group>
  );
}
