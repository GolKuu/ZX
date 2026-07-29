import {
  Color,
  MeshBasicMaterial,
  MeshToonMaterial,
  type DataTexture,
  type Material,
} from 'three';

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
    blade: toon('#d9f5ee', gradientMap, '#69d8b0'),
    gold: toon('#c7a85b', gradientMap, '#6d5722'),
    hair: toon('#54d98b', gradientMap, '#12683e'),
    handle: toon('#241d2c', gradientMap, '#09060d'),
    phantom: new MeshBasicMaterial({
      color: auraColor,
      opacity: 0.36,
      toneMapped: false,
      transparent: true,
    }),
    robe: toon('#1f5d43', gradientMap, '#0b2b1d'),
    sash: toon('#8f2850', gradientMap, '#3e0c23'),
    skin: toon('#d79c71', gradientMap, '#75452f'),
    trousers: toon('#18231d', gradientMap, '#070a08'),
  };
}

export type ZoroMaterials = ReturnType<typeof createZoroMaterials>;

export function disposeZoroMaterials(materials: ZoroMaterials): void {
  Object.values(materials).forEach((material: Material) => material.dispose());
}

function toon(
  color: string,
  gradientMap: DataTexture,
  emissive: string,
): MeshToonMaterial {
  return new MeshToonMaterial({
    color,
    emissive: new Color(emissive),
    emissiveIntensity: 0.04,
    gradientMap,
  });
}
