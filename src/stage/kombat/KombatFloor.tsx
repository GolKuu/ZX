'use client';

import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  createArenaFloorMaterial,
  type ArenaFloorMaterial,
} from '@/src/render/arenaFloorMaterial';
import { ARENA_RADIUS } from '../arena/arenaData';
import type { KombatSurfaces } from './kombatMaterials';
import type { KombatTheme } from './kombatTheme';

/** Descending stone rings around the disc. Real steps, not a painted edge. */
const STEPS = [
  { radius: ARENA_RADIUS + 0.55, height: 0.26, y: -0.13 },
  { radius: ARENA_RADIUS + 1.35, height: 0.26, y: -0.39 },
  { radius: ARENA_RADIUS + 2.4, height: 0.3, y: -0.67 },
] as const;

/**
 * The fighting platform, built as a solid object standing on a floor.
 *
 * The stage it replaces was a disc drawn on a plane with a red line painted
 * round it — from a level camera that is convincing, and from any other angle
 * it is a sticker. Giving the platform a plinth, three steps down to a sunken
 * floor and a lip that catches the key light means the camera can drop, tilt or
 * swing without the ground falling apart, which is what the cinematic camera
 * moves need to be worth having.
 */
export function KombatFloor({
  surfaces,
  theme,
}: {
  readonly surfaces: KombatSurfaces;
  readonly theme: KombatTheme;
}) {
  const floorMaterial: ArenaFloorMaterial = useMemo(
    () =>
      createArenaFloorMaterial({
        base: theme.floor,
        edge: theme.floorEdge,
        line: theme.floorLine,
        radius: ARENA_RADIUS,
        reflection: theme.rimWarm,
      }),
    [theme],
  );

  useFrame(({ clock }) => {
    // Three.js uniforms are intentionally mutable render state.
    // eslint-disable-next-line react-hooks/immutability
    floorMaterial.arena.uTime.value = clock.elapsedTime;
  });

  useEffect(() => () => floorMaterial.dispose(), [floorMaterial]);

  return (
    <group>
      {/* Sunken outer floor. Sits below the steps so the platform reads as
          raised; wide enough that the fog, not an edge, ends it. */}
      <mesh
        material={surfaces.stoneDark}
        position={[0, -0.98, 0]}
        receiveShadow
        rotation-x={-Math.PI / 2}
      >
        <circleGeometry args={[40, 64]} />
      </mesh>

      {STEPS.map((step) => (
        <mesh
          key={step.radius}
          castShadow
          material={surfaces.stone}
          position={[0, step.y, 0]}
          receiveShadow
        >
          <cylinderGeometry args={[step.radius, step.radius + 0.06, step.height, 96, 1]} />
        </mesh>
      ))}

      {/* Plinth: the mass under the disc. Slightly tapered so the key light
          rakes the side and gives the platform a lit top and a dark flank. */}
      <mesh
        castShadow
        material={surfaces.stone}
        position={[0, -0.06, 0]}
        receiveShadow
      >
        <cylinderGeometry args={[ARENA_RADIUS + 0.06, ARENA_RADIUS - 0.1, 0.16, 128, 1]} />
      </mesh>

      <mesh
        material={floorMaterial}
        position={[0, 0.024, 0]}
        receiveShadow
        rotation-x={-Math.PI / 2}
      >
        <circleGeometry args={[ARENA_RADIUS, 160]} />
      </mesh>

      {/* Hot lip on the rim. The one place the stage is allowed to be bright
          near the fighters' feet — it draws the eye to the fighting area. */}
      <mesh material={surfaces.glow} position={[0, 0.03, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[ARENA_RADIUS - 0.08, ARENA_RADIUS + 0.04, 128]} />
      </mesh>
    </group>
  );
}
