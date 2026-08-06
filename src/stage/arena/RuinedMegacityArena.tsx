'use client';

import { useEffect, useMemo } from 'react';
import { ArenaEmbers2D } from './ArenaEmbers2D';
import { createRuinedMegacityTexture } from './ruinedMegacityTexture';
import { NaturalArenaWalls } from './NaturalArenaWalls';

const ROAD_MARKS = [-4.5, -2.7, -0.9, 0.9, 2.7, 4.5] as const;

export function RuinedMegacityArena() {
  const texture = useMemo(() => createRuinedMegacityTexture(), []);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <group>
      <mesh position={[0, 4.1, -22]} renderOrder={-20}>
        <planeGeometry args={[64, 36]} />
        <meshBasicMaterial depthWrite={false} fog={false} map={texture} toneMapped={false} />
      </mesh>

      <mesh position={[0, -0.02, -8]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[42, 32]} />
        <meshStandardMaterial color="#17131e" metalness={0.18} roughness={0.86} />
      </mesh>
      <mesh position={[0, -0.009, -3.7]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[32, 8.5]} />
        <meshStandardMaterial color="#25202a" metalness={0.12} roughness={0.9} />
      </mesh>
      {ROAD_MARKS.map((x) => (
        <mesh key={x} position={[x, 0.004, -4.1]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[0.84, 3.8]} />
          <meshBasicMaterial color="#d8c66c" opacity={0.46} transparent />
        </mesh>
      ))}

      <NaturalArenaWalls />
      <ArenaEmbers2D />
    </group>
  );
}
