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
    speed: 0.08 + (index % 5) * 0.018,
    drift: (index % 2 === 0 ? 1 : -1) * (0.08 + (index % 4) * 0.025),
    size: 0.018 + (index % 3) * 0.012,
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
      child.position.y = -0.2 + travel * 6.2;
      child.position.x = ember.x + Math.sin(clock.elapsedTime * 0.45 + index) * ember.drift;
    });
  });

  return (
    <group ref={groupRef} position-z={-8} renderOrder={-5}>
      {embers.map((ember, index) => (
        <mesh key={`${ember.x}-${index}`} position={[ember.x, ember.y, 0]}>
          <circleGeometry args={[ember.size, 8]} />
          <meshBasicMaterial
            color={index % 3 === 0 ? '#ffd49a' : '#d57b75'}
            depthWrite={false}
            opacity={0.58}
            toneMapped={false}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}
