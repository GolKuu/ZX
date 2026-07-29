import {
  DataTexture,
  NearestFilter,
  RedFormat,
  UnsignedByteType,
} from 'three';

/**
 * Three-step cel ramp: shade, mid, light.
 *
 * The dark step is deliberately not near-black. `toonMaterial` multiplies the
 * shaded band by its zone's shadow *hue* on top of this ramp, so a ramp floor
 * down at 42/255 compounded into a silhouette with no readable colour — the
 * characters came out as black cut-outs regardless of what their palette said.
 * Lifting the floor is what makes ART-CCU-400 §A2 true in the frame rather than
 * only in the palette table: shade is a colour, never a darkness.
 */
export function createCelGradient() {
  const bands = new Uint8Array([96, 168, 255]);
  const texture = new DataTexture(bands, bands.length, 1, RedFormat, UnsignedByteType);
  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}
