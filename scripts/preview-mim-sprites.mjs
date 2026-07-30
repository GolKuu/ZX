#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

const PROFILE = 'public/sprites/mim-profile';
const ATTACKS = 'public/sprites/mim-attacks';
const OUTPUT = 'tmp/imagegen/mim-animation-preview.png';
const CELL = { width: 390, height: 440 };
const ORIGIN = [205, 411];
const AMOUNTS = [0.25, 0.5, 0.75, 1, 'strike', 0.75, 0.5, 0.25, 0];

const TARGETS = {
  lp: { torso: -0.08, head: 0.04, scarf: 0.18, leftArm: -0.12, rightArm: 0.78, leftLeg: 0.08, rightLeg: -0.08 },
  hp: { torso: -0.16, head: 0.08, scarf: 0.32, leftArm: -0.2, rightArm: 1.08, leftLeg: 0.12, rightLeg: -0.12 },
  lk: { torso: 0.2, head: -0.12, scarf: 0.38, leftArm: 0.18, rightArm: -0.18, leftLeg: -0.16, rightLeg: 0.98 },
  hk: { torso: -0.34, head: 0.14, scarf: 0.62, leftArm: -0.36, rightArm: 0.28, leftLeg: -0.12, rightLeg: 1.5 },
};

const rig = JSON.parse(await readFile(`${PROFILE}/rig.json`, 'utf8'));
const poses = JSON.parse(await readFile(`${ATTACKS}/poses.json`, 'utf8')).poses;
const profileImages = Object.fromEntries(await Promise.all(
  Object.keys(rig.parts).map(async (name) => [
    name,
    (await readFile(`${PROFILE}/${name}.png`)).toString('base64'),
  ]),
));
const attackImages = Object.fromEntries(await Promise.all(
  Object.keys(poses).map(async (name) => [
    name,
    (await readFile(`${ATTACKS}/${name}.png`)).toString('base64'),
  ]),
));

function image(name) {
  const part = rig.parts[name];
  const x = part.joint[0] - part.pivot[0] * part.width;
  const y = part.joint[1] - part.pivot[1] * part.height;
  return `<image href="data:image/png;base64,${profileImages[name]}" x="${x}" y="${y}" width="${part.width}" height="${part.height}"/>`;
}

function rotate(name, angle, content = image(name)) {
  const [x, y] = rig.parts[name].joint;
  return `<g transform="rotate(${angle * 180 / Math.PI} ${x} ${y})">${content}</g>`;
}

function rigFrame(target, amount) {
  const angle = (name) => target[name] * amount;
  const torsoChildren = [
    rotate('scarf', angle('scarf')),
    image('torso'),
    rotate('leftArm', angle('leftArm')),
    rotate('rightArm', angle('rightArm')),
    rotate('head', angle('head')),
  ].join('');
  return [
    rotate('leftLeg', angle('leftLeg')),
    rotate('rightLeg', angle('rightLeg')),
    rotate('torso', angle('torso'), torsoChildren),
  ].join('');
}

function strikeFrame(name) {
  const pose = poses[name];
  const x = ORIGIN[0] - pose.originX * pose.width;
  const y = ORIGIN[1] - pose.ground * pose.height;
  return `<image href="data:image/png;base64,${attackImages[name]}" x="${x}" y="${y}" width="${pose.width}" height="${pose.height}"/>`;
}

const rows = Object.keys(TARGETS);
const cells = rows.flatMap((name, row) => AMOUNTS.map((amount, column) => {
  const x = column * CELL.width;
  const y = row * CELL.height;
  const frame = amount === 'strike'
    ? strikeFrame(name)
    : rigFrame(TARGETS[name], amount);
  return `<g transform="translate(${x} ${y})">${frame}</g>`;
})).join('');

const width = CELL.width * AMOUNTS.length;
const height = CELL.height * rows.length;
const svg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`
  + `<rect width="100%" height="100%" fill="#8e8e8e"/>${cells}</svg>`,
);
await sharp(svg).png().toFile(OUTPUT);
console.log(`MIM animation preview written to ${OUTPUT}`);
