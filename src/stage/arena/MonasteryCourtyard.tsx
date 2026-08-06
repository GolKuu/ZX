'use client';

import { ARENA_RADIUS } from './arenaData';
import { NaturalArenaWalls } from './NaturalArenaWalls';

const TILES = Array.from({ length: 33 }, (_, index) => index - 16);
const LANTERNS = [-4.68, -4.12, 4.12, 4.68] as const;

export function MonasteryCourtyard() {
  return (
    <group>
      <mesh position={[0, -0.035, -8.5]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[44, 32]} />
        <meshStandardMaterial color="#30373a" roughness={0.94} />
      </mesh>
      <mesh position={[0, -0.018, -3.5]} rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[ARENA_RADIUS + 0.34, 96]} />
        <meshStandardMaterial color="#a69273" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.006, -3.48]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[ARENA_RADIUS - 0.12, ARENA_RADIUS + 0.18, 96]} />
        <meshStandardMaterial color="#b42521" emissive="#3c0806" emissiveIntensity={0.18} roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.006, -3.45]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[1.18, 1.3, 64]} />
        <meshBasicMaterial color="#d8b84e" opacity={0.82} transparent toneMapped={false} />
      </mesh>
      {TILES.map((x) => (
        <mesh key={x} position={[x, -0.002, -0.06]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[0.025, 7.4]} />
          <meshBasicMaterial color="#5b4b3c" opacity={0.32} transparent />
        </mesh>
      ))}
      {LANTERNS.map((x) => <CourtyardLantern key={x} x={x} />)}
      <NaturalArenaWalls />
    </group>
  );
}

function CourtyardLantern({ x }: { readonly x: number }) {
  return (
    <group position={[x, 0.12, -0.28]}>
      <mesh>
        <boxGeometry args={[0.16, 0.26, 0.12]} />
        <meshStandardMaterial color="#991f1b" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.16, 0.01]}>
        <sphereGeometry args={[0.065, 12, 8]} />
        <meshBasicMaterial color="#ffd05f" toneMapped={false} />
      </mesh>
      <pointLight color="#ffb054" decay={2} distance={2.2} intensity={0.55} position={[0, 0.18, 0.25]} />
    </group>
  );
}
