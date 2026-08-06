import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const directory = path.resolve('public/sprites/reference-fighters');
const files = (await readdir(directory)).filter((file) => file.endsWith('-atlas.webp'));
await mkdir(directory, { recursive: true });

for (const file of files) {
  const id = file.replace('-atlas.webp', '');
  const input = path.join(directory, file);
  const output = path.join(directory, `${id}-atlas-hd.avif`);
  await sharp(input)
    .resize(4096, 4096, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: 1.15, m1: 0.72, m2: 0.28 })
    .avif({ quality: 55, effort: 8, chromaSubsampling: '4:4:4' })
    .toFile(output);
  console.log(`Built 4K atlas: ${output}`);
}
