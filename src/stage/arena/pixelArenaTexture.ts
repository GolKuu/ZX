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

export function createPixelArenaTexture(): DataTexture {
  const pixels = new Uint8Array(WIDTH * HEIGHT * 4);
  paintSky(pixels);
  paintSun(pixels);
  paintClouds(pixels);
  paintDistantCliffs(pixels);
  paintWaterfalls(pixels);
  paintRuins(pixels);
  paintCanopy(pixels);
  paintAtmosphere(pixels);

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
  const bands: readonly Rgb[] = [
    [55, 174, 215], [69, 192, 220], [92, 207, 216],
    [135, 219, 198], [185, 231, 186], [238, 236, 179],
  ];
  for (let y = 0; y < 104; y += 1) {
    const band = Math.min(bands.length - 1, Math.floor(y / 18));
    fillRect(pixels, 0, y, WIDTH, 1, bands[band] ?? bands[0]!);
  }
}

function paintSun(pixels: Uint8Array): void {
  const centerX = 192;
  const centerY = 24;
  for (let radius = 22; radius > 0; radius -= 1) {
    const warmth = Math.floor((22 - radius) * 1.4);
    fillCircle(pixels, centerX, centerY, radius, [255, 226 + warmth, 140 + warmth]);
  }
  for (let streak = 0; streak < 6; streak += 1) {
    fillRect(pixels, 163 + streak * 6, 47 + streak * 3, 48 - streak * 4, 1, [229, 235, 194]);
  }
}

function paintClouds(pixels: Uint8Array): void {
  const clouds = [[18, 20, 27], [67, 33, 22], [112, 14, 29], [211, 38, 25]] as const;
  clouds.forEach(([x, y, width], index) => {
    const shadow: Rgb = index % 2 === 0 ? [151, 197, 187] : [168, 205, 190];
    fillRect(pixels, x, y + 6, width, 4, shadow);
    fillRect(pixels, x + 4, y + 2, width - 8, 7, [226, 232, 210]);
    fillRect(pixels, x + 10, y, Math.max(5, width - 18), 4, [240, 238, 211]);
  });
}

function paintDistantCliffs(pixels: Uint8Array): void {
  const cliffs = [
    [-20, 112, 20, 49], [12, 112, 55, 58], [43, 112, 86, 44],
    [76, 112, 119, 62], [107, 112, 151, 48], [142, 112, 183, 57],
    [174, 112, 218, 45], [207, 112, 275, 64],
  ] as const;
  cliffs.forEach(([left, base, peakX, peakY], index) => {
    const nextLeft = cliffs[index + 1]?.[0] ?? WIDTH + 18;
    fillTriangle(pixels, left, base, peakX, peakY, nextLeft, base, index % 2 === 0 ? [71, 117, 105] : [82, 130, 111]);
    fillTriangle(pixels, peakX, peakY, peakX + 8, peakY + 8, peakX + 18, base, [113, 151, 124]);
    fillRect(pixels, peakX - 3, peakY + 13, 5, Math.max(4, base - peakY - 23), [63, 108, 96]);
  });
}

function paintWaterfalls(pixels: Uint8Array): void {
  const falls = [[39, 63, 14, 56], [121, 69, 10, 48], [205, 62, 16, 58]] as const;
  falls.forEach(([x, y, width, height], index) => {
    fillRect(pixels, x - 3, y, width + 6, height, [63, 110, 108]);
    fillRect(pixels, x, y, width, height, [116, 207, 205]);
    fillRect(pixels, x + 3, y, 2, height, [218, 244, 224]);
    fillRect(pixels, x + width - 4, y + 4, 2, height - 5, [82, 178, 184]);
    for (let streak = 0; streak < height; streak += 9) {
      fillRect(pixels, x + ((streak + index) % Math.max(1, width - 3)), y + streak, 3, 2, [184, 235, 220]);
    }
    fillRect(pixels, x - 5, y + height - 2, width + 10, 4, [192, 235, 216]);
  });
}

function paintRuins(pixels: Uint8Array): void {
  const stone: Rgb = [174, 173, 137];
  const shade: Rgb = [96, 126, 105];
  const light: Rgb = [218, 208, 157];
  fillRect(pixels, 77, 58, 102, 8, shade);
  fillRect(pixels, 82, 54, 92, 7, stone);
  fillRect(pixels, 94, 43, 68, 12, stone);
  fillRect(pixels, 100, 39, 56, 5, light);
  for (const x of [88, 111, 142, 165]) {
    fillRect(pixels, x, 61, 9, 49, shade);
    fillRect(pixels, x + 2, 59, 7, 49, stone);
    fillRect(pixels, x - 2, 58, 13, 4, light);
  }
  fillRect(pixels, 76, 105, 104, 7, [102, 126, 103]);
  fillRect(pixels, 70, 111, 116, 5, [157, 158, 123]);
  for (let x = 72; x < 184; x += 15) {
    fillRect(pixels, x, 112, 11, 2, x % 30 === 0 ? [91, 117, 99] : [201, 190, 143]);
  }
  fillRect(pixels, 126, 43, 5, 18, [88, 116, 99]);
  fillRect(pixels, 128, 45, 16, 4, [95, 128, 102]);
}

function paintCanopy(pixels: Uint8Array): void {
  for (let index = 0; index < 34; index += 1) {
    const leftSide = index < 17;
    const x = leftSide ? (index * 13) % 72 : WIDTH - ((index * 17) % 76);
    const y = 52 + ((index * 19) % 65);
    const radius = 3 + (index % 5);
    fillCircle(pixels, x, y, radius + 2, [27, 94, 69]);
    fillCircle(pixels, x + (leftSide ? 2 : -2), y - 2, radius, index % 3 === 0 ? [103, 158, 68] : [60, 139, 72]);
    if (index % 4 === 0) fillRect(pixels, x - 1, y, 2, 16, [75, 88, 65]);
  }
  fillRect(pixels, 0, 119, WIDTH, 8, [45, 93, 73]);
  for (let x = 0; x < WIDTH; x += 9) {
    fillRect(pixels, x, 116 - (x % 4), 7, 7 + (x % 5), x % 3 === 0 ? [70, 125, 75] : [48, 105, 72]);
  }
}

function paintAtmosphere(pixels: Uint8Array): void {
  for (let index = 0; index < 38; index += 1) {
    const x = (index * 47 + 13) % WIDTH;
    const y = 12 + ((index * 31) % 108);
    fillRect(pixels, x, y, index % 7 === 0 ? 2 : 1, 1, index % 4 === 0 ? [255, 231, 155] : [221, 241, 207]);
  }
}

function fillCircle(pixels: Uint8Array, centerX: number, centerY: number, radius: number, color: Rgb): void {
  for (let y = -radius; y <= radius; y += 1) {
    const half = Math.floor(Math.sqrt(radius * radius - y * y));
    fillRect(pixels, centerX - half, centerY + y, half * 2 + 1, 1, color);
  }
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
