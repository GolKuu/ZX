import {
  DoubleSide,
  MeshBasicMaterial,
  type DataTexture,
  type Material,
} from 'three';
import {
  createToonMaterial,
  type ToonMaterial,
} from '@/src/render/toonMaterial';

export function createMimMaterials(
  gradientMap: DataTexture,
  auraColor: string,
) {
  const hoodie = toon('#6f35cf', '#35156f', gradientMap, auraColor);
  const yellow = toon('#ffd52a', '#ee8f2c', gradientMap, auraColor, 0.9);
  const white = toon('#fbfaff', '#c8b7eb', gradientMap, auraColor, 0.9);
  const purple = toon('#4e209b', '#25104e', gradientMap, auraColor);
  const cursor = toon('#ffffff', '#bcb0dc', gradientMap, '#ffd52a', 1.15);
  cursor.side = DoubleSide;

  return {
    hoodie,
    yellow,
    white,
    purple,
    cursor,
    eye: new MeshBasicMaterial({ color: '#35156f', toneMapped: false }),
    snap: new MeshBasicMaterial({
      color: '#fff8b8',
      depthWrite: false,
      toneMapped: false,
      transparent: true,
      opacity: 0.9,
    }),
  };
}

export type MimMaterials = ReturnType<typeof createMimMaterials>;

export function mimToonMaterials(
  materials: MimMaterials,
): readonly ToonMaterial[] {
  return [
    materials.cursor,
    materials.hoodie,
    materials.purple,
    materials.white,
    materials.yellow,
  ];
}

export function disposeMimMaterials(materials: MimMaterials): void {
  Object.values(materials).forEach((material: Material) => material.dispose());
}

function toon(
  color: string,
  shade: string,
  gradientMap: DataTexture,
  rimColor: string,
  rimStrength = 1,
): ToonMaterial {
  return createToonMaterial({
    color,
    // Fully illustrated: the two bands are the palette's own lit and shade
    // colours, so the hoodie stays MIM's purple and the sneakers stay white
    // whatever the stage lighting is doing. Matches the character sheet, which
    // is flat vector art with no rendered falloff anywhere on it.
    flatten: 1,
    gradientMap,
    rimColor,
    rimStrength,
    shadowStrength: 0.8,
    shadowTint: shade,
  });
}
