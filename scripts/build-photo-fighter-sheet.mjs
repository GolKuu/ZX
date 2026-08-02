import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const source = path.resolve('public/sprites/photo-fighters/source.png');
const output = path.resolve('public/sprites/photo-fighters');
const columns = 6;
const rows = 8;
const cellSize = 40;
const renderScale = 4;
const left = 21;
const top = 5;

await mkdir(output, { recursive: true });
const { data, info } = await sharp(source)
  .extract({ left, top, width: columns * cellSize, height: rows * cellSize })
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const mim = Buffer.alloc(info.width * info.height * 4);
const glitch = Buffer.alloc(mim.length);

for (let pixel = 0; pixel < info.width * info.height; pixel += 1) {
  const input = pixel * 3;
  const outputPixel = pixel * 4;
  const red = Math.max(0, data[input] - 8);
  const green = Math.max(0, data[input + 1] - 11);
  const blue = Math.max(0, data[input + 2] - 20);
  const brightness = Math.max(data[input], data[input + 1], data[input + 2]);
  // The source has soft antialiased fringe pixels. They turn into a grey halo
  // when a 40 px fighter is enlarged in WebGL, so author a hard pixel mask.
  const alpha = brightness >= 36 ? 255 : 0;

  mim[outputPixel] = quantize(clamp(red * 1.9));
  mim[outputPixel + 1] = quantize(clamp(green * 1.68));
  mim[outputPixel + 2] = quantize(clamp(blue * 1.5));
  mim[outputPixel + 3] = alpha;

  const light = Math.max(red, green, blue);
  const cyan = Math.max(0, blue - red * 0.35);
  glitch[outputPixel] = quantize(clamp(light * 0.58 + cyan * 0.36));
  glitch[outputPixel + 1] = quantize(clamp(green * 0.84 + light * 0.2));
  glitch[outputPixel + 2] = quantize(clamp(light * 1.78));
  glitch[outputPixel + 3] = alpha;
}

await Promise.all([
  saveAtlas('mim-atlas.png', mim, info.width, info.height),
  saveAtlas('glitch-atlas.png', glitch, info.width, info.height),
  writeFile(path.join(output, 'manifest.json'), `${JSON.stringify({
    columns,
    rows,
    cellSize,
    renderScale,
    frameCount: columns * rows,
    ground: 0.91,
    facesRight: true,
  }, null, 2)}\n`),
]);

console.log(`Built ${String(columns * rows)} photo-animation frames for Mim and Glitch.`);

function saveAtlas(name, pixels, width, height) {
  return sharp(pixels, { raw: { width, height, channels: 4 } })
    .resize(width * renderScale, height * renderScale, { kernel: 'nearest' })
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(output, name));
}

function clamp(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function quantize(value) {
  return clamp(Math.round(value / 24) * 24);
}
