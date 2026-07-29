'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Group, type Material } from 'three';
import { buildDebris } from './arenaData';

interface FloatingDebrisProps {
  readonly material: Material;
}

export function FloatingDebris({ material }: FloatingDebrisProps) {
  const groupRef = useRef<Group>(null);
  const debris = useMemo(() => buildDebris(26, 12345), []);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (group === null) return;

    for (let index = 0; index < group.children.length; index += 1) {
      const child = group.children[index];
      const item = debris[index];
      if (child === undefined || item === undefined) continue;
      child.position.y = item.position[1] + Math.sin(clock.elapsedTime * item.speed) * 0.32;
      child.rotation.y = item.rotation[1] + clock.elapsedTime * item.speed * 0.22;
    }
  });

  return (
    <group ref={groupRef}>
      {debris.map((item, index) => (
        <mesh
          key={`debris-${String(index)}`}
          material={material}
          position={[item.position[0], item.position[1], item.position[2]]}
          rotation={[item.rotation[0], item.rotation[1], item.rotation[2]]}
          scale={[item.scale[0], item.scale[1], item.scale[2]]}
        >
          <boxGeometry args={[1, 1, 1]} />
        </mesh>
      ))}
    </group>
  );
}
