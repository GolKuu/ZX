#!/usr/bin/env node
// Calibration helper for the sprite slicer.
//
// Crops one character sheet's front view and overlays a labelled pixel grid, so
// part rectangles can be read off the drawing instead of guessed. Output goes to
// a scratch path, never into the repo.
//
//   node scripts/sheet-grid.mjs fighter out/grid-fighter.png
//   node scripts/sheet-grid.mjs fighter-profile out/arm.png --keyed --zoom 85,95,80,200

import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import { keyBackground } from './sheet-key.mjs';
import { FRONT_VIEWS } from './sheet-parts.mjs';

const [name, destination] = process.argv.slice(2);
const view = FRONT_VIEWS[name];
if (view === undefined) {
  console.error(`Unknown character "${name}". Known: ${Object.keys(FRONT_VIEWS).join(', ')}`);
  process.exit(1);
}
if (destination === undefined) {
  console.error('Usage: node scripts/sheet-grid.mjs <character> <output.png>');
  process.exit(1);
}

// `--zoom x,y,w,h` grids one window of the crop instead of the whole thing, at a
// magnification and grid pitch fine enough to read a joint to the pixel. Labels
// stay in *crop* coordinates, which is the space part rectangles are authored in,
// so numbers can be copied straight into `PART_RECTS`.
const zoomFlag = process.argv.indexOf('--zoom');
const zoom = zoomFlag === -1
  ? null
  : process.argv[zoomFlag + 1].split(',').map(Number);

const { width, height } = view.crop;
const window = zoom === null
  ? { left: 0, top: 0, width, height }
  : { left: zoom[0], top: zoom[1], width: zoom[2], height: zoom[3] };
// Adaptive: a single figure wants magnification and a fine grid; a whole sheet
// wants 1:1 and coarse lines, or the labels bury the drawing.
const SCALE = zoom !== null ? 5 : width > 700 ? 1 : 2;
const STEP = zoom !== null ? 10 : width > 700 ? 50 : 20;

const canvasWidth = window.width * SCALE;
const canvasHeight = window.height * SCALE;
let svg = `<svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">`;
for (let x = window.left - (window.left % STEP); x <= window.left + window.width; x += STEP) {
  const px = (x - window.left) * SCALE;
  if (px < 0) continue;
  svg += `<line x1="${px}" y1="0" x2="${px}" y2="${canvasHeight}" stroke="#ff0044" stroke-width="1" opacity="0.55"/>`;
  svg += `<text x="${px + 2}" y="13" fill="#ff0044" font-size="12" font-family="monospace">${x}</text>`;
}
for (let y = window.top - (window.top % STEP); y <= window.top + window.height; y += STEP) {
  const py = (y - window.top) * SCALE;
  if (py < 0) continue;
  svg += `<line x1="0" y1="${py}" x2="${canvasWidth}" y2="${py}" stroke="#0066ff" stroke-width="1" opacity="0.55"/>`;
  svg += `<text x="2" y="${py - 3}" fill="#0066ff" font-size="12" font-family="monospace">${y}</text>`;
}
svg += '</svg>';

// `--keyed` grids the background-removed cutout, which is the only space part
// rectangles can be read reliably in: against the paper, a limb's edge is
// invisible and every rectangle ends up guessed.
const cropped = sharp(readFileSync(view.file)).extract(view.crop);
let figure;
if (process.argv.includes('--keyed')) {
  const { data } = await cropped
    .clone()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const cleared = keyBackground(data, width, height, view.key);
  console.log(`keyed: ${(cleared * 100).toFixed(0)}% cleared`);
  const cutout = await sharp(data, { raw: { channels: 4, width, height } })
    .png()
    .toBuffer();
  // Composite onto a colour nothing in these palettes uses, so the silhouette
  // edge is unambiguous.
  figure = await sharp({
    create: {
      width, height, channels: 4, background: { r: 0, g: 170, b: 120, alpha: 1 },
    },
  }).composite([{ input: cutout }]).png().toBuffer();
} else {
  figure = await cropped.png().toBuffer();
}

const base = await sharp(figure)
  .extract(window)
  .resize({ width: canvasWidth, kernel: 'nearest' })
  .png()
  .toBuffer();

await sharp(base)
  .composite([{ input: Buffer.from(svg) }])
  .png()
  .toFile(destination);

console.log(`wrote ${destination} (${width}x${height} at ${SCALE}x)`);

