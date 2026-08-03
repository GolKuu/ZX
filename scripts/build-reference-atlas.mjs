import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const [id, input] = process.argv.slice(2);

if (!id || !input) {
  throw new Error('Usage: node scripts/build-reference-atlas.mjs <id> <input.png>');
}

const size = 1024;
const { data, info } = await sharp(path.resolve(input))
  .resize(size, size, { fit: 'fill', kernel: sharp.kernel.nearest })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

for (let offset = 0; offset < data.length; offset += info.channels) {
  const red = data[offset] ?? 0;
  const green = data[offset + 1] ?? 0;
  const blue = data[offset + 2] ?? 0;
  const distance = Math.hypot(255 - red, green, 255 - blue);
  const matte = Math.max(0, Math.min(1, (distance - 10) / 76));

  if (matte < 1) {
    const safeMatte = Math.max(matte, 0.08);
    data[offset] = clamp((red - 255 * (1 - matte)) / safeMatte);
    data[offset + 1] = clamp(green / safeMatte);
    data[offset + 2] = clamp((blue - 255 * (1 - matte)) / safeMatte);
  }
  data[offset + 3] = Math.round((data[offset + 3] ?? 255) * matte);
}

const outputDirectory = path.resolve('public/sprites/reference-fighters');
await mkdir(outputDirectory, { recursive: true });
const output = path.join(outputDirectory, `${id}-atlas.webp`);
await sharp(data, { raw: info })
  .webp({ quality: 82, alphaQuality: 94, smartSubsample: true })
  .toFile(output);

console.log(`${id}: ${output}`);

function clamp(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}
