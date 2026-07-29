#!/usr/bin/env node
// One-off diagnostic: which way is each fighter actually pointing?
//
// Derives facing from the skeleton itself rather than from any bone's local
// axes, which are arbitrary per rig: `up` runs hips → head, `right` runs left
// arm → right arm, and `forward = up × right`. A positive Z means the fighter
// is facing the camera, which is where it belongs.
//
//   node scripts/probe-facing.mjs [--url http://localhost:3000]

import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((path) => existsSync(path));

const urlFlag = process.argv.indexOf('--url');
const URL = urlFlag === -1 ? 'http://localhost:3000' : process.argv[urlFlag + 1];

const wait = (ms) => new Promise((done) => setTimeout(done, ms));

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', (error) => console.log('  page error:', String(error)));

await page.goto(`${URL}/play`, { waitUntil: 'load', timeout: 120_000 });
await page.waitForSelector('canvas', { timeout: 180_000 });
await wait(2_500);
await page.keyboard.press('ArrowDown');
await page.keyboard.press('Enter');
await wait(1_200);
await page.keyboard.press('Enter');
await wait(400);
await page.keyboard.press('Enter');
await wait(1_200);
await page.keyboard.press('Enter');
await wait(3_000);

const report = await page.evaluate(() => {
  const bridge = window.__ccu;
  if (bridge === undefined) return { error: 'no debug bridge' };

  const position = (bone) => {
    const e = bone.matrixWorld.elements;
    return [e[12], e[13], e[14]];
  };
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
  const unit = (v) => {
    const length = Math.hypot(v[0], v[1], v[2]) || 1;
    return v.map((component) => Number((component / length).toFixed(3)));
  };

  const fighters = [];
  bridge.scene.traverse((object) => {
    if (object.isSkinnedMesh !== true) return;
    if (object.name.endsWith('__outline')) return;

    const pick = (pattern) =>
      object.skeleton.bones.find((bone) => pattern.test(bone.name));
    const hips = pick(/hips|pelvis/i);
    const head = pick(/head$/i) ?? pick(/neck/i);
    const armL = pick(/leftarm$|upperarml/i);
    const armR = pick(/rightarm$|upperarmr/i);
    if (!hips || !head || !armL || !armR) return;
    if (fighters.some((entry) => entry.skeleton === object.skeleton.uuid)) return;

    const up = sub(position(head), position(hips));
    const right = sub(position(armR), position(armL));
    fighters.push({
      skeleton: object.skeleton.uuid,
      mesh: object.name,
      worldX: Number(position(hips)[0].toFixed(2)),
      forward: unit(cross(up, right)),
    });
  });

  return {
    fighters: fighters.map(({ mesh, worldX, forward }) => ({
      mesh,
      worldX,
      forward,
      facingCamera: forward[2] > 0,
    })),
  };
});

console.log(JSON.stringify(report, null, 2));
await browser.close();
