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
//   2. Extract each part rectangle, trim its transparent margin, and record where
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
import { keyBackground } from './sheet-key.mjs';
import { ATTACK_POSES, FRONT_VIEWS, PART_RECTS } from './sheet-parts.mjs';

/** Fraction of the crop that turning transparent means the fill leaked. */
const LEAK_LIMIT = 0.9;

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

  const clearedFraction = keyBackground(data, width, height, view.key);
  if (clearedFraction > LEAK_LIMIT) {
    throw new Error(
      `Background fill cleared ${(clearedFraction * 100).toFixed(0)}% of the `
      + 'crop — the outline probably has a gap and the fill leaked inside.',
    );
  }
  console.log(`${name}: background keyed (${(clearedFraction * 100).toFixed(0)}% cleared)`);

  const keyed = await sharp(data, { raw: { channels: 4, width, height } })
    .png()
    .toBuffer();

  const directory = join('public', 'sprites', name);
  mkdirSync(directory, { recursive: true });

  const manifest = {
    source: view.file,
    view: view.crop,
    // Which way the sliced drawing faces. Read by the runtime to decide when to
    // mirror; it differs per sheet.
    facesRight: view.facesRight === true,
    parts: {},
  };

  for (const [part, spec] of Object.entries(parts)) {
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
    const extracted = await sharp(keyed)
      .extract({ left: x, top: y, width: boxWidth, height: boxHeight })
      .toBuffer();

    // Trim the transparent margin so the quad is tight, then move the pivot into
    // the trimmed image's own coordinates.
    const trimmed = await sharp(extracted).trim({ threshold: 1 }).toBuffer({
      resolveWithObject: true,
    });
    const offsetX = -(trimmed.info.trimOffsetLeft ?? 0);
    const offsetY = -(trimmed.info.trimOffsetTop ?? 0);

    await sharp(trimmed.data).png().toFile(join(directory, `${part}.png`));

    const pivotX = spec.pivot[0] * boxWidth - offsetX;
    const pivotY = spec.pivot[1] * boxHeight - offsetY;
    manifest.parts[part] = {
      width: trimmed.info.width,
      height: trimmed.info.height,
      pivot: [
        Number((pivotX / trimmed.info.width).toFixed(4)),
        Number((pivotY / trimmed.info.height).toFixed(4)),
      ],
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
  const manifest = { source: spec.file, poses: {} };

  for (const [pose, box] of Object.entries(spec.poses)) {
    const { data } = await sharp(spec.file)
      .extract(box)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    keyBackground(data, box.width, box.height, spec.key);

    const keyed = await sharp(data, {
      raw: { channels: 4, width: box.width, height: box.height },
    }).png().toBuffer();
    const trimmed = await sharp(keyed).trim({ threshold: 1 }).toBuffer({
      resolveWithObject: true,
    });
    await sharp(trimmed.data).png().toFile(join(directory, `${pose}.png`));

    const topInCrop = -(trimmed.info.trimOffsetTop ?? 0);
    const groundInCrop = spec.ground - box.top;
    manifest.poses[pose] = {
      width: trimmed.info.width,
      height: trimmed.info.height,
      // Where the floor sits, as a fraction of the trimmed image's height.
      ground: Number(((groundInCrop - topInCrop) / trimmed.info.height).toFixed(4)),
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
