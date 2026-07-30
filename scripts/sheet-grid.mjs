#!/usr/bin/env node
// Calibration helper for the sprite slicer.
//
// Crops one character sheet's front view and overlays a labelled pixel grid, so
// part rectangles can be read off the drawing instead of guessed. Output goes to
// a scratch path, never into the repo.
//
//   node scripts/sheet-grid.mjs idol out/grid-idol.png

import { readFileSync } from 'node:fs';
import sharp from 'sharp';
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

const { width, height } = view.crop;
// Adaptive: a single figure wants magnification and a fine grid; a whole sheet
// wants 1:1 and coarse lines, or the labels bury the drawing.
const SCALE = width > 700 ? 1 : 2;
const STEP = width > 700 ? 50 : 20;

let svg = `<svg width="${width * SCALE}" height="${height * SCALE}" xmlns="http://www.w3.org/2000/svg">`;
for (let x = 0; x <= width; x += STEP) {
  svg += `<line x1="${x * SCALE}" y1="0" x2="${x * SCALE}" y2="${height * SCALE}" stroke="#ff0044" stroke-width="1" opacity="0.55"/>`;
  svg += `<text x="${x * SCALE + 2}" y="13" fill="#ff0044" font-size="12" font-family="monospace">${x}</text>`;
}
for (let y = 0; y <= height; y += STEP) {
  svg += `<line x1="0" y1="${y * SCALE}" x2="${width * SCALE}" y2="${y * SCALE}" stroke="#0066ff" stroke-width="1" opacity="0.55"/>`;
  svg += `<text x="2" y="${y * SCALE - 3}" fill="#0066ff" font-size="12" font-family="monospace">${y}</text>`;
}
svg += '</svg>';

const base = await sharp(readFileSync(view.file))
  .extract(view.crop)
  .resize({ width: width * SCALE, kernel: 'nearest' })
  .png()
  .toBuffer();

await sharp(base)
  .composite([{ input: Buffer.from(svg) }])
  .png()
  .toFile(destination);

console.log(`wrote ${destination} (${width}x${height} at ${SCALE}x)`);
