#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import path from 'node:path';
import {
  ATTACK_DIR,
  ATTACKS,
  ORIGIN,
  PARTS,
  PROFILE_DIR,
  SOURCE,
  VIEW,
} from './mim-sprite-data.mjs';
import { keepLargestOpaqueComponent } from './mim-alpha.mjs';

const TEXTURE_SCALE = 2;
const CUTOUT_PADDING = 2;

async function exportCutout(trimmed) {
  const width = trimmed.info.width + CUTOUT_PADDING * 2;
  const height = trimmed.info.height + CUTOUT_PADDING * 2;
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
  const data = await sharp(padded)
    .resize({
      width: width * TEXTURE_SCALE,
      height: height * TEXTURE_SCALE,
      kernel: sharp.kernel.lanczos3,
    })
    .png({ adaptiveFiltering: true, compressionLevel: 9 })
    .toBuffer();
  return { data, height, width };
}

function maskSvg(width, height, spec) {
  const shape = spec.ellipse === undefined
    ? `<polygon points="${spec.points.map((point) => point.join(',')).join(' ')}" fill="white"/>`
    : `<ellipse cx="${spec.ellipse.cx}" cy="${spec.ellipse.cy}" rx="${spec.ellipse.rx}" ry="${spec.ellipse.ry}" fill="white"/>`;
  const excludes = spec.excludes ?? [];
  if (excludes.length === 0) {
    return Buffer.from(
      `<svg width="${width}" height="${height}">${shape}</svg>`,
    );
  }
  const holes = excludes.map(({ cx, cy, rx, ry }) => (
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="black"/>`
  )).join('');
  return Buffer.from(
    `<svg width="${width}" height="${height}"><mask id="part">`
    + `${shape}${holes}</mask>`
    + `<rect width="${width}" height="${height}" fill="white" mask="url(#part)"/></svg>`,
  );
}

async function trimWithInfo(image) {
  return sharp(image).trim({ threshold: 1 }).png().toBuffer({ resolveWithObject: true });
}

async function sliceProfile() {
  await mkdir(PROFILE_DIR, { recursive: true });
  const source = await sharp(SOURCE).extract(VIEW).png().toBuffer();
  const manifest = {
    source: SOURCE,
    // Sit slightly below the roster average without changing the drawing's
    // proportions. The same pixel scale is shared by the rig and strike poses.
    view: { ...VIEW, figureHeight: 414 },
    textureScale: TEXTURE_SCALE,
    facesRight: true,
    origin: ORIGIN,
    parts: {},
  };

  for (const [name, spec] of Object.entries(PARTS)) {
    const sourceMask = maskSvg(VIEW.width, VIEW.height, spec);
    const clippedSource = await sharp(source)
      .composite([{ input: sourceMask, blend: 'dest-in' }])
      .png()
      .toBuffer();
    let cut = clippedSource;
    if (spec.base === true) {
      const polygon = spec.points.map((point) => point.join(',')).join(' ');
      const strokeWidth = spec.baseStrokeWidth ?? 0;
      const base = Buffer.from(
        `<svg width="${VIEW.width}" height="${VIEW.height}">`
        + `<polygon points="${polygon}" fill="${spec.baseFill ?? '#6739b6'}"`
        + ` stroke="${spec.baseStroke ?? '#6739b6'}"`
        + ` stroke-width="${strokeWidth}"/>`
        + '</svg>',
      );
      cut = await sharp({
        create: {
          width: VIEW.width,
          height: VIEW.height,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      }).composite([{ input: base }, { input: clippedSource }]).png().toBuffer();
    }
    const [left, top, width, height] = spec.box;
    const extracted = await sharp(cut).extract({ left, top, width, height }).png().toBuffer();
    const trimmed = await trimWithInfo(extracted);
    const offsetX = -(trimmed.info.trimOffsetLeft ?? 0);
    const offsetY = -(trimmed.info.trimOffsetTop ?? 0);
    const exported = await exportCutout(trimmed);
    await writeFile(path.join(PROFILE_DIR, `${name}.png`), exported.data);
    manifest.parts[name] = {
      width: exported.width,
      height: exported.height,
      pivot: [
        Number(((
          spec.joint[0] - left - offsetX + CUTOUT_PADDING
        ) / exported.width).toFixed(4)),
        Number(((
          spec.joint[1] - top - offsetY + CUTOUT_PADDING
        ) / exported.height).toFixed(4)),
      ],
      joint: spec.joint,
    };
  }
  await writeFile(path.join(PROFILE_DIR, 'rig.json'), `${JSON.stringify(manifest, null, 2)}\n`);
}

async function sliceAttacks() {
  await mkdir(ATTACK_DIR, { recursive: true });
  const manifest = { source: SOURCE, textureScale: TEXTURE_SCALE, poses: {} };
  for (const [name, box] of Object.entries(ATTACKS)) {
    const { originX, ...crop } = box;
    const extracted = await sharp(SOURCE).extract(crop).png().toBuffer();
    const isolated = await keepLargestOpaqueComponent(extracted);
    const trimmed = await trimWithInfo(isolated);
    const topInCrop = -(trimmed.info.trimOffsetTop ?? 0) - CUTOUT_PADDING;
    const exported = await exportCutout(trimmed);
    await writeFile(path.join(ATTACK_DIR, `${name}.png`), exported.data);
    const originPixels = originX * trimmed.info.width + CUTOUT_PADDING;
    manifest.poses[name] = {
      width: exported.width,
      height: exported.height,
      originX: Number((originPixels / exported.width).toFixed(4)),
      ground: Number(((601 - box.top - topInCrop) / exported.height).toFixed(4)),
    };
  }
  await writeFile(path.join(ATTACK_DIR, 'poses.json'), `${JSON.stringify(manifest, null, 2)}\n`);
}

await Promise.all([sliceProfile(), sliceAttacks()]);
console.log(`MIM sprites written to ${PROFILE_DIR} and ${ATTACK_DIR}`);
