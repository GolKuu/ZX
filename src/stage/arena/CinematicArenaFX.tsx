'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { AdditiveBlending, Group, Mesh, MeshBasicMaterial } from 'three';
import type { ArenaId } from '@/src/data/arenas';

const MOTES = Array.from({ length: 42 }, (_, index) => {
  const seed = index * 1.61803398875;
  return {
    x: Math.sin(seed * 2.3) * 7.8,
    y: 0.35 + ((index * 0.73) % 6.8),
    z: -5.5 - ((index * 1.17) % 7.5),
    speed: 0.18 + (index % 7) * 0.035,
    phase: seed % 6.28,
    size: 0.018 + (index % 4) * 0.012,
  };
});

const ARENA_PALETTE: Record<ArenaId, { readonly core: string; readonly rim: string; readonly mote: string }> = {
  'null-circle': { core: '#a8ffe0', rim: '#f0c86a', mote: '#fff0b0' },
  'storm-dome': { core: '#75ddff', rim: '#be78ff', mote: '#b8f3ff' },
  'ruined-megacity': { core: '#ff9b66', rim: '#ff476d', mote: '#ffd08a' },
};

/** Adds cinematic depth without introducing external textures or gameplay state. */
export function CinematicArenaFX({ arenaId }: { readonly arenaId: ArenaId }) {
  const motesRef = useRef<Group>(null);
  const motes = useMemo(() => MOTES, []);
  const palette = ARENA_PALETTE[arenaId];

  useFrame(({ clock }) => {
    const group = motesRef.current;
    if (group === null) return;
    const time = clock.elapsedTime;
    for (let index = 0; index < group.children.length; index += 1) {
      const mote = motes[index];
      const child = group.children[index] as Mesh | undefined;
      if (mote === undefined || child === undefined) continue;
      child.position.y = mote.y + Math.sin(time * mote.speed + mote.phase) * 0.16;
      child.position.x = mote.x + Math.sin(time * mote.speed * 0.7 + mote.phase) * 0.12;
      const material = child.material as MeshBasicMaterial;
      material.opacity = 0.18 + (Math.sin(time * 1.8 + mote.phase) + 1) * 0.12;
    }
  });

  return (
    <group>
      <group position={[0, 4.6, -13.5]} renderOrder={-18}>
        <mesh>
          <circleGeometry args={[2.1, 64]} />
          <meshBasicMaterial color={palette.core} opacity={0.12} transparent depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh rotation-z={Math.PI / 6}>
          <ringGeometry args={[2.65, 2.7, 6]} />
          <meshBasicMaterial color={palette.rim} opacity={0.34} transparent depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh rotation-z={-Math.PI / 6} scale={1.22}>
          <ringGeometry args={[2.65, 2.67, 6]} />
          <meshBasicMaterial color={palette.core} opacity={0.16} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      </group>

      <group position-z={-8.8} renderOrder={-12}>
        {[-5.8, -3.9, 3.9, 5.8].map((x, index) => (
          <mesh key={x} position={[x, 2.25 + (index % 2) * 0.7, 0]} rotation-z={index % 2 === 0 ? 0.08 : -0.08}>
            <planeGeometry args={[0.035, 5.2]} />
            <meshBasicMaterial color={index % 2 === 0 ? palette.core : palette.rim} opacity={0.28} transparent depthWrite={false} toneMapped={false} blending={AdditiveBlending} />
          </mesh>
        ))}
      </group>

      <group ref={motesRef} position-z={-0.25} renderOrder={4}>
        {motes.map((mote, index) => (
          <mesh key={`mote-${index}`} position={[mote.x, mote.y, mote.z]} scale={[mote.size * 2.5, mote.size, 1]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial color={index % 3 === 0 ? palette.mote : palette.core} opacity={0.22} transparent depthWrite={false} toneMapped={false} blending={AdditiveBlending} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
