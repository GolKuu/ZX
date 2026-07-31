import {
  AdditiveBlending,
  DoubleSide,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
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
      color: '#100b24',
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
    darkMetal: new MeshPhysicalMaterial({
      color: '#071522',
      clearcoat: 0.82,
      clearcoatRoughness: 0.18,
      metalness: 0.86,
      roughness: 0.24,
    }),
    violetMetal: new MeshPhysicalMaterial({
      color: '#1b1237',
      clearcoat: 0.72,
      metalness: 0.78,
      roughness: 0.27,
    }),
    ceramic: new MeshPhysicalMaterial({
      color: '#dcecff',
      clearcoat: 0.94,
      clearcoatRoughness: 0.12,
      metalness: 0.34,
      roughness: 0.16,
    }),
    cyanCore: emissive('#31dfff'),
    violetCore: emissive('#9d62ff'),
  };
}

function emissive(color: string): MeshStandardMaterial {
  return new MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 3.2,
    metalness: 0.45,
    roughness: 0.18,
    toneMapped: false,
  });
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
