import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const [id, input] = process.argv.slice(2);

if (!id || !input) {
  throw new Error('Usage: node scripts/build-reference-atlas.mjs <id> <input.png>');
}

const size = 1024;
const outputDirectory = path.resolve('public/sprites/reference-fighters');
await mkdir(outputDirectory, { recursive: true });
const output = path.join(outputDirectory, `${id}-atlas.webp`);
await sharp(path.resolve(input))
  .resize(size, size, { fit: 'fill', kernel: sharp.kernel.nearest })
  .webp({ quality: 82, alphaQuality: 94, smartSubsample: true })
  .toFile(output);

console.log(`${id}: ${output}`);
