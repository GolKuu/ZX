'use client';

import { ARENA_RADIUS } from './arenaData';

const TILES = Array.from({ length: 33 }, (_, index) => index - 16);
const CANDLES = [-4.72, -4.26, 4.26, 4.72] as const;

export function MonasteryCourtyard() {
  return (
    <group>
      <mesh position={[0, -0.035, -8.5]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[44, 32]} />
        <meshStandardMaterial color="#51483e" roughness={0.94} />
      </mesh>
      <mesh position={[0, -0.018, -3.5]} rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[ARENA_RADIUS + 0.34, 96]} />
        <meshStandardMaterial color="#8d806e" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.006, -3.48]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[ARENA_RADIUS - 0.12, ARENA_RADIUS + 0.18, 96]} />
        <meshStandardMaterial color="#c6aa72" emissive="#4d2c10" emissiveIntensity={0.18} roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.006, -3.45]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[1.18, 1.3, 64]} />
        <meshBasicMaterial color="#e1bd72" opacity={0.7} transparent toneMapped={false} />
      </mesh>
      {TILES.map((x) => (
        <mesh key={x} position={[x, -0.002, -0.06]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[0.025, 7.4]} />
          <meshBasicMaterial color="#493e34" opacity={0.34} transparent />
        </mesh>
      ))}
      {CANDLES.map((x) => <CourtyardCandle key={x} x={x} />)}
      <StonePost x={-ARENA_RADIUS} />
      <StonePost x={ARENA_RADIUS} />
    </group>
  );
}

function CourtyardCandle({ x }: { readonly x: number }) {
  return (
    <group position={[x, 0.12, -0.28]}>
      <mesh>
        <planeGeometry args={[0.055, 0.24]} />
        <meshBasicMaterial color="#efe2bd" />
      </mesh>
      <mesh position={[0, 0.16, 0.01]}>
        <circleGeometry args={[0.055, 12]} />
        <meshBasicMaterial color="#ffb23e" toneMapped={false} />
      </mesh>
      <pointLight color="#ffb054" decay={2} distance={2.2} intensity={0.55} position={[0, 0.18, 0.25]} />
    </group>
  );
}

function StonePost({ x }: { readonly x: number }) {
  return (
    <group position={[x, 0.55, -0.38]}>
      <mesh castShadow>
        <boxGeometry args={[0.24, 1.1, 0.24]} />
        <meshStandardMaterial color="#756b5d" roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.62, 0]} rotation-y={Math.PI / 4}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color="#b69b68" roughness={0.78} />
      </mesh>
    </group>
  );
}
