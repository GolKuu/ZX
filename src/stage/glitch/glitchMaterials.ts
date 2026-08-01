import {
  AdditiveBlending,
  DataTexture,
  DoubleSide,
  RedFormat,
  RepeatWrapping,
  UnsignedByteType,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  type Material,
} from 'three';
import {
  createToonMaterial,
  type ToonMaterial,
} from '@/src/render/toonMaterial';

export function createGlitchMaterials(gradientMap: DataTexture) {
  const circuitMap = createCircuitMap();
  return {
    stable: createToonMaterial({
      color: '#080d15',
      detailBands: 5,
      detailContrast: 2.1,
      detailMap: circuitMap,
      gradientMap,
      shadowTint: '#122838',
      rimColor: '#42eeff',
      rimStrength: 0.9,
      shadowStrength: 0.86,
    }),
    corrupt: createToonMaterial({
      color: '#16091c',
      detailBands: 4,
      detailContrast: 2.35,
      detailMap: circuitMap,
      gradientMap,
      shadowTint: '#4d0b4c',
      rimColor: '#ff28c9',
      rimStrength: 1.05,
      shadowStrength: 0.8,
    }),
    amber: glow('#ff18bd', 0.96),
    ice: glow('#35eaff', 0.92),
    phantomAmber: glow('#ff18bd', 0.34),
    phantomIce: glow('#35eaff', 0.3),
    darkMetal: new MeshPhysicalMaterial({
      color: '#12191d',
      clearcoat: 0.82,
      clearcoatRoughness: 0.18,
      metalness: 0.9,
      roughness: 0.3,
    }),
    rustMetal: new MeshPhysicalMaterial({
      color: '#1b091f',
      clearcoat: 0.72,
      metalness: 0.78,
      roughness: 0.27,
    }),
    ceramic: new MeshPhysicalMaterial({
      color: '#111927',
      clearcoat: 0.94,
      clearcoatRoughness: 0.12,
      metalness: 0.82,
      roughness: 0.2,
    }),
    iceCore: emissive('#63f4ff'),
    amberCore: emissive('#ff21c7'),
    circuitMap,
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
  const { circuitMap, ...surfaceMaterials } = materials;
  Object.values(surfaceMaterials).forEach((material: Material) => material.dispose());
  circuitMap.dispose();
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

function createCircuitMap(): DataTexture {
  const size = 64;
  const pixels = new Uint8Array(size * size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const cell = Math.floor(x / 8) + Math.floor(y / 8) * 9;
      const trace = x % 8 === 1 || y % 11 === 2;
      const fault = (x * 3 + y * 5 + cell) % 29 < 2;
      pixels[y * size + x] = fault ? 245 : trace ? 176 : 58 + (cell % 3) * 18;
    }
  }
  const texture = new DataTexture(
    pixels,
    size,
    size,
    RedFormat,
    UnsignedByteType,
  );
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(2.5, 3.5);
  texture.needsUpdate = true;
  return texture;
}
