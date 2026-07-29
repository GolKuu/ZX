import { MeshBasicMaterial, type DataTexture, type Material } from 'three';
import {
  createToonMaterial,
  type ToonMaterial,
} from '@/src/render/toonMaterial';

/**
 * Per-zone toon materials.
 *
 * Each surface gets its own shadow hue rather than a shared grey multiply — the
 * shaded side of skin goes plum, cloth goes blue, metal goes cold. That single
 * change is most of the difference between "3D model with a ramp" and "cel"
 * (ART-CCU-400 §A2).
 */
export function createZoroMaterials(
  gradientMap: DataTexture,
  auraColor: string,
) {
  return {
    aura: new MeshBasicMaterial({
      color: auraColor,
      opacity: 0.76,
      toneMapped: false,
      transparent: true,
    }),
    blade: toon('#d9f5ee', gradientMap, '#4a7f9e', auraColor, 1.05),
    gold: toon('#c7a85b', gradientMap, '#6b4a17', auraColor, 0.95),
    hair: toon('#54d98b', gradientMap, '#1d6b57', auraColor),
    handle: toon('#241d2c', gradientMap, '#2a1f4a', auraColor, 0.7),
    phantom: new MeshBasicMaterial({
      color: auraColor,
      opacity: 0.36,
      toneMapped: false,
      transparent: true,
    }),
    robe: toon('#1f5d43', gradientMap, '#17497a', auraColor),
    sash: toon('#8f2850', gradientMap, '#5a1d63', auraColor),
    skin: toon('#d79c71', gradientMap, '#9c5a70', auraColor, 0.7, 0.62),
    trousers: toon('#18231d', gradientMap, '#1b3352', auraColor, 0.8),
  };
}

export type ZoroMaterials = ReturnType<typeof createZoroMaterials>;

/** Toon materials only — the ones the rim axis and impact flash drive. */
export function toonMaterialsOf(
  materials: ZoroMaterials,
): readonly ToonMaterial[] {
  return [
    materials.blade,
    materials.gold,
    materials.hair,
    materials.handle,
    materials.robe,
    materials.sash,
    materials.skin,
    materials.trousers,
  ];
}

export function disposeZoroMaterials(materials: ZoroMaterials): void {
  Object.values(materials).forEach((material: Material) => material.dispose());
}

function toon(
  color: string,
  gradientMap: DataTexture,
  shadowTint: string,
  rimColor: string,
  rimStrength = 0.85,
  shadowStrength = 0.85,
): ToonMaterial {
  return createToonMaterial({
    color,
    gradientMap,
    shadowTint,
    shadowStrength,
    rimColor,
    rimStrength,
  });
}
