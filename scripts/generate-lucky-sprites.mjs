import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { attackPose, luckyDefs, luckyParts } from './lucky-sprite-art.mjs';

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
    2,
    5,
  );
}

const poseNames = ['lp', 'lk', 'hp', 'hk'];
for (const name of poseNames) {
  await render(
    path.join(attackDirectory, `${name}.png`),
    180,
    320,
    attackPose(name),
    3,
    12,
  );
}

await writeFile(
  path.join(attackDirectory, 'poses.json'),
  `${JSON.stringify({
    displayScale: 1.5,
    facesRight: true,
    textureScale: 3,
    poses: Object.fromEntries(poseNames.map((name) => [
      name,
      { width: 180, height: 320, ground: 0.94 },
    ])),
  }, null, 2)}\n`,
);

async function render(target, width, height, body, scale, padding) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"
    width="${width}" height="${height}"
    viewBox="${-padding} ${-padding} ${width + padding * 2} ${height + padding * 2}">
    ${luckyDefs}
    <g stroke-linecap="round" stroke-linejoin="round">${body}</g>
  </svg>`;
  await sharp(Buffer.from(svg))
    .resize(width * scale, height * scale, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9, quality: 100 })
    .toFile(target);
}
