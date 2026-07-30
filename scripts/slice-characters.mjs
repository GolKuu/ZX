#!/usr/bin/env node
// Cuts a character sheet into a 2D paper-doll rig.
//
// Two steps, and the first is the one that matters:
//
//   1. **Key the background out by flood-filling inward from the border.** Not by
//      luminance threshold — these characters wear white. IDOL's skirt and boots
//      are the same value as the paper they are drawn on, so a global "light
//      pixels are background" rule deletes half the costume. Filling from the
//      edge instead stops at the character's own ink, so enclosed whites survive.
//   2. **Carve the polygon-cut parts out of the drawing and fill the holes.** A
//      limb drawn across the body cannot be separated by a rectangle; without
//      this the sleeve ships inside the torso *and* as the arm, and the two copies
//      rotate apart. See `sheet-mask.mjs`.
//   3. Extract each part rectangle, trim its transparent margin, and record where
//      the joint sits inside the trimmed image.
//
// Output: `public/sprites/<name>/<part>.png` plus a `rig.json` manifest the
// runtime reads for sizes and pivots.
//
//   node scripts/slice-characters.mjs idol-profile
//   node scripts/slice-characters.mjs --all

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { cleanEchoAttack } from './echo-attack-cleaner.mjs';
import { keyBackground } from './sheet-key.mjs';
import {
  clearInside,
  inpaint,
  keepInside,
  rasterisePolygon,
  unionMasks,
} from './sheet-mask.mjs';
import { ATTACK_POSES, FRONT_VIEWS, PART_RECTS } from './sheet-parts.mjs';

/** Fraction of the crop that turning transparent means the fill leaked. */
const LEAK_LIMIT = 0.9;
/** Runtime draws at up to 1.5 DPR, so keep two texture pixels per source pixel. */
const DEFAULT_TEXTURE_SCALE = 2;
/** Prevent linear sampling from clipping ink that reaches a tightly trimmed edge. */
const CUTOUT_PADDING = 2;

