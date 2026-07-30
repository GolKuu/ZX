'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Group } from 'three';
import {
  MIM_SPECIAL_MOVE_IDS,
} from '@/src/data/mim-special-moves';
import { readCombatFighter } from '@/src/game/combatRuntime';

export function MimSpecialEffects({
  fighterId,
}: {
  readonly fighterId: 'p1' | 'p2';
}) {
  const wall = useRef<Group>(null);
  const banana = useRef<Group>(null);
  const fake = useRef<Group>(null);

  useFrame(({ clock }) => {
    const fighter = readCombatFighter(fighterId);
    const moveId = fighter?.action?.moveId ?? null;
    const frame = fighter?.action?.frame ?? 0;
    const time = clock.elapsedTime;

    if (wall.current !== null) {
      wall.current.visible = moveId === MIM_SPECIAL_MOVE_IDS.invisibleWall;
      wall.current.position.x = 1.12;
      wall.current.scale.y = 0.94 + Math.sin(time * 8.4) * 0.025;
      wall.current.rotation.y = Math.sin(time * 3.7) * 0.035;
    }
    if (banana.current !== null) {
      banana.current.visible = moveId === MIM_SPECIAL_MOVE_IDS.bananaTrap;
      const toss = Math.min(1, frame / 24);
      banana.current.position.x = 0.35 + toss * 0.72;
      banana.current.position.y = 0.08 + Math.sin(toss * Math.PI) * 0.72;
      banana.current.rotation.z = time * 9;
      banana.current.scale.setScalar(0.84 + Math.sin(time * 7) * 0.06);
    }
    if (fake.current !== null) {
      fake.current.visible = moveId === MIM_SPECIAL_MOVE_IDS.fakeOpening;
      const pulse = 1 + Math.sin(time * 13) * 0.08;
      fake.current.scale.setScalar(pulse);
      fake.current.rotation.z = -time * 0.7;
    }
  });

  return (
    <>
      <group ref={wall} visible={false}>
        <mesh position={[0, 1.15, 0]}>
          <planeGeometry args={[0.72, 2.35]} />
          <meshBasicMaterial
            color="#7a38ed"
            depthWrite={false}
            opacity={0.2}
            transparent
          />
        </mesh>
        <WallEdge position={[0, 0.06, 0.012]} scale={[1, 0.08, 1]} />
        <WallEdge position={[0, 2.24, 0.012]} scale={[1, 0.08, 1]} />
        <WallEdge position={[-0.32, 1.15, 0.012]} scale={[0.08, 3, 1]} />
        <WallEdge position={[0.32, 1.15, 0.012]} scale={[0.08, 3, 1]} />
        <mesh position={[0, 1.15, 0.02]} rotation={[0, 0, Math.PI / 4]}>
          <ringGeometry args={[0.18, 0.23, 6]} />
          <meshBasicMaterial color="#ffe23f" depthWrite={false} transparent />
        </mesh>
      </group>

      <group ref={banana} visible={false}>
        <mesh rotation={[0, 0, -0.35]}>
          <torusGeometry args={[0.2, 0.055, 8, 24, Math.PI * 1.15]} />
          <meshBasicMaterial color="#ffe23f" toneMapped={false} />
        </mesh>
        <mesh rotation={[0, Math.PI, 0.35]}>
          <torusGeometry args={[0.2, 0.055, 8, 24, Math.PI * 1.15]} />
          <meshBasicMaterial color="#ffba20" toneMapped={false} />
        </mesh>
      </group>

      <group ref={fake} position={[0.72, 1.18, 0.04]} visible={false}>
        <mesh>
          <ringGeometry args={[0.44, 0.49, 32]} />
          <meshBasicMaterial
            color="#ffe23f"
            depthWrite={false}
            opacity={0.76}
            transparent
          />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <ringGeometry args={[0.56, 0.59, 4]} />
          <meshBasicMaterial
            color="#7a38ed"
            depthWrite={false}
            opacity={0.7}
            transparent
          />
        </mesh>
      </group>
    </>
  );
}

function WallEdge({
  position,
  scale,
}: {
  readonly position: [number, number, number];
  readonly scale: [number, number, number];
}) {
  return (
    <mesh position={position} scale={scale}>
      <boxGeometry args={[0.72, 0.08, 0.055]} />
      <meshBasicMaterial color="#ffe23f" toneMapped={false} />
    </mesh>
  );
}
