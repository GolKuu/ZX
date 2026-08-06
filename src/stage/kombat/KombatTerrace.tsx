'use client';

import { useMemo } from 'react';
import type { KombatSurfaces } from './kombatMaterials';

const SEGMENTS = 13;
/** Arc the terrace spans, centred behind the platform. */
const ARC = Math.PI * 1.04;

/**
 * A tiered stone bank curving round the back of the arena.
 *
 * Fills the band between the platform and the arcade — a stretch of frame that
 * was pure black, and read as the set simply stopping a few metres behind the
 * fight. Depth needs something at *every* distance: the eye reads a room by
 * stepping from the floor to a mid-ground to a far wall, and with the middle
 * step missing the arcade looked painted on rather than fifteen metres away.
 *
 * Broken into segments at slightly different heights so it reads as masonry
 * rather than an extruded curve, and kept low enough that it never rises into
 * a standing fighter's silhouette.
 */
export function KombatTerrace({ surfaces }: { readonly surfaces: KombatSurfaces }) {
  const blocks = useMemo(
    () =>
      Array.from({ length: SEGMENTS }, (_, index) => {
        const t = index / (SEGMENTS - 1);
        // Centred on -Z — *behind* the arena.
        //
        // Centring on π instead swept the arc round the left-hand side and
        // parked one block at z ≈ +7, three metres in front of the lens, where
        // it stood as a black shape over the bright rim for the whole match.
        // Nothing is allowed between the camera and the fight; this angle keeps
        // every block at z ≤ -1.4.
        const angle = -Math.PI / 2 + (t - 0.5) * ARC;
        // Alternating heights, chosen rather than random so the silhouette is
        // the same in every capture.
        const height = 1.5 + (index % 3) * 0.42 + (index % 2) * 0.22;
        return {
          angle,
          height,
          x: Math.cos(angle) * 12.4,
          z: Math.sin(angle) * 9.2 - 2,
        };
      }),
    [],
  );

  return (
    <group>
      {blocks.map((block) => (
        <group
          key={block.angle}
          position={[block.x, -1, block.z]}
          rotation-y={-block.angle + Math.PI / 2}
        >
          <mesh castShadow material={surfaces.stone} position={[0, block.height * 0.5, 0]} receiveShadow>
            <boxGeometry args={[3.2, block.height, 2.6]} />
          </mesh>
          <mesh material={surfaces.stoneDark} position={[0, block.height + 0.14, 0.1]}>
            <boxGeometry args={[3.4, 0.28, 2.9]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
