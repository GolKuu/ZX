#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SOURCE = 'output/imagegen/mim-fighter-reference.png';
const PROFILE_DIR = 'public/sprites/mim-profile';
const ATTACK_DIR = 'public/sprites/mim-attacks';
const VIEW = { left: 20, top: 190, width: 380, height: 430 };
const ORIGIN = [205, 411];

const PARTS = {
  scarf: {
    box: [14, 108, 165, 96],
    joint: [166, 123],
    points: [[166, 112], [142, 113], [111, 124], [72, 139], [36, 153],
      [17, 177], [42, 171], [20, 198], [58, 192], [96, 180],
      [132, 160], [159, 139], [177, 126]],
  },
  head: {
    box: [164, 22, 108, 106],
    joint: [219, 119],
    points: [[190, 27], [228, 25], [257, 43], [269, 70], [264, 98],
      [246, 118], [220, 126], [191, 118], [173, 99], [168, 73], [175, 47]],
  },
  torso: {
    box: [112, 107, 188, 164],
    joint: [210, 255],
    points: [[157, 116], [190, 108], [235, 111], [270, 125], [286, 151],
      [294, 190], [286, 224], [269, 251], [242, 264], [182, 263],
      [145, 249], [123, 222], [117, 181], [126, 146]],
    patches: [
      { cx: 174, cy: 177, rx: 25, ry: 35 },
      { cx: 278, cy: 186, rx: 18, ry: 31 },
    ],
  },
  leftArm: {
    box: [108, 122, 97, 108],
    joint: [151, 139],
    points: [[141, 126], [168, 129], [184, 143], [202, 154], [204, 177],
      [193, 197], [181, 218], [158, 227], [135, 218], [118, 200],
      [112, 176], [118, 149]],
  },
  rightArm: {
    box: [253, 116, 84, 108],
    joint: [274, 139],
    points: [[270, 126], [289, 120], [315, 128], [329, 143], [334, 165],
      [326, 187], [311, 206], [289, 219], [269, 213], [258, 195],
      [258, 167]],
  },
  leftLeg: {
    box: [53, 243, 154, 148],
    joint: [178, 253],
    points: [[158, 249], [188, 246], [204, 265], [196, 292], [183, 321],
      [171, 347], [160, 370], [133, 381], [87, 384], [59, 371],
      [62, 346], [88, 330], [103, 298], [120, 269], [140, 254]],
  },
  rightLeg: {
    box: [203, 243, 140, 151],
    joint: [240, 253],
    points: [[216, 249], [253, 247], [282, 256], [307, 274], [317, 299],
      [307, 326], [291, 347], [323, 355], [340, 378], [328, 391],
      [285, 391], [257, 380], [241, 358], [244, 331], [250, 304], [229, 283]],
  },
};

const ATTACKS = {
  lp: { left: 425, top: 200, width: 405, height: 410 },
  hp: { left: 815, top: 200, width: 380, height: 410 },
  lk: { left: 1185, top: 210, width: 435, height: 405 },
  hk: { left: 1600, top: 180, width: 405, height: 435 },
};

function maskSvg(width, height, points) {
  const polygon = points.map((point) => point.join(',')).join(' ');
  return Buffer.from(
    `<svg width="${width}" height="${height}"><polygon points="${polygon}" fill="white"/></svg>`,
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
    view: { ...VIEW, figureHeight: 381 },
    facesRight: true,
    origin: ORIGIN,
    parts: {},
  };

  for (const [name, spec] of Object.entries(PARTS)) {
    let cut = await sharp(source)
      .composite([{ input: maskSvg(VIEW.width, VIEW.height, spec.points), blend: 'dest-in' }])
      .png()
      .toBuffer();
    if (spec.patches !== undefined) {
      const patches = spec.patches.map(({ cx, cy, rx, ry }) => (
        `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#6739b6"/>`
      )).join('');
      cut = await sharp(cut).composite([{
        input: Buffer.from(`<svg width="${VIEW.width}" height="${VIEW.height}">${patches}</svg>`),
      }]).png().toBuffer();
    }
    const [left, top, width, height] = spec.box;
    const extracted = await sharp(cut).extract({ left, top, width, height }).png().toBuffer();
    const trimmed = await trimWithInfo(extracted);
    const offsetX = -(trimmed.info.trimOffsetLeft ?? 0);
    const offsetY = -(trimmed.info.trimOffsetTop ?? 0);
    await writeFile(path.join(PROFILE_DIR, `${name}.png`), trimmed.data);
    manifest.parts[name] = {
      width: trimmed.info.width,
      height: trimmed.info.height,
      pivot: [
        Number(((spec.joint[0] - left - offsetX) / trimmed.info.width).toFixed(4)),
        Number(((spec.joint[1] - top - offsetY) / trimmed.info.height).toFixed(4)),
      ],
      joint: spec.joint,
    };
  }
  await writeFile(path.join(PROFILE_DIR, 'rig.json'), `${JSON.stringify(manifest, null, 2)}\n`);
}

async function sliceAttacks() {
  await mkdir(ATTACK_DIR, { recursive: true });
  const manifest = { source: SOURCE, poses: {} };
  for (const [name, box] of Object.entries(ATTACKS)) {
    const extracted = await sharp(SOURCE).extract(box).png().toBuffer();
    const trimmed = await trimWithInfo(extracted);
    const topInCrop = -(trimmed.info.trimOffsetTop ?? 0);
    await writeFile(path.join(ATTACK_DIR, `${name}.png`), trimmed.data);
    manifest.poses[name] = {
      width: trimmed.info.width,
      height: trimmed.info.height,
      ground: Number(((601 - box.top - topInCrop) / trimmed.info.height).toFixed(4)),
    };
  }
  await writeFile(path.join(ATTACK_DIR, 'poses.json'), `${JSON.stringify(manifest, null, 2)}\n`);
}

await Promise.all([sliceProfile(), sliceAttacks()]);
console.log(`MIM sprites written to ${PROFILE_DIR} and ${ATTACK_DIR}`);
