import {
  AdditiveBlending,
  DoubleSide,
  MeshBasicMaterial,
  type DataTexture,
  type Material,
} from 'three';
import {
  createToonMaterial,
  type ToonMaterial,
} from '@/src/render/toonMaterial';

export function createGlitchMaterials(gradientMap: DataTexture) {
  return {
    stable: createToonMaterial({
      color: '#06080d',
      gradientMap,
      shadowTint: '#173044',
      rimColor: '#16e6ff',
      rimStrength: 1.15,
      shadowStrength: 0.86,
    }),
    corrupt: createToonMaterial({
      color: '#160916',
      gradientMap,
      shadowTint: '#720f68',
      rimColor: '#ff2bd6',
      rimStrength: 1.2,
      shadowStrength: 0.8,
    }),
    magenta: glow('#ff2bd6', 0.92),
    cyan: glow('#16e6ff', 0.9),
    phantomMagenta: glow('#ff2bd6', 0.3),
    phantomCyan: glow('#16e6ff', 0.28),
  };
}

export type GlitchMaterials = ReturnType<typeof createGlitchMaterials>;

export function toonMaterialsOf(
  materials: GlitchMaterials,
): readonly ToonMaterial[] {
  return [materials.stable, materials.corrupt];
}

export function disposeGlitchMaterials(materials: GlitchMaterials): void {
  Object.values(materials).forEach((material: Material) => material.dispose());
}

function glow(color: string, opacity: number): MeshBasicMaterial {
  return new MeshBasicMaterial({
    blending: AdditiveBlending,
    color,
    depthWrite: false,
    opacity,
    side: DoubleSide,
    toneMapped: false,
    transparent: true,
  });
}
