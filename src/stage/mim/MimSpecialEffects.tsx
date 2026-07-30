'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Group } from 'three';
import {
  MIM_SPECIAL_MOVE_IDS,
} from '@/src/data/mim-special-moves';
import {
  combatRenderFrame,
  readCombatFighter,
} from '@/src/game/combatRuntime';
import { FIXED_SCALE } from '@/src/sim';

export function MimSpecialEffects({
  fighterId,
}: {
  readonly fighterId: 'p1' | 'p2';
}) {
  const wall = useRef<Group>(null);
  const banana = useRef<Group>(null);
  const fake = useRef<Group>(null);
  const activeMove = useRef<string | null>(null);
  const wallAnchor = useRef({ x: 0, y: 0, facing: 1 as -1 | 1 });
  const bananaAnchor = useRef({ x: 0, y: 0, facing: 1 as -1 | 1 });

  useFrame(({ clock }) => {
    const fighter = readCombatFighter(fighterId);
    if (fighter === null) {
      if (wall.current !== null) wall.current.visible = false;
      if (banana.current !== null) banana.current.visible = false;
      if (fake.current !== null) fake.current.visible = false;
      return;
    }
    const moveId = fighter?.action?.moveId ?? null;
    const frame = fighter?.action?.frame ?? 0;
    const time = clock.elapsedTime;
    const alpha = combatRenderFrame.interpolationAlpha;
    const originX = (
      fighter.previousPosition.x
      + (fighter.position.x - fighter.previousPosition.x) * alpha
    ) / FIXED_SCALE;
    const originY = fighter.position.y / FIXED_SCALE;
    const facing = fighter.facing;
    const began = moveId !== activeMove.current;
    activeMove.current = moveId;

    if (began && moveId === MIM_SPECIAL_MOVE_IDS.invisibleWall) {
      wallAnchor.current = { x: originX, y: originY, facing };
    }
    if (began && moveId === MIM_SPECIAL_MOVE_IDS.bananaTrap) {
      bananaAnchor.current = { x: originX, y: originY, facing };
    }

    if (wall.current !== null) {
      wall.current.visible = moveId === MIM_SPECIAL_MOVE_IDS.invisibleWall;
      const summon = Math.min(1, frame / 10);
      const dismiss = Math.min(1, Math.max(0, (100 - frame) / 12));
      const life = summon * dismiss;
      const anchor = wallAnchor.current;
      wall.current.position.set(
        anchor.x + anchor.facing * 1.12,
        anchor.y,
        0.055,
      );
      wall.current.scale.set(
        0.84 + life * 0.16,
        life * (0.94 + Math.sin(time * 8.4) * 0.025),
        1,
      );
      wall.current.rotation.y = Math.sin(time * 3.7) * 0.035;
      wall.current.rotation.z = Math.sin(time * 5.2) * 0.006;
    }
    if (banana.current !== null) {
      banana.current.visible = moveId === MIM_SPECIAL_MOVE_IDS.bananaTrap;
      const toss = Math.min(1, frame / 24);
      const landingAge = Math.max(0, frame - 24);
      const landingBounce = landingAge < 8
        ? Math.sin((landingAge / 8) * Math.PI) * 0.12
        : 0;
      const squash = landingAge < 5
        ? Math.sin((landingAge / 5) * Math.PI)
        : 0;
      const anchor = bananaAnchor.current;
      banana.current.position.set(
        anchor.x + anchor.facing * (0.35 + toss * 0.72),
        anchor.y + 0.08 + Math.sin(toss * Math.PI) * 0.72 + landingBounce,
        0.075,
      );
      banana.current.rotation.z = anchor.facing * (
        toss * Math.PI * 3.5 + (landingAge > 0 ? 0.25 : 0)
      );
      banana.current.scale.set(
        0.88 + squash * 0.26,
        0.88 - squash * 0.3,
        0.88,
      );
    }
    if (fake.current !== null) {
      fake.current.visible = moveId === MIM_SPECIAL_MOVE_IDS.fakeOpening;
      const charge = Math.min(1, frame / 36);
      const release = frame <= 36
        ? 1
        : Math.max(0, 1 - (frame - 36) / 7);
      const pulse = (0.4 + charge * 1.18 + Math.sin(time * 13) * 0.035)
        * release;
      fake.current.position.set(
        originX + facing * 0.72,
        originY + 1.18,
        0.08,
      );
      fake.current.scale.setScalar(pulse);
      fake.current.rotation.z = -facing * (charge * 0.55 + Math.sin(time * 4) * 0.04);
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
        <mesh position={[0, 1.15, 0.009]}>
          <planeGeometry args={[0.68, 2.28, 4, 12]} />
          <meshBasicMaterial
            color="#ffe23f"
            depthWrite={false}
            opacity={0.22}
            transparent
            wireframe
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
        <mesh position={[0, 0.72, 0.018]} rotation={[0, 0, -0.18]}>
          <boxGeometry args={[0.55, 0.025, 0.02]} />
          <meshBasicMaterial
            color="#cba7ff"
            depthWrite={false}
            opacity={0.72}
            transparent
          />
        </mesh>
        <mesh position={[0, 1.58, 0.018]} rotation={[0, 0, 0.18]}>
          <boxGeometry args={[0.55, 0.025, 0.02]} />
          <meshBasicMaterial
            color="#cba7ff"
            depthWrite={false}
            opacity={0.72}
            transparent
          />
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
        <mesh position={[0, 0.14, 0]} rotation={[0, 0, 0.25]}>
          <cylinderGeometry args={[0.025, 0.035, 0.13, 8]} />
          <meshBasicMaterial color="#755018" toneMapped={false} />
        </mesh>
        <mesh position={[0.08, 0.12, 0.01]} rotation={[0, 0, -0.5]}>
          <circleGeometry args={[0.045, 10]} />
          <meshBasicMaterial color="#fff4a0" toneMapped={false} />
        </mesh>
      </group>

      <group ref={fake} visible={false}>
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
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.82, 0.055, 0.025]} />
          <meshBasicMaterial color="#ffe23f" depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh rotation={[0, 0, -Math.PI / 4]}>
          <boxGeometry args={[0.82, 0.055, 0.025]} />
          <meshBasicMaterial color="#ffe23f" depthWrite={false} toneMapped={false} />
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
