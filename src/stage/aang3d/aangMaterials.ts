import { MeshBasicMaterial, type Texture } from 'three';
import {
  createToonMaterial,
  type ToonMaterial,
} from '@/src/render/toonMaterial';

export interface AangMaterials {
  readonly robe: ToonMaterial;
  readonly pants: ToonMaterial;
  readonly sash: ToonMaterial;
  readonly skin: ToonMaterial;
  readonly boots: ToonMaterial;
  readonly staff: MeshBasicMaterial;
  readonly glow: MeshBasicMaterial;
  readonly effect: MeshBasicMaterial;
}

export function createAangMaterials(
  gradient: Texture,
  auraColor: string,
): AangMaterials {
  return {
    robe: createToonMaterial({
      color: '#c9522b',
      gradientMap: gradient,
      shadowTint: '#682e4a',
      rimColor: auraColor,
    }),
    pants: createToonMaterial({
      color: '#e8a942',
      gradientMap: gradient,
      shadowTint: '#86563e',
      rimColor: auraColor,
    }),
    sash: createToonMaterial({
      color: '#f4cf67',
      gradientMap: gradient,
      shadowTint: '#9a5a43',
      rimColor: auraColor,
    }),
    skin: createToonMaterial({
      color: '#dfb393',
      gradientMap: gradient,
      shadowTint: '#9b6574',
      rimColor: auraColor,
      rimStrength: 0.68,
    }),
    boots: createToonMaterial({
      color: '#4a2529',
      gradientMap: gradient,
      shadowTint: '#261933',
      rimColor: auraColor,
    }),
    staff: new MeshBasicMaterial({ color: '#7d4428' }),
    glow: new MeshBasicMaterial({ color: auraColor, toneMapped: false }),
    effect: new MeshBasicMaterial({
      color: '#8eeaff',
      opacity: 0.82,
      transparent: true,
      toneMapped: false,
    }),
  };
}

export function disposeAangMaterials(materials: AangMaterials): void {
  for (const material of Object.values(materials)) material.dispose();
}

export function toonMaterialsOf(
  materials: AangMaterials,
): readonly ToonMaterial[] {
  return [
    materials.robe,
    materials.pants,
    materials.sash,
    materials.skin,
    materials.boots,
  ];
}