async function writeCutoutTexture(trimmed, target, requestedScale) {
  const textureScale = requestedScale ?? DEFAULT_TEXTURE_SCALE;
  const width = trimmed.info.width + CUTOUT_PADDING * 2;
  const height = trimmed.info.height + CUTOUT_PADDING * 2;
  // Sharp executes resize before extend regardless of chain order. Materialise
  // the padded intermediate so the padding is supersampled as part of the art.
  const padded = await sharp(trimmed.data)
    .extend({
      top: CUTOUT_PADDING,
      bottom: CUTOUT_PADDING,
      left: CUTOUT_PADDING,
      right: CUTOUT_PADDING,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
  await sharp(padded)
    .resize({
      width: width * textureScale,
      height: height * textureScale,
      // Supersampling the keyed art with Lanczos gives the renderer sub-pixel
      // alpha coverage instead of magnifying the source crop's stair steps.
      kernel: sharp.kernel.lanczos3,
    })
    .png({ adaptiveFiltering: true, compressionLevel: 9 })
    .toFile(target);
  return { height, textureScale, width };
}

function flatMaskedPart(
  keyed,
  mask,
  width,
  height,
  fill,
  outline,
) {
  const result = Buffer.alloc(keyed.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixel = y * width + x;
      if (mask[pixel] === 0) continue;
      const offset = pixel * 4;
      const edge = (
        x === 0
        || y === 0
        || x === width - 1
        || y === height - 1
        || mask[pixel - 1] === 0
        || mask[pixel + 1] === 0
        || mask[pixel - width] === 0
        || mask[pixel + width] === 0
      );
      const base = edge ? outline : fill;
      result[offset] = base[0];
      result[offset + 1] = base[1];
      result[offset + 2] = base[2];
      result[offset + 3] = 255;

      // Put the sheet's dark/cyan ink back over the clean flat fill. Pale,
      // low-chroma pixels are the paper grid and stay out.
      if (keyed[offset + 3] === 0) continue;
      const red = keyed[offset];
      const green = keyed[offset + 1];
      const blue = keyed[offset + 2];
      const chroma = Math.max(red, green, blue) - Math.min(red, green, blue);
      const lightness = (red + green + blue) / 3;
      if (chroma < 7 && lightness > 210) continue;
      result[offset] = red;
      result[offset + 1] = green;
      result[offset + 2] = blue;
      result[offset + 3] = keyed[offset + 3];
    }
  }
  return result;
}

async function sliceCharacter(name) {
  const view = FRONT_VIEWS[name];
  const parts = PART_RECTS[name];
  if (view === undefined) throw new Error(`No view registered for "${name}"`);
  if (parts === undefined) throw new Error(`No part rectangles for "${name}"`);

  const { width, height } = view.crop;
  const { data } = await sharp(view.file)
    .extract(view.crop)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  // Some sheets use paper-white costume panels. Keep an untouched copy for
  // manually masked parts because background flood-fill cannot distinguish
  // those panels from the page when an outline has a deliberate gap.
  const original = Buffer.from(data);

  const clearedFraction = keyBackground(data, width, height, view.key);
  if (clearedFraction > LEAK_LIMIT) {
    throw new Error(
      `Background fill cleared ${(clearedFraction * 100).toFixed(0)}% of the `
      + 'crop — the outline probably has a gap and the fill leaked inside.',
    );
  }
  console.log(`${name}: background keyed (${(clearedFraction * 100).toFixed(0)}% cleared)`);

  // Rasterise every polygon once: each masked part reads its own, and their union
  // is what gets subtracted from the rest of the drawing.
  const masks = new Map();
  for (const [part, spec] of Object.entries(parts)) {
    if (spec.mask === undefined) continue;
    const mask = rasterisePolygon(spec.mask, width, height);
    for (const hole of spec.holes ?? []) {
      const holeMask = rasterisePolygon(hole, width, height);
      for (let pixel = 0; pixel < mask.length; pixel += 1) {
        if (holeMask[pixel] !== 0) mask[pixel] = 0;
      }
    }
    masks.set(part, mask);
  }
  const carved = Buffer.from(data);
  const carving = Object.entries(parts)
    .filter(([part, spec]) => spec.carve === true && masks.has(part))
    .map(([part]) => masks.get(part));
  if (carving.length > 0) {
    const holes = clearInside(carved, unionMasks(carving, width, height));
    if (view.carveFill === undefined) {
      inpaint(carved, width, height, holes);
    } else {
      const [red, green, blue] = view.carveFill;
      for (let index = 0; index < holes.length; index += 1) {
        if (holes[index] === 0) continue;
        carved[index * 4] = red;
        carved[index * 4 + 1] = green;
        carved[index * 4 + 2] = blue;
        carved[index * 4 + 3] = 255;
      }
    }
    const emptied = holes.reduce((total, flag) => total + flag, 0);
    console.log(`  carved ${String(carving.length)} part(s), refilled ${String(emptied)}px`);
  }

  const keyedCarved = await sharp(carved, { raw: { channels: 4, width, height } })
    .png()
    .toBuffer();

  const directory = join('public', 'sprites', name);
  mkdirSync(directory, { recursive: true });

  const manifest = {
    source: view.file,
    view: view.crop,
    textureScale: view.textureScale ?? DEFAULT_TEXTURE_SCALE,
    // Which way the sliced drawing faces. Read by the runtime to decide when to
    // mirror; it differs per sheet.
    facesRight: view.facesRight === true,
    // Body centre line and floor row, in crop pixels. The runtime hangs the rig
    // off this, so the figure stands on the stage rather than on the crop's edge.
    origin: view.origin ?? [Math.round(width / 2), height],
    parts: {},
  };

  for (const [part, spec] of Object.entries(parts)) {
    // A masked part takes its pixels from the untouched drawing; everything else
    // takes them from the drawing those masks were removed from.
    let source = keyedCarved;
    const mask = masks.get(part);
    if (mask !== undefined) {
      const fill = spec.baseFill ?? view.partFill;
      const outline = spec.outline ?? view.partOutline ?? [12, 25, 46];
      const cut = fill === undefined
        ? Buffer.from(spec.preserveSource === true ? original : data)
        : flatMaskedPart(data, mask, width, height, fill, outline);
      if (fill === undefined) keepInside(cut, mask);
      if (spec.refillCarves === true && carving.length > 0) {
        const holes = clearInside(cut, unionMasks(carving, width, height));
        if (spec.carveFill === undefined) {
          inpaint(cut, width, height, holes);
        } else {
          const [red, green, blue] = spec.carveFill;
          for (let index = 0; index < holes.length; index += 1) {
            if (holes[index] === 0) continue;
            cut[index * 4] = red;
            cut[index * 4 + 1] = green;
            cut[index * 4 + 2] = blue;
            cut[index * 4 + 3] = 255;
          }
        }
      }
      source = await sharp(cut, { raw: { channels: 4, width, height } })
        .png()
        .toBuffer();
    }

    const [rawX, rawY, rawWidth, rawHeight] = spec.box;
    // Clamp rather than throw. A rectangle read a few pixels wide off the grid
    // used to abort the whole run with `extract_area: bad extract area`, which
    // told you nothing about which part was wrong.
    const x = Math.max(0, Math.min(rawX, width - 1));
    const y = Math.max(0, Math.min(rawY, height - 1));
    const boxWidth = Math.min(rawWidth, width - x);
    const boxHeight = Math.min(rawHeight, height - y);
    if (boxWidth !== rawWidth || boxHeight !== rawHeight || x !== rawX || y !== rawY) {
      console.warn(
        `  ! ${part}: box [${String(rawX)},${String(rawY)},${String(rawWidth)},`
        + `${String(rawHeight)}] falls outside the ${String(width)}x`
        + `${String(height)} view; clamped.`,
      );
    }
    const extracted = await sharp(source)
      .extract({ left: x, top: y, width: boxWidth, height: boxHeight })
      .toBuffer();

    // Trim the transparent margin so the quad is tight, then move the joint into
    // the trimmed image's own coordinates.
    const trimmed = await sharp(extracted).trim({ threshold: 1 }).toBuffer({
      resolveWithObject: true,
    });
    const offsetX = -(trimmed.info.trimOffsetLeft ?? 0);
    const offsetY = -(trimmed.info.trimOffsetTop ?? 0);

    const exported = await writeCutoutTexture(
      trimmed,
      join(directory, `${part}.png`),
      view.textureScale,
    );

    // `pivot` is the joint as a fraction of this image, which is what the shader
    // needs to offset the quad. It is free to fall outside 0…1: a shoulder can sit
    // above the sleeve it turns, and clamping it would drag the part off its bone.
    const pivotX = spec.joint[0] - x - offsetX + CUTOUT_PADDING;
    const pivotY = spec.joint[1] - y - offsetY + CUTOUT_PADDING;
    manifest.parts[part] = {
      width: exported.width,
      height: exported.height,
      pivot: [
        Number((pivotX / exported.width).toFixed(4)),
        Number((pivotY / exported.height).toFixed(4)),
      ],
      // Also kept in crop pixels: the runtime positions each part's group from the
      // difference between its joint and its parent's, so the hierarchy's sockets
      // are the same numbers as the parts' pivots and cannot disagree.
      joint: spec.joint,
    };
    console.log(
      `  ${part.padEnd(10)} ${String(trimmed.info.width).padStart(3)}x`
      + `${String(trimmed.info.height).padStart(3)}`,
    );
  }

  writeFileSync(
    join(directory, 'rig.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  console.log(`  → ${directory}/rig.json`);
}

/**
 * Cut the four attack panels for one character.
 *
 * Each pose is keyed, trimmed, and recorded with the offset from the crop's
 * ground line to the trimmed image's bottom — the runtime needs that to stand the
 * sprite on the floor instead of centring it.
 */
async function sliceAttacks(name) {
  const spec = ATTACK_POSES[name];
  if (spec === undefined) throw new Error(`No attack poses for "${name}"`);

  const directory = join('public', 'sprites', `${name}-attacks`);
  mkdirSync(directory, { recursive: true });
  const manifest = {
    source: spec.file,
    displayScale: spec.displayScale ?? 1.18,
    facesRight: spec.facesRight !== false,
    textureScale: spec.textureScale ?? DEFAULT_TEXTURE_SCALE,
    poses: {},
  };

  for (const [pose, box] of Object.entries(spec.poses)) {
    const { data } = await sharp(spec.file)
      .extract(box)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    keyBackground(data, box.width, box.height, spec.key);
    const groundInCrop = spec.ground - box.top;
    let cleaned = spec.cleanup === 'echo'
      ? cleanEchoAttack(data, box.width, box.height, box, groundInCrop)
      : data;
    if (spec.minimumComponentPixels !== undefined) {
      cleaned = removeSmallAlphaComponents(
        cleaned,
        box.width,
        box.height,
        spec.minimumComponentPixels,
      );
    }

    const keyed = await sharp(cleaned, {
      raw: { channels: 4, width: box.width, height: box.height },
    }).png().toBuffer();
    const trimmed = await sharp(keyed).trim({ threshold: 1 }).toBuffer({
      resolveWithObject: true,
    });
    const exported = await writeCutoutTexture(
      trimmed,
      join(directory, `${pose}.png`),
      spec.textureScale,
    );

    const topInCrop = -(trimmed.info.trimOffsetTop ?? 0) - CUTOUT_PADDING;
    manifest.poses[pose] = {
      width: exported.width,
      height: exported.height,
      // Where the floor sits, as a fraction of the trimmed image's height.
      ground: Number(((groundInCrop - topInCrop) / exported.height).toFixed(4)),
    };
    console.log(
      `  ${pose.padEnd(4)} ${String(trimmed.info.width).padStart(3)}x`
      + `${String(trimmed.info.height).padStart(3)}  ground `
      + `${String(manifest.poses[pose].ground)}`,
    );
  }

  writeFileSync(
    join(directory, 'poses.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  console.log(`  → ${directory}/poses.json`);
}

/**
 * Remove isolated paper flecks left inside closed gaps in pale source artwork.
 *
 * Eight-way connectivity keeps antialiased diagonals together. This is opt-in:
 * GLITCH deliberately scatters tiny detached pixels, while ECHO's equivalent
 * flecks are only the technical-paper texture visible through its silhouette.
 */
function removeSmallAlphaComponents(data, width, height, minimumPixels) {
  const seen = new Uint8Array(width * height);
  const output = Buffer.from(data);
  const stack = [];
  const component = [];

  for (let start = 0; start < width * height; start += 1) {
    if (seen[start] !== 0 || output[start * 4 + 3] === 0) continue;
    stack.push(start);
    seen[start] = 1;
    component.length = 0;

    while (stack.length > 0) {
      const pixel = stack.pop();
      component.push(pixel);
      const x = pixel % width;
      const y = Math.floor(pixel / width);
      for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
        for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
          if (offsetX === 0 && offsetY === 0) continue;
          const nextX = x + offsetX;
          const nextY = y + offsetY;
          if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height) {
            continue;
          }
          const next = nextY * width + nextX;
          if (seen[next] !== 0 || output[next * 4 + 3] === 0) continue;
          seen[next] = 1;
          stack.push(next);
        }
      }
    }

    if (component.length >= minimumPixels) continue;
    for (const pixel of component) output[pixel * 4 + 3] = 0;
  }
  return output;
}

if (process.argv.includes('--attacks')) {
  for (const name of Object.keys(ATTACK_POSES)) {
    console.log(`${name} attacks:`);
    await sliceAttacks(name);
  }
  process.exit(0);
}

const targets = process.argv.includes('--all')
  ? Object.keys(PART_RECTS)
  : process.argv.slice(2).filter((arg) => !arg.startsWith('--'));

if (targets.length === 0) {
  console.error('Usage: node scripts/slice-characters.mjs <name>|--all');
  process.exit(1);
}

for (const target of targets) {
  await sliceCharacter(target);
}
