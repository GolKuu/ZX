import { MeshBasicMaterial, type Texture } from 'three';
import {
  createToonMaterial,
  type ToonMaterial,
} from '@/src/render/toonMaterial';

export interface ChronoMaterials {
  readonly coat: ToonMaterial;
  readonly suit: ToonMaterial;
  readonly silver: ToonMaterial;
  readonly skin: ToonMaterial;
  readonly hair: ToonMaterial;
  readonly energy: MeshBasicMaterial;
}

export function createChronoMaterials(
  gradient: Texture,
  auraColor: string,
): ChronoMaterials {
  return {
    coat: toon(gradient, '#111725', '#1c3156', auraColor, 1.05),
    suit: toon(gradient, '#172b48', '#102033', auraColor),
    silver: toon(gradient, '#cbd7e6', '#607898', auraColor, 1.18),
    skin: toon(gradient, '#e2b89d', '#9a677f', auraColor, 0.65),
    hair: toon(gradient, '#e7edf5', '#8296b5', auraColor, 1.05),
    energy: new MeshBasicMaterial({
      color: '#42b9ff',
      opacity: 0.88,
      transparent: true,
      toneMapped: false,
    }),
  };
}

export function disposeChronoMaterials(materials: ChronoMaterials): void {
  for (const material of Object.values(materials)) material.dispose();
}

export function chronoToonMaterials(
  materials: ChronoMaterials,
): readonly ToonMaterial[] {
  return [
    materials.coat,
    materials.suit,
    materials.silver,
    materials.skin,
    materials.hair,
  ];
}

function toon(
  gradientMap: Texture,
  color: string,
  shadowTint: string,
  rimColor: string,
  rimStrength = 0.9,
): ToonMaterial {
  return createToonMaterial({
    color,
    gradientMap,
    shadowTint,
    rimColor,
    rimStrength,
  });
}
