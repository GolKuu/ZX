import {
  DataTexture,
  NearestFilter,
  RGBAFormat,
  SRGBColorSpace,
  UnsignedByteType,
} from 'three';

const WIDTH = 256;
const HEIGHT = 144;
type Rgb = readonly [number, number, number];

const SKY: readonly Rgb[] = [
  [6, 6, 28], [12, 8, 40], [24, 10, 57], [52, 14, 76], [111, 25, 92],
];
const DEEP_SKY: Rgb = [6, 6, 28];
const SUN_GAP: Rgb = [24, 10, 57];

export function createPixelArenaTexture(): DataTexture {
  const pixels = new Uint8Array(WIDTH * HEIGHT * 4);
  paintSky(pixels);
  paintStars(pixels);
  paintSun(pixels);
  paintMountains(pixels);
  paintCity(pixels);
  fillRect(pixels, 0, 123, WIDTH, 2, [30, 217, 255]);
  fillRect(pixels, 0, 125, WIDTH, 1, [255, 54, 174]);

  const texture = new DataTexture(
    pixels,
    WIDTH,
    HEIGHT,
    RGBAFormat,
    UnsignedByteType,
  );
  texture.colorSpace = SRGBColorSpace;
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  texture.generateMipmaps = false;
  texture.flipY = true;
  texture.needsUpdate = true;
  return texture;
}

function paintSky(pixels: Uint8Array): void {
  for (let y = 0; y < HEIGHT; y += 1) {
    const band = Math.min(SKY.length - 1, Math.floor(y / 25));
    fillRect(pixels, 0, y, WIDTH, 1, SKY[band] ?? DEEP_SKY);
  }
  for (let y = 18; y < 102; y += 12) {
    fillRect(pixels, 0, y, WIDTH, 1, [20 + y, 12, 70 + Math.floor(y / 2)]);
  }
}

function paintStars(pixels: Uint8Array): void {
  let seed = 4927;
  for (let index = 0; index < 54; index += 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const x = seed % WIDTH;
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const y = 5 + (seed % 66);
    const size = index % 11 === 0 ? 2 : 1;
    fillRect(pixels, x, y, size, size, index % 4 === 0 ? [108, 232, 255] : [255, 222, 177]);
  }
}

function paintSun(pixels: Uint8Array): void {
  const centerX = 193;
  const centerY = 46;
  const radius = 21;
  for (let y = -radius; y <= radius; y += 1) {
    const half = Math.floor(Math.sqrt(radius * radius - y * y));
    const color: Rgb = y < -5 ? [255, 210, 103] : y < 9 ? [255, 126, 80] : [255, 68, 157];
    fillRect(pixels, centerX - half, centerY + y, half * 2 + 1, 1, color);
  }
  for (let y = 48; y < 67; y += 5) {
    fillRect(pixels, centerX - radius, y, radius * 2 + 1, 2, SUN_GAP);
  }
}

function paintMountains(pixels: Uint8Array): void {
  const peaks = [
    [-22, 118, 40, 72], [28, 118, 76, 61], [72, 118, 117, 76],
    [104, 118, 151, 67], [142, 118, 195, 74], [181, 118, 231, 59], [219, 118, 278, 75],
  ] as const;
  peaks.forEach(([left, base, peakX, peakY], index) => {
    fillTriangle(pixels, left, base, peakX, peakY, peaks[index + 1]?.[0] ?? WIDTH + 12, base, index % 2 === 0 ? [34, 18, 64] : [47, 22, 75]);
    fillTriangle(pixels, peakX, peakY, peakX + 7, peakY + 10, peakX + 15, base, [73, 29, 91]);
  });
}

function paintCity(pixels: Uint8Array): void {
  const buildings = [18, 31, 23, 40, 28, 47, 25, 36, 30, 45, 27, 38, 22, 43, 29, 34];
  const width = 16;
  buildings.forEach((height, index) => {
    const x = index * width;
    const top = 123 - height;
    fillRect(pixels, x, top, width - 2, height, index % 3 === 0 ? [8, 8, 31] : [11, 9, 38]);
    fillRect(pixels, x + 3, top - (index % 3) * 3, width - 8, (index % 3) * 3, [8, 8, 31]);
    for (let windowY = top + 6; windowY < 119; windowY += 8) {
      const lit = (windowY + index) % 3 !== 0;
      fillRect(pixels, x + 3, windowY, 2, 3, lit ? [42, 214, 255] : [28, 29, 68]);
      fillRect(pixels, x + 9, windowY, 2, 3, lit ? [255, 62, 177] : [28, 29, 68]);
    }
  });
}

function fillTriangle(
  pixels: Uint8Array, ax: number, ay: number, bx: number, by: number,
  cx: number, cy: number, color: Rgb,
): void {
  const minY = Math.max(0, Math.min(ay, by, cy));
  const maxY = Math.min(HEIGHT - 1, Math.max(ay, by, cy));
  for (let y = minY; y <= maxY; y += 1) {
    const left = ax + ((bx - ax) * (y - ay)) / Math.max(1, by - ay);
    const right = bx + ((cx - bx) * (y - by)) / Math.max(1, cy - by);
    fillRect(pixels, Math.min(left, right), y, Math.abs(right - left) + 1, 1, color);
  }
}

function fillRect(pixels: Uint8Array, x: number, y: number, width: number, height: number, color: Rgb): void {
  const startX = Math.max(0, Math.floor(x));
  const endX = Math.min(WIDTH, Math.ceil(x + width));
  const startY = Math.max(0, Math.floor(y));
  const endY = Math.min(HEIGHT, Math.ceil(y + height));
  for (let py = startY; py < endY; py += 1) {
    for (let px = startX; px < endX; px += 1) {
      const offset = (py * WIDTH + px) * 4;
      pixels[offset] = color[0];
      pixels[offset + 1] = color[1];
      pixels[offset + 2] = color[2];
      pixels[offset + 3] = 255;
    }
  }
}
