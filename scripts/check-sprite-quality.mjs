import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.join('public', 'sprites');
const MINIMUM_TEXTURE_SCALE = 2;
const failures = [];
let checked = 0;

for (const entry of await readdir(ROOT, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const directory = path.join(ROOT, entry.name);
  const files = new Set(await readdir(directory));
  if (files.has('rig.json')) {
    await inspectManifest(directory, 'rig.json', 'parts');
  }
  if (files.has('poses.json')) {
    await inspectManifest(directory, 'poses.json', 'poses');
  }
}

if (failures.length > 0) {
  console.error(`Sprite quality check failed:\n- ${failures.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log(`Sprite quality passed: ${String(checked)} padded 2x textures`);
}

async function inspectManifest(directory, filename, collectionName) {
  const file = path.join(directory, filename);
  const manifest = JSON.parse(await readFile(file, 'utf8'));
  const textureScale = manifest.textureScale ?? 1;
  if (textureScale < MINIMUM_TEXTURE_SCALE) {
    failures.push(`${file}: textureScale ${String(textureScale)} is below 2x`);
  }

  for (const [name, spec] of Object.entries(manifest[collectionName] ?? {})) {
    const image = path.join(directory, `${name}.png`);
    const { data, info } = await sharp(image)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const expectedWidth = spec.width * textureScale;
    const expectedHeight = spec.height * textureScale;
    if (info.width !== expectedWidth || info.height !== expectedHeight) {
      failures.push(
        `${image}: ${String(info.width)}x${String(info.height)}, expected `
        + `${String(expectedWidth)}x${String(expectedHeight)}`,
      );
    }
    if (!hasTransparentBorder(data, info.width, info.height, info.channels)) {
      failures.push(`${image}: opaque pixels touch the texture border`);
    }
    checked += 1;
  }
}

function hasTransparentBorder(data, width, height, channels) {
  const alpha = channels - 1;
  const isClear = (x, y) => data[(y * width + x) * channels + alpha] === 0;
  for (let x = 0; x < width; x += 1) {
    if (!isClear(x, 0) || !isClear(x, height - 1)) return false;
  }
  for (let y = 0; y < height; y += 1) {
    if (!isClear(0, y) || !isClear(width - 1, y)) return false;
  }
  return true;
}
