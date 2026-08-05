'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Group } from 'three';

interface Ember {
  readonly x: number;
  readonly y: number;
  readonly speed: number;
  readonly drift: number;
  readonly size: number;
}

function makeEmbers(): Ember[] {
  return Array.from({ length: 18 }, (_, index) => ({
    x: -10 + ((index * 29) % 20),
    y: 0.4 + ((index * 17) % 50) / 10,
    speed: 0.045 + (index % 5) * 0.014,
    drift: (index % 2 === 0 ? 1 : -1) * (0.18 + (index % 4) * 0.04),
    size: 0.028 + (index % 3) * 0.014,
  }));
}

export function ArenaEmbers2D() {
  const groupRef = useRef<Group>(null);
  const embers = useMemo(() => makeEmbers(), []);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (group === null) return;
    group.children.forEach((child, index) => {
      const ember = embers[index];
      if (ember === undefined) return;
      const travel = (clock.elapsedTime * ember.speed + ember.y / 6) % 1;
      child.position.y = 5.9 - travel * 6.4;
      child.position.x = ember.x + Math.sin(clock.elapsedTime * 0.8 + index) * ember.drift;
      child.rotation.z = clock.elapsedTime * (index % 2 === 0 ? 0.5 : -0.42) + index;
    });
  });

  return (
    <group ref={groupRef} position-z={-8} renderOrder={-5}>
      {embers.map((ember, index) => (
        <mesh key={`${ember.x}-${index}`} position={[ember.x, ember.y, 0]}>
          <planeGeometry args={[ember.size * 1.6, ember.size * 1.6]} />
          <meshBasicMaterial
            color={index % 4 === 0 ? '#ffe49a' : index % 3 === 0 ? '#d4e9b1' : '#86b56d'}
            depthWrite={false}
            opacity={0.68}
            toneMapped={false}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}
