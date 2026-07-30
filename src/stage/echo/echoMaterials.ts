import {
  AdditiveBlending,
  MeshBasicMaterial,
  type DataTexture,
  type Material,
} from 'three';
import {
  createToonMaterial,
  type ToonMaterial,
} from '@/src/render/toonMaterial';

export function createEchoMaterials(
  gradientMap: DataTexture,
  auraColor: string,
) {
  return {
    white: createToonMaterial({
      color: '#f4f9ff',
      gradientMap,
      shadowTint: '#73a9c6',
      shadowStrength: 0.7,
      rimColor: auraColor,
      rimStrength: 1.05,
    }),
    navy: createToonMaterial({
      color: '#0b2848',
      gradientMap,
      shadowTint: '#135a7d',
      shadowStrength: 0.78,
      rimColor: auraColor,
      rimStrength: 0.82,
    }),
    cyan: createToonMaterial({
      color: '#54e7ff',
      gradientMap,
      shadowTint: '#1585a7',
      shadowStrength: 0.62,
      rimColor: auraColor,
      rimStrength: 1.2,
    }),
    visor: new MeshBasicMaterial({ color: '#061725', toneMapped: false }),
    glow: new MeshBasicMaterial({
      blending: AdditiveBlending,
      color: '#4ceaff',
      depthWrite: false,
      opacity: 0.9,
      toneMapped: false,
      transparent: true,
    }),
    electric: superMaterial('#4f8cff', 0.72),
    hologram: superMaterial('#4ceaff', 0.32),
    mirror: superMaterial('#c3f4ff', 0.5),
    alert: superMaterial('#4f8cff', 0.72),
  };
}

/** Flat additive glass for the super props: holograms, mirror, charts. */
function superMaterial(color: string, opacity: number): MeshBasicMaterial {
  return new MeshBasicMaterial({
    blending: AdditiveBlending,
    color,
    depthWrite: false,
    opacity,
    toneMapped: false,
    transparent: true,
  });
}

export type EchoMaterials = ReturnType<typeof createEchoMaterials>;

export function echoToonMaterials(
  materials: EchoMaterials,
): readonly ToonMaterial[] {
  return [materials.white, materials.navy, materials.cyan];
}

export function disposeEchoMaterials(materials: EchoMaterials): void {
  Object.values(materials).forEach((material: Material) => material.dispose());
}
