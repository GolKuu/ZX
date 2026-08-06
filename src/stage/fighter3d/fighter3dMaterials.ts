'use client';

import { useEffect, useMemo } from 'react';
import { BackSide, Color, MeshBasicMaterial, MeshStandardMaterial } from 'three';
import type { CharacterId } from '@/src/data/characterRoster';
import { paletteFor } from '@/src/data/characterPalettes';
import { characterBuild } from './characterBuild';

/**
 * The four surfaces a 3D fighter is painted with.
 *
 * Deliberately few. A character built from twenty materials reads as a kitbash;
 * one built from a body, a trim, a dark under-layer and a glow reads as a
 * designed costume — and it batches, which matters when two of these are on
 * screen with a full post chain behind them.
 *
 * These are physically-shaded rather than toon-shaded. The stage is now a lit
 * room with one hard key and coloured rims, and the whole point of putting the
 * fighters into 3D is that they take that light: a toon ramp would throw it
 * away and paste them flat onto the set again.
 */
export interface FighterSurfaces {
  /** Main costume. */
  readonly body: MeshStandardMaterial;
  /** Armour, boots, mask — the harder, lighter pieces. */
  readonly plate: MeshStandardMaterial;
  /** Deep shadow parts: under-suit, cloth, hollows. */
  readonly under: MeshStandardMaterial;
  /** The character's own colour, emissive. Visors, trim, eyes. */
  readonly glow: MeshBasicMaterial;
  /** Back-faced hull that draws a dark edge around the silhouette. */
  readonly outline: MeshBasicMaterial;
}

export function useFighterSurfaces(characterId: CharacterId): FighterSurfaces {
  const surfaces = useMemo<FighterSurfaces>(() => {
    const palette = paletteFor(characterId);
    const build = characterBuild(characterId);
    return {
      body: new MeshStandardMaterial({
        color: new Color(palette.coat.lit),
        roughness: 0.62,
        metalness: 0.18,
        dithering: true,
      }),
      plate: new MeshStandardMaterial({
        color: new Color(palette.boot.lit),
        roughness: 0.34,
        metalness: 0.55,
        dithering: true,
      }),
      under: new MeshStandardMaterial({
        color: new Color(palette.trousers.shade),
        roughness: 0.85,
        metalness: 0.08,
        dithering: true,
      }),
      glow: new MeshBasicMaterial({
        color: new Color(build.accent),
        toneMapped: false,
      }),
      // Rendered on the back faces of a slightly inflated copy. On a dark stage
      // this is what stops a dark costume dissolving into a dark room — the
      // rim lights carve the lit side, this carves the shadow side.
      outline: new MeshBasicMaterial({
        color: new Color('#05060b'),
        side: BackSide,
      }),
    };
  }, [characterId]);

  useEffect(
    () => () => {
      surfaces.body.dispose();
      surfaces.plate.dispose();
      surfaces.under.dispose();
      surfaces.glow.dispose();
      surfaces.outline.dispose();
    },
    [surfaces],
  );

  return surfaces;
}
