'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { AdditiveBlending, Group, Mesh } from 'three';
import {
  combatRenderFrame,
  readCombatFighter,
} from '@/src/game/combatRuntime';
import { FIXED_SCALE } from '@/src/sim';

export function VorghEffects({ fighterId }: {
  readonly fighterId: 'p1' | 'p2';
}) {
  const root = useRef<Group>(null);
  const aura = useRef<Mesh>(null);
  const slash = useRef<Mesh>(null);
  const wave = useRef<Mesh>(null);
  const superBurst = useRef<Mesh>(null);
  const opponentId = fighterId === 'p1' ? 'p2' : 'p1';

  useFrame(({ clock }) => {
    const fighter = readCombatFighter(fighterId);
    const group = root.current;
    if (fighter === null || group === null) return;
    const alpha = combatRenderFrame.interpolationAlpha;
    group.position.x = (
      fighter.previousPosition.x
      + (fighter.position.x - fighter.previousPosition.x) * alpha
    ) / FIXED_SCALE;
    group.position.y = fighter.position.y / FIXED_SCALE;
    const opponent = readCombatFighter(opponentId);
    const facing = opponent === null
      ? fighter.facing
      : opponent.position.x >= fighter.position.x ? 1 : -1;
    group.scale.x = facing;
    const rage = fighter.resource / Math.max(1, fighter.resourceMaximum);
    const pulse = 1 + Math.sin(clock.elapsedTime * 8) * 0.07;
    if (aura.current !== null) {
      aura.current.visible = rage >= 0.25;
      aura.current.scale.setScalar((0.78 + rage * 0.45) * pulse);
      const material = aura.current.material;
      if (!Array.isArray(material)) material.opacity = 0.08 + rage * 0.18;
    }
    if (slash.current !== null) {
      const action = fighter.action;
      const slashing = action?.moveId.includes('slash') === true
        || action?.moveId.includes('rake') === true;
      slash.current.visible = slashing;
      if (slashing && action !== null) {
        slash.current.rotation.z = -0.8 + Math.min(1, action.frame / 10) * 1.6;
      }
    }
    const moveId = fighter.action?.moveId ?? '';
    if (wave.current !== null) {
      wave.current.visible = moveId.includes('blood-roar');
      const progress = Math.min(1, (fighter.action?.frame ?? 0) / 20);
      wave.current.scale.set(0.4 + progress * 2.4, 0.7 + progress, 1);
    }
    if (superBurst.current !== null) {
      const superMove = moveId.includes('dominion')
        || moveId.includes('last-beast')
        || moveId.includes('unchained');
      superBurst.current.visible = superMove;
      const beat = 0.8 + Math.sin(clock.elapsedTime * 14) * 0.12;
      superBurst.current.scale.setScalar(beat + rage * 0.45);
      superBurst.current.rotation.z += 0.025;
    }
  });

  return (
    <group ref={root}>
      <mesh ref={aura} position={[0, 1.25, -0.08]} visible={false}>
        <ringGeometry args={[0.7, 0.9, 12]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color="#ff4518"
          depthWrite={false}
          opacity={0.18}
          transparent
          toneMapped={false}
        />
      </mesh>
      <mesh ref={slash} position={[0.72, 1.45, 0.22]} visible={false}>
        <ringGeometry args={[0.48, 0.6, 10, 1, 0, 2.1]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color="#ff9a36"
          depthWrite={false}
          opacity={0.9}
          transparent
          toneMapped={false}
        />
      </mesh>
      <mesh ref={wave} position={[0.82, 1.22, 0.18]} visible={false}>
        <ringGeometry args={[0.38, 0.48, 16]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color="#ff6a24"
          depthWrite={false}
          opacity={0.72}
          transparent
          toneMapped={false}
        />
      </mesh>
      <mesh ref={superBurst} position={[0, 1.2, -0.02]} visible={false}>
        <ringGeometry args={[0.92, 1.12, 18]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color="#ffb14a"
          depthWrite={false}
          opacity={0.48}
          transparent
          toneMapped={false}
        />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <mesh
          key={index}
          position={[
            (index % 2 === 0 ? -1 : 1) * (0.26 + index * 0.025),
            0.65 + index * 0.24,
            0.12,
          ]}
          rotation-z={index * 0.7}
        >
          <planeGeometry args={[0.035, 0.18]} />
          <meshBasicMaterial color="#ff5a16" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
