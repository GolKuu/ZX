import { readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const directory = path.resolve('public/sprites/reference-fighters');
const files = (await readdir(directory)).filter((file) => file.endsWith('-atlas-hd.avif'));
const expected = new Set(['glitch', 'lucky', 'mim', 'titan', 'vorgh']);
const failures = [];

for (const file of files) {
  const id = file.replace('-atlas-hd.avif', '');
  expected.delete(id);
  const metadata = await sharp(path.join(directory, file)).metadata();
  if (metadata.width !== 4096 || metadata.height !== 4096) {
    failures.push(`${file}: expected 4096x4096, got ${String(metadata.width)}x${String(metadata.height)}`);
  }
}

for (const missing of expected) failures.push(`${missing}-atlas-hd.avif: missing 4K atlas`);

if (failures.length > 0) {
  console.error(`Reference atlas quality failed:\n- ${failures.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log(`Reference atlas quality passed: ${String(files.length)} 4096x4096 AVIF atlases`);
}
