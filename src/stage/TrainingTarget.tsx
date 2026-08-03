'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';
import { FIXED_SCALE } from '@/src/sim';
import { readCombatFighter, readLatestHit } from '@/src/game/combatRuntime';

export function TrainingTarget() {
  const group = useRef<Group>(null);
  const lastHit = useRef(0);
  const recoil = useRef(0);

  useFrame((_, delta) => {
    const target = group.current;
    const fighter = readCombatFighter('p2');
    if (target === null || fighter === null) return;

    const hit = readLatestHit('p2');
    if (hit !== null && hit.serial !== lastHit.current) {
      lastHit.current = hit.serial;
      recoil.current = 1;
    }
    recoil.current = Math.max(0, recoil.current - delta * 5);
    target.position.set(
      fighter.position.x / FIXED_SCALE,
      fighter.position.y / FIXED_SCALE,
      0,
    );
    target.rotation.z = -fighter.facing * recoil.current * 0.13;
    target.scale.setScalar(1 + recoil.current * 0.05);
  });

  return (
    <group ref={group}>
      <mesh position={[0, 0.13, 0]}>
        <cylinderGeometry args={[0.58, 0.78, 0.24, 24]} />
        <meshStandardMaterial color="#172536" metalness={0.75} roughness={0.32} />
      </mesh>
      <mesh position={[0, 1.45, 0]}>
        <cylinderGeometry args={[0.08, 0.11, 2.7, 16]} />
        <meshStandardMaterial color="#8193a5" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.78, 0.78, 0.18, 40]} />
        <meshStandardMaterial color="#101923" emissive="#113044" emissiveIntensity={0.8} />
      </mesh>
      {[0.55, 0.3].map((radius, index) => (
        <mesh key={radius} position={[0, 1.7, -0.105 - index * 0.006]}>
          <torusGeometry args={[radius, 0.055, 12, 40]} />
          <meshStandardMaterial
            color={index === 0 ? '#59ddff' : '#ff547f'}
            emissive={index === 0 ? '#1688aa' : '#b71949'}
            emissiveIntensity={2.3}
            toneMapped={false}
          />
        </mesh>
      ))}
      <mesh position={[0, 1.7, -0.12]}>
        <sphereGeometry args={[0.1, 18, 18]} />
        <meshBasicMaterial color="#fff1a8" toneMapped={false} />
      </mesh>
    </group>
  );
}
