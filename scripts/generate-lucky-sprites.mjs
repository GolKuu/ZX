/**
 * Render Lucky's sprites as pixel art.
 *
 * Two steps matter and both are about keeping pixels square.
 *
 * 1. The SVG is rasterised at `1 / PIXEL_SIZE` of the manifest size, so the art
 *    lands on a coarse grid — roughly 114 pixel rows for the standing figure,
 *    the density MIM and Glitch are drawn at.
 * 2. That grid is blown back up with `kernel: 'nearest'`. Lanczos, the old
 *    setting, averages neighbouring pixels and turns pixel art back into soft
 *    vector art; nearest keeps every edge hard.
 *
 * Alpha is then thresholded so no half-transparent anti-aliasing fringe
 * survives. A fringe would read as a blurry halo against the stage and would
 * also fail the transparent-border check in `check-sprite-quality.mjs`.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { attackPose, luckyParts, LUCKY_POSE_SIZE } from './lucky-sprite-art.mjs';

/** Manifest units per drawn pixel. */
const PIXEL_SIZE = 2;
/** Output multiplier recorded in the manifests. */
const PROFILE_TEXTURE_SCALE = 2;
const ATTACK_TEXTURE_SCALE = 3;

const profileDirectory = path.resolve('public/sprites/lucky-profile');
const attackDirectory = path.resolve('public/sprites/lucky-attacks');
await Promise.all([
  mkdir(profileDirectory, { recursive: true }),
  mkdir(attackDirectory, { recursive: true }),
]);

for (const [name, part] of Object.entries(luckyParts)) {
  await render(
    path.join(profileDirectory, `${name}.png`),
    part.width,
    part.height,
    part.art,
    PROFILE_TEXTURE_SCALE,
  );
}

const poseNames = ['lp', 'lk', 'hp', 'hk'];
for (const name of poseNames) {
  await render(
    path.join(attackDirectory, `${name}.png`),
    LUCKY_POSE_SIZE.width,
    LUCKY_POSE_SIZE.height,
    attackPose(name),
    ATTACK_TEXTURE_SCALE,
  );
}

await writeFile(
  path.join(attackDirectory, 'poses.json'),
  `${JSON.stringify({
    displayScale: 1.5,
    facesRight: true,
    textureScale: ATTACK_TEXTURE_SCALE,
    poses: Object.fromEntries(poseNames.map((name) => [
      name,
      { ...LUCKY_POSE_SIZE, ground: 0.94 },
    ])),
  }, null, 2)}\n`,
);

console.log(
  `Lucky pixel art: ${String(Object.keys(luckyParts).length)} rig parts and `
  + `${String(poseNames.length)} attack poses`,
);

async function render(target, width, height, body, textureScale) {
  const gridWidth = Math.round(width / PIXEL_SIZE);
  const gridHeight = Math.round(height / PIXEL_SIZE);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"
    width="${gridWidth}" height="${gridHeight}"
    viewBox="0 0 ${width} ${height}"
    shape-rendering="crispEdges">${body}</svg>`;

  const grid = await sharp(Buffer.from(svg))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Hard alpha: a pixel is either part of the sprite or it is not.
  const pixels = grid.data;
  for (let index = 3; index < pixels.length; index += grid.info.channels) {
    pixels[index] = pixels[index] >= 128 ? 255 : 0;
  }

  await sharp(pixels, {
    raw: {
      width: grid.info.width,
      height: grid.info.height,
      channels: grid.info.channels,
    },
  })
    .resize(width * textureScale, height * textureScale, { kernel: 'nearest' })
    .png({ compressionLevel: 9, palette: true })
    .toFile(target);
}
