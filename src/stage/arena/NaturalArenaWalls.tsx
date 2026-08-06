'use client';

import { ARENA_RADIUS } from './arenaData';

const ROCKS = [
  { x: -1.45, y: 0.48, scale: [1.2, 0.9, 0.72] as const, rotation: -0.12 },
  { x: -0.35, y: 0.68, scale: [1.05, 1.28, 0.82] as const, rotation: 0.08 },
  { x: 0.72, y: 0.52, scale: [1.28, 0.98, 0.76] as const, rotation: -0.06 },
  { x: 1.78, y: 0.8, scale: [1.18, 1.5, 0.9] as const, rotation: 0.1 },
] as const;

/** Low-poly cliff edges that frame the fight without reading as fence posts. */
export function NaturalArenaWalls() {
  return (
    <group>
      <NaturalWall side={-1} />
      <NaturalWall side={1} />
    </group>
  );
}

function NaturalWall({ side }: { readonly side: -1 | 1 }) {
  return (
    <group position={[side * (ARENA_RADIUS + 0.22), 0, -0.62]}>
      <mesh position={[side * 1.18, 0.36, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.15, 0.72, 0.92]} />
        <meshStandardMaterial color="#4d514c" roughness={0.96} />
      </mesh>
      {ROCKS.map((rock, index) => (
        <mesh
          key={rock.x}
          position={[side * rock.x, rock.y, index % 2 === 0 ? 0.02 : -0.08]}
          rotation={[0.04 * (index - 1), rock.rotation * side, 0.06 * (index - 2)]}
          scale={rock.scale}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[0.7, 1]} />
          <meshStandardMaterial
            color={index % 2 === 0 ? '#5b5d55' : '#68675d'}
            roughness={0.98}
          />
        </mesh>
      ))}
      <mesh position={[side * 1.15, -0.04, 0.02]} receiveShadow>
        <boxGeometry args={[3.8, 0.18, 1.08]} />
        <meshStandardMaterial color="#292d2b" roughness={1} />
      </mesh>
    </group>
  );
}
