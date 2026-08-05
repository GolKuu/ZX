'use client';

import { useEffect, useMemo } from 'react';
import { ArenaEmbers2D } from './ArenaEmbers2D';
import { ARENA_RADIUS } from './arenaData';
import { createRuinedMegacityTexture } from './ruinedMegacityTexture';

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

      <StreetEdge x={-ARENA_RADIUS} facing={1} />
      <StreetEdge x={ARENA_RADIUS} facing={-1} />
      <ArenaEmbers2D />
    </group>
  );
}

function StreetEdge({ x, facing }: { readonly x: number; readonly facing: 1 | -1 }) {
  return (
    <group position={[x, 0, -0.5]} scale-x={facing}>
      <mesh position={[0.34, 0.24, 0]}>
        <boxGeometry args={[0.68, 0.48, 0.72]} />
        <meshStandardMaterial color="#30273a" metalness={0.42} roughness={0.72} />
      </mesh>
      <mesh position={[0.34, 0.5, 0.37]}>
        <planeGeometry args={[0.46, 0.08]} />
        <meshBasicMaterial color="#e95079" toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.15, -0.08]}>
        <boxGeometry args={[0.09, 2.3, 0.09]} />
        <meshStandardMaterial color="#342942" metalness={0.65} roughness={0.55} />
      </mesh>
      <mesh position={[0, 2.28, -0.07]}>
        <boxGeometry args={[0.38, 0.12, 0.11]} />
        <meshBasicMaterial color="#ff667e" toneMapped={false} />
      </mesh>
      <mesh position={[0.62, 0.04, -0.15]} rotation={[0.2, 0.35, -0.14]}>
        <boxGeometry args={[0.55, 0.14, 0.4]} />
        <meshStandardMaterial color="#51475b" roughness={0.92} />
      </mesh>
    </group>
  );
}
