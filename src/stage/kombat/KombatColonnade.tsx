'use client';

import type { KombatSurfaces } from './kombatMaterials';

/**
 * Pillar positions, flanking only.
 *
 * Nothing is allowed between the lens and the fighters — a stage element that
 * slides in front of the fight is worse than no stage at all. Every column
 * therefore stands at |x| ≥ 8.4 and behind z = -3, which puts them in the outer
 * thirds of the frame where they do the job they are here for: giving the eye
 * something with known size receding into the fog, so the room has depth.
 */
const COLUMNS = [
  { x: 8.6, z: -3.4, height: 7.2 },
  { x: 11.4, z: -8.2, height: 7.8 },
  { x: 14.6, z: -13.6, height: 8.4 },
  { x: 18.2, z: -19.5, height: 9 },
] as const;

export function KombatColonnade({ surfaces }: { readonly surfaces: KombatSurfaces }) {
  return (
    <group>
      {COLUMNS.map((column) =>
        [-1, 1].map((side) => (
          <StonePillar
            key={`${String(column.x)}:${String(side)}`}
            height={column.height}
            material={surfaces}
            x={column.x * side}
            z={column.z}
          />
        )),
      )}
      <BackArcade surfaces={surfaces} />
    </group>
  );
}

function StonePillar({
  height,
  material,
  x,
  z,
}: {
  readonly height: number;
  readonly material: KombatSurfaces;
  readonly x: number;
  readonly z: number;
}) {
  const shaft = height - 1.1;
  return (
    <group position={[x, -1, z]}>
      <mesh castShadow material={material.stone} position={[0, 0.28, 0]} receiveShadow>
        <boxGeometry args={[1.5, 0.56, 1.5]} />
      </mesh>
      <mesh
        castShadow
        material={material.stone}
        position={[0, 0.56 + shaft * 0.5, 0]}
        receiveShadow
      >
        <cylinderGeometry args={[0.46, 0.56, shaft, 16, 1]} />
      </mesh>
      <mesh
        castShadow
        material={material.stone}
        position={[0, height - 0.24, 0]}
        receiveShadow
      >
        <boxGeometry args={[1.3, 0.48, 1.3]} />
      </mesh>
    </group>
  );
}

/**
 * The wall the arena stands in front of, pierced by arches.
 *
 * Openings matter more than the wall: the sky glow read through a gap is what
 * tells the eye there is somewhere beyond this room, and the piers between them
 * give the fighters a hard vertical to be silhouetted against.
 */
function BackArcade({ surfaces }: { readonly surfaces: KombatSurfaces }) {
  const piers = [-9.6, -5.8, -2, 2, 5.8, 9.6];
  return (
    // Nothing in the arcade casts. It stands fifteen metres behind the disc and
    // the key light rakes backwards, so every shadow it could throw lands off
    // the back of the stage where no camera angle can see it — pure cost. It
    // still receives, which is what makes it read as lit stone.
    <group position={[0, -1, -15]}>
      {piers.map((x) => (
        <mesh key={x} material={surfaces.stone} position={[x, 3.4, 0]} receiveShadow>
          <boxGeometry args={[1.6, 6.8, 1.9]} />
        </mesh>
      ))}
      {/* Lintel course across the top of the openings. */}
      <mesh material={surfaces.stone} position={[0, 7.3, 0]} receiveShadow>
        <boxGeometry args={[22.8, 1, 2.1]} />
      </mesh>
      <mesh material={surfaces.stoneDark} position={[0, 8.35, 0.15]} receiveShadow>
        <boxGeometry args={[24.4, 1.1, 2.6]} />
      </mesh>
      {/* Low wall across the base of the openings only.
          A full-height slab used to stand behind this arcade, and it turned
          every arch into a dead black panel — the arches are worth building
          precisely because you can see the sky and the far ridges through them,
          and blocking that is the whole cost with none of the benefit. What is
          left is a parapet: it stops the eye running out along the ground while
          leaving the openings open. */}
      <mesh material={surfaces.stoneDark} position={[0, 0.85, -3]} receiveShadow>
        <boxGeometry args={[46, 1.7, 1.4]} />
      </mesh>
    </group>
  );
}
