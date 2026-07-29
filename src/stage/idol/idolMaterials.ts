import { MeshBasicMaterial, type Texture } from 'three';
import {
  createToonMaterial,
  type ToonMaterial,
} from '@/src/render/toonMaterial';

export interface IdolMaterials {
  readonly pink: ToonMaterial;
  readonly white: ToonMaterial;
  readonly gold: ToonMaterial;
  readonly skin: ToonMaterial;
  readonly boots: ToonMaterial;
  readonly glow: MeshBasicMaterial;
}

export function createIdolMaterials(
  gradient: Texture,
  auraColor: string,
): IdolMaterials {
  return {
    pink: createToonMaterial({
      color: '#f04f91',
      gradientMap: gradient,
      shadowTint: '#9d3e8d',
      rimColor: auraColor,
    }),
    white: createToonMaterial({
      color: '#fff8f1',
      gradientMap: gradient,
      shadowTint: '#c48ab1',
      rimColor: auraColor,
    }),
    gold: createToonMaterial({
      color: '#f5bd45',
      gradientMap: gradient,
      shadowTint: '#a95b52',
      rimColor: '#fff3ad',
      rimStrength: 0.9,
    }),
    skin: createToonMaterial({
      color: '#efc3aa',
      gradientMap: gradient,
      shadowTint: '#a76686',
      rimColor: auraColor,
      rimStrength: 0.66,
    }),
    boots: createToonMaterial({
      color: '#f9edf3',
      gradientMap: gradient,
      shadowTint: '#9a5985',
      rimColor: auraColor,
    }),
    glow: new MeshBasicMaterial({
      color: '#ffd768',
      opacity: 0.82,
      transparent: true,
      toneMapped: false,
    }),
  };
}

export function disposeIdolMaterials(materials: IdolMaterials): void {
  for (const material of Object.values(materials)) material.dispose();
}

export function idolToonMaterials(
  materials: IdolMaterials,
): readonly ToonMaterial[] {
  return [
    materials.pink,
    materials.white,
    materials.gold,
    materials.skin,
    materials.boots,
  ];
}
