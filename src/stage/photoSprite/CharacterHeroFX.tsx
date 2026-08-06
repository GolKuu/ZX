'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import {
  AdditiveBlending,
  Group,
  Mesh,
  MeshBasicMaterial,
} from 'three';
import { readCombatFighter, readLatestHit } from '@/src/game/combatRuntime';

type CharacterKind = 'glitch' | 'lucky' | 'mim' | 'titan' | 'vorgh';

const HERO_COLORS: Record<CharacterKind, string> = {
  glitch: '#48dfff',
  lucky: '#e8ba62',
  mim: '#bb6dff',
  titan: '#ff8c42',
  vorgh: '#ff3d5e',
};

const PARTICLES = Array.from({ length: 12 }, (_, index) => ({
  angle: (index / 12) * Math.PI * 2,
  radius: 0.86 + (index % 3) * 0.18,
  height: 0.52 + (index % 4) * 0.38,
  phase: index * 0.73,
}));

/** Cinematic character pass for sprite fighters: depth, rim energy and impact response. */
export function CharacterHeroFX({
  fighterId,
  kind,
}: {
  readonly fighterId: 'p1' | 'p2';
  readonly kind: CharacterKind;
}) {
  const root = useRef<Group>(null);
  const ring = useRef<Mesh>(null);
  const hitAt = useRef(-10);
  const seenHit = useRef(0);
  const color = HERO_COLORS[kind];
  const particleMaterials = useRef<Array<MeshBasicMaterial | null>>([]);

  useFrame(({ clock }, delta) => {
    const group = root.current;
    if (group === null) return;
    const fighter = readCombatFighter(fighterId);
    if (fighter === null) return;
    const latestHit = readLatestHit(fighterId);
    if (latestHit !== null && latestHit.serial !== seenHit.current) {
      seenHit.current = latestHit.serial;
      hitAt.current = clock.elapsedTime;
    }

    const hitPulse = Math.max(0, 1 - (clock.elapsedTime - hitAt.current) * 4.6);
    const breathe = 1 + Math.sin(clock.elapsedTime * 2.2 + fighterId.length) * 0.035;
    group.scale.set(breathe + hitPulse * 0.12, breathe - hitPulse * 0.06, 1);
    group.rotation.z = Math.sin(clock.elapsedTime * 0.7 + fighterId.length) * 0.018;

    if (ring.current !== null) {
      ring.current.rotation.z += delta * (0.45 + hitPulse * 2.4);
      ring.current.scale.setScalar(1 + hitPulse * 0.22);
      const material = ring.current.material as MeshBasicMaterial;
      material.opacity = 0.2 + hitPulse * 0.38;
    }

    for (let index = 0; index < particleMaterials.current.length; index += 1) {
      const material = particleMaterials.current[index];
      if (material != null) {
        const particle = PARTICLES[index];
        if (particle !== undefined) {
          material.opacity = 0.12 + (Math.sin(clock.elapsedTime * 1.7 + particle.phase) + 1) * 0.08 + hitPulse * 0.28;
        }
      }
    }
  });

  return (
    <group ref={root} position={[0, 1.52, -0.34]} renderOrder={-1}>
      <pointLight
        color={color}
        decay={2}
        distance={3.2}
        intensity={0.32}
        position={[fighterId === 'p1' ? -0.38 : 0.38, 0.72, 0.34]}
      />
      <mesh scale={[1.18, 1.46, 1]}>
        <circleGeometry args={[0.9, 48]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color={color}
          depthWrite={false}
          opacity={0.065}
          transparent
          toneMapped={false}
        />
      </mesh>
      <mesh ref={ring} rotation-z={Math.PI / 4}>
        <ringGeometry args={[0.93, 0.955, 8]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color={color}
          depthWrite={false}
          opacity={0.22}
          transparent
          toneMapped={false}
        />
      </mesh>
      <mesh position={[-0.88, 0.08, 0.01]} rotation-z={0.08}>
        <planeGeometry args={[0.025, 2.1]} />
        <meshBasicMaterial blending={AdditiveBlending} color={color} depthWrite={false} opacity={0.28} transparent toneMapped={false} />
      </mesh>
      <mesh position={[0.88, -0.08, 0.01]} rotation-z={-0.08}>
        <planeGeometry args={[0.025, 1.65]} />
        <meshBasicMaterial blending={AdditiveBlending} color={color} depthWrite={false} opacity={0.2} transparent toneMapped={false} />
      </mesh>
      {PARTICLES.map((particle, index) => (
        <mesh
          key={`hero-particle-${index}`}
          position={[Math.cos(particle.angle) * particle.radius, particle.height, 0.02]}
          scale={[0.035, 0.035, 0.035]}
        >
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial
            ref={(material) => { particleMaterials.current[index] = material; }}
            blending={AdditiveBlending}
            color={color}
            depthWrite={false}
            opacity={0.16}
            transparent
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
