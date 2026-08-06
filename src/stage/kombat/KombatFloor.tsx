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
          raised; wide enough that the fog, not an edge, ends it.

          Same stone as the steps, not the near-black shadow stone it used to
          be. The braziers light the bottom step to a bright warm orange, and
          putting a surface with almost no albedo directly against it made the
          platform's outer edge a maximum-contrast boundary — every bit of
          aliasing along that silhouette bloomed into a torn black smear at the
          edge of frame. Sharing the material lets the same lights fall on both
          sides of the step, and the edge becomes an edge again. */}
      <mesh
        material={surfaces.stone}
        position={[0, -0.98, 0]}
        receiveShadow
        rotation-x={-Math.PI / 2}
      >
        <circleGeometry args={[40, 96]} />
      </mesh>

      {/* The platform is squashed along the camera axis.
          A true circle 7.2 m across reaches 7.2 m *toward the lens*, so from a
          fight camera the near edge rushes up and eats the bottom third of the
          frame — the fighters end up standing on the horizon of their own
          floor. Foreshortening hides the squash entirely; what the audience
          sees is a round arena that leaves room for the fight. Simulation
          bounds are in X and never see this. */}
      <group scale={[1, 1, 0.66]}>
      {/* The platform receives shadows but casts none.
          A 15 m disc 26 cm thick presents an almost perfectly grazing face to
          the key light, and a grazing caster is the classic shadow-acne case:
          the steps shadowed *themselves* in a torn, aliased wedge that ate a
          bite out of the rim glow every frame. Nothing in the shot needs the
          floor's own shadow — the fighters and the architecture cast, the
          ground receives. */}
      {STEPS.map((step) => (
        <mesh
          key={step.radius}
          material={surfaces.stone}
          position={[0, step.y, 0]}
          receiveShadow
        >
          <cylinderGeometry args={[step.radius, step.radius + 0.06, step.height, 96, 1]} />
        </mesh>
      ))}

      {/* Plinth: the mass under the disc. Slightly tapered so the key light
          rakes the side and gives the platform a lit top and a dark flank. */}
      <mesh material={surfaces.stone} position={[0, -0.06, 0]} receiveShadow>
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

      {/* Warm lip on the rim: the edge of the fighting area, marked in light.
          Deliberately thin and dim — it sits at the bottom of frame right where
          the eye lands, so anything brighter competes with the fighters. */}
      <mesh material={surfaces.glow} position={[0, 0.03, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[ARENA_RADIUS - 0.05, ARENA_RADIUS + 0.02, 128]} />
      </mesh>
      </group>
    </group>
  );
}
