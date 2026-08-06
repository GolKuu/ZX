'use client';

import { useEffect, useMemo } from 'react';
import { Color, MeshStandardMaterial } from 'three';
import type { KombatTheme } from './kombatTheme';

/**
 * The world past the arcade: real masses standing far behind the wall.
 *
 * These exist to be seen *through the arch openings*, which is the whole point
 * of piercing the wall. They are geometry rather than a painted strip because
 * the camera pans several metres during a match, and a painted horizon slides
 * with the camera while a built one holds still — the parallax between the
 * pillars, the wall and these ridges is what makes the distance real.
 */
const RIDGE = [
  { x: -26, z: -46, radius: 9, height: 26 },
  { x: -13, z: -52, radius: 7.5, height: 20 },
  { x: 0, z: -58, radius: 11, height: 32 },
  { x: 14, z: -50, radius: 8, height: 23 },
  { x: 27, z: -44, radius: 9.5, height: 27 },
] as const;

const SPIRES = [
  { x: -19, z: -34, width: 3.2, height: 17 },
  { x: -8.5, z: -30, width: 2.4, height: 12.5 },
  { x: 9.5, z: -31, width: 2.8, height: 14 },
  { x: 20, z: -35, width: 3.6, height: 19 },
] as const;

export function KombatHorizon({ theme }: { readonly theme: KombatTheme }) {
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: new Color(theme.stoneShadow),
        roughness: 1,
        metalness: 0,
        dithering: true,
      }),
    [theme],
  );
  useEffect(() => () => material.dispose(), [material]);

  return (
    <group>
      {RIDGE.map((peak) => (
        <mesh
          key={peak.x}
          material={material}
          position={[peak.x, peak.height * 0.5 - 6, peak.z]}
        >
          <coneGeometry args={[peak.radius, peak.height, 7, 1]} />
        </mesh>
      ))}
      {SPIRES.map((spire) => (
        <mesh
          key={spire.x}
          material={material}
          position={[spire.x, spire.height * 0.5 - 2.5, spire.z]}
        >
          <boxGeometry args={[spire.width, spire.height, spire.width]} />
        </mesh>
      ))}
    </group>
  );
}
