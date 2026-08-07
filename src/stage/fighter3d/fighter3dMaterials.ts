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
  /** Skin, ceramic shells and other non-metal hero surfaces. */
  readonly skin: MeshStandardMaterial;
  /** Polished costume edging and small mechanical hardware. */
  readonly trim: MeshStandardMaterial;
  /** Hair, fur and pale synthetic fibres. */
  readonly hair: MeshStandardMaterial;
  /** Character-specific secondary cloth or armour colour. */
  readonly secondary: MeshStandardMaterial;
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
        color: new Color(bodyColor(characterId, palette.coat.lit)),
        emissive: new Color(build.accent),
        emissiveIntensity: 0.24,
        roughness: 0.62,
        metalness: 0.24,
        dithering: true,
      }),
      plate: new MeshStandardMaterial({
        color: new Color(palette.boot.lit),
        emissive: new Color(build.accent),
        emissiveIntensity: 0.12,
        roughness: 0.34,
        metalness: 0.55,
        dithering: true,
      }),
      under: new MeshStandardMaterial({
        color: new Color(palette.trousers.shade),
        emissive: new Color(build.accent),
        emissiveIntensity: 0.06,
        roughness: 0.85,
        metalness: 0.08,
        dithering: true,
      }),
      skin: new MeshStandardMaterial({
        color: new Color(skinColor(characterId, palette.skin.lit)),
        roughness: characterId === 'mim' ? 0.22 : 0.58,
        metalness: characterId === 'mim' ? 0.2 : 0.02,
        dithering: true,
      }),
      trim: new MeshStandardMaterial({
        color: new Color(trimColor(characterId, palette.body.lit)),
        emissive: new Color(build.accent),
        emissiveIntensity: 0.18,
        roughness: 0.24,
        metalness: 0.78,
        dithering: true,
      }),
      hair: new MeshStandardMaterial({
        color: new Color(characterId === 'glitch' ? '#d9deea' : '#eee8dc'),
        roughness: 0.56,
        metalness: characterId === 'glitch' ? 0.42 : 0.04,
        dithering: true,
      }),
      secondary: new MeshStandardMaterial({
        color: new Color(characterId === 'lucky' ? '#174a34' : build.accent),
        emissive: new Color(build.accent),
        emissiveIntensity: characterId === 'lucky' ? 0.04 : 0.12,
        roughness: 0.62,
        metalness: 0.18,
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
        color: new Color(build.accent).multiplyScalar(0.18),
        side: BackSide,
      }),
    };
  }, [characterId]);

  useEffect(
    () => () => {
      surfaces.body.dispose();
      surfaces.plate.dispose();
      surfaces.under.dispose();
      surfaces.skin.dispose();
      surfaces.trim.dispose();
      surfaces.hair.dispose();
      surfaces.secondary.dispose();
      surfaces.glow.dispose();
      surfaces.outline.dispose();
    },
    [surfaces],
  );

  return surfaces;
}

function bodyColor(characterId: CharacterId, fallback: string): string {
  if (characterId === 'mim') return '#e8e8e5';
  if (characterId === 'lucky') return '#11130f';
  return fallback;
}

function skinColor(characterId: CharacterId, fallback: string): string {
  if (characterId === 'mim') return '#f2f1ec';
  if (characterId === 'glitch') return '#0c1118';
  if (characterId === 'vorgh') return '#381518';
  if (characterId === 'titan') return '#353d42';
  return fallback;
}

function trimColor(characterId: CharacterId, fallback: string): string {
  if (characterId === 'mim') return '#6230a8';
  if (characterId === 'lucky') return '#d2a43a';
  if (characterId === 'vorgh') return '#671c20';
  return fallback;
}
