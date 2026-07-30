#!/usr/bin/env node
// Prints a keyed crop as a coarse ASCII colour map.
//
// Reading part rectangles off a magnified PNG is guesswork once two pieces of
// costume share a hue. This classifies every pixel by hue/value instead, so the
// boundary between skin, white and pink is a character change you can count.
//
//   node scripts/sheet-map.mjs fighter-profile 20 95 90 200
//
// Legend: . transparent  P pink  R deep pink/magenta  W white  S skin  Y gold
//         K ink/dark     ? anything else

import sharp from 'sharp';
import { keyBackground } from './sheet-key.mjs';
import { FRONT_VIEWS } from './sheet-parts.mjs';

const [name, x0, y0, w, h] = process.argv.slice(2);
const view = FRONT_VIEWS[name];
if (view === undefined) {
  console.error(`Unknown view "${name}"`);
  process.exit(1);
}
const { width, height } = view.crop;
const { data } = await sharp(view.file).extract(view.crop).ensureAlpha().raw()
  .toBuffer({ resolveWithObject: true });
keyBackground(data, width, height, view.key);

const X = Number(x0 ?? 0);
const Y = Number(y0 ?? 0);
const W = Number(w ?? width);
const H = Number(h ?? height);

function classify(r, g, b, a) {
  if (a < 128) return '.';
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max < 90) return 'K';
  if (max - min < 26) return max > 200 ? 'W' : 'K';
  if (r > g && g >= b) {
    // Warm: gold trim is yellow-dominant, skin is pale orange.
    if (b < 120 && g > 150) return 'Y';
    if (g > 170 && b > 140) return 'S';
    return b > g + 10 ? 'P' : 'S';
  }
  if (r >= b && b > g) {
    return r > 215 && b > 170 ? 'P' : 'R';
  }
  return '?';
}

process.stdout.write('    ');
for (let x = X; x < X + W; x += 1) process.stdout.write(x % 10 === 0 ? '|' : ' ');
process.stdout.write('\n');
for (let y = Y; y < Y + H; y += 1) {
  let row = '';
  for (let x = X; x < X + W; x += 1) {
    const i = (y * width + x) * 4;
    row += classify(data[i], data[i + 1], data[i + 2], data[i + 3]);
  }
  console.log(String(y).padStart(3, ' ') + ' ' + row);
}

