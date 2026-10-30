'use client';

import { useEffect, useMemo } from 'react';
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  MeshBasicMaterial,
  MeshStandardMaterial,
} from 'three';
import { loadForgeTexture } from './forgeTexture';
import type { KombatTheme } from './kombatTheme';

/**
 * Shared surfaces for the stage, built once per theme.
 *
 * Every piece of architecture on the stage draws from the same three
 * materials. That is deliberate: a set reads as one place when its stone is one
 * stone, and it lets the whole colonnade batch instead of shipping a material
 * per pillar.
 */
export interface KombatSurfaces {
  readonly stone: MeshStandardMaterial;
  readonly stoneDark: MeshStandardMaterial;
  readonly glow: MeshBasicMaterial;
}

export function useKombatSurfaces(theme: KombatTheme): KombatSurfaces {
  const surfaces = useMemo<KombatSurfaces>(() => {
    const grain = loadForgeTexture(3);
    return {
      stone: new MeshStandardMaterial({
        color: new Color('#c4ccd2'),
        map: grain,
        roughness: 0.58,
        metalness: 0.06,
        dithering: true,
      }),
      stoneDark: new MeshStandardMaterial({
        color: new Color(theme.stoneShadow),
        roughness: 0.72,
        metalness: 0.02,
        dithering: true,
      }),
      glow: new MeshBasicMaterial({
        color: new Color(theme.floorEdge),
        blending: AdditiveBlending,
        depthWrite: false,
        opacity: 0.34,
        side: DoubleSide,
        toneMapped: false,
        transparent: true,
      }),
    };
  }, [theme]);

  useEffect(
    () => () => {
      surfaces.stone.dispose();
      surfaces.stoneDark.dispose();
      surfaces.glow.dispose();
    },
    [surfaces],
  );

  return surfaces;
}
