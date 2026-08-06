'use client';

import { useEffect, useMemo } from 'react';
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  DoubleSide,
  MeshBasicMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
} from 'three';
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

/**
 * Procedural stone grain.
 *
 * Untextured architecture is the giveaway that separates a blockout from a set:
 * flat-shaded boxes have no scale, so a 6 m pillar and a 60 cm crate look
 * identical. A little value noise gives every surface a grain the eye can size
 * itself against.
 */
function createStoneTexture(tint: string): CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  const base = new Color(tint);
  if (context === null) return new CanvasTexture(canvas);

  const image = context.createImageData(size, size);
  for (let index = 0; index < size * size; index += 1) {
    const x = index % size;
    const y = Math.floor(index / size);
    // Coarse blotches plus fine speckle: weathering, then aggregate.
    const blotch = Math.sin(x * 0.09) * Math.cos(y * 0.11) * 0.5 + 0.5;
    const speckle = Math.random();
    const value = 0.72 + blotch * 0.2 + speckle * 0.18;
    // Horizontal courses, so a wall shows masonry rather than a smear.
    const course = y % 32 < 2 ? 0.62 : 1;
    const shade = value * course;
    image.data[index * 4] = Math.min(255, base.r * 255 * shade);
    image.data[index * 4 + 1] = Math.min(255, base.g * 255 * shade);
    image.data[index * 4 + 2] = Math.min(255, base.b * 255 * shade);
    image.data[index * 4 + 3] = 255;
  }
  context.putImageData(image, 0, 0);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(2, 4);
  return texture;
}

export function useKombatSurfaces(theme: KombatTheme): KombatSurfaces {
  const surfaces = useMemo<KombatSurfaces>(() => {
    const grain = createStoneTexture(theme.stone);
    return {
      stone: new MeshStandardMaterial({
        color: new Color(theme.stone),
        map: grain,
        roughness: 0.86,
        metalness: 0.06,
        dithering: true,
      }),
      stoneDark: new MeshStandardMaterial({
        color: new Color(theme.stoneShadow),
        roughness: 0.95,
        metalness: 0.02,
        dithering: true,
      }),
      glow: new MeshBasicMaterial({
        color: new Color(theme.floorEdge),
        blending: AdditiveBlending,
        depthWrite: false,
        opacity: 0.7,
        side: DoubleSide,
        toneMapped: false,
        transparent: true,
      }),
    };
  }, [theme]);

  useEffect(
    () => () => {
      surfaces.stone.map?.dispose();
      surfaces.stone.dispose();
      surfaces.stoneDark.dispose();
      surfaces.glow.dispose();
    },
    [surfaces],
  );

  return surfaces;
}
