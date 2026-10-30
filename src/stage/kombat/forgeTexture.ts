import { RepeatWrapping, SRGBColorSpace, TextureLoader, type Texture } from 'three';

// App-lifetime texture cache, bounded to the four authored tiling scales.
// Material owners dispose their materials, never these shared GPU resources.
const surfaces = new Map<number, Texture>();
/** Base colour only. Do not use the imagegen photograph as a normal map. */
export function loadForgeTexture(repeat = 3): Texture {
  const cached = surfaces.get(repeat);
  if (cached) return cached;
  const texture = new TextureLoader().load('/textures/forge-basalt.webp');
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  texture.anisotropy = 4;
  surfaces.set(repeat, texture);
  return texture;
}
