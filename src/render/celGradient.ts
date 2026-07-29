import {
  DataTexture,
  NearestFilter,
  RedFormat,
  UnsignedByteType,
} from 'three';

export function createCelGradient() {
  const bands = new Uint8Array([42, 142, 255]);
  const texture = new DataTexture(bands, bands.length, 1, RedFormat, UnsignedByteType);
  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}
