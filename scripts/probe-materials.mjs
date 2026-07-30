#!/usr/bin/env node
/* global window */
// One-off diagnostic: what do the character materials actually believe?
//
// Prints, per toon material in the live scene, the colour it was built with and
// the value of every custom uniform. Answers "is `flatten` reaching this
// surface, and is `uShadowTint` the hue I set" without guessing from a
// screenshot — uniform sharing between materials that reuse one compiled
// program is invisible any other way.
//
//   node scripts/probe-materials.mjs [--url http://localhost:3000]

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

  const seen = new Set();
  const rows = [];

  bridge.scene.traverse((object) => {
    const list = Array.isArray(object.material)
      ? object.material
      : object.material === undefined ? [] : [object.material];

    for (const material of list) {
      if (material === null || seen.has(material.uuid)) continue;
      seen.add(material.uuid);
      if (material.toon === undefined) continue;

      const toon = material.toon;
      rows.push({
        mesh: object.name || '(unnamed)',
        type: material.type,
        colour: `#${material.color.getHexString()}`,
        flatten: toon.uFlatten?.value,
        shadowTint: `#${toon.uShadowTint.value.getHexString()}`,
        shadowStrength: Number(toon.uShadowStrength.value.toFixed(2)),
        rim: Number(toon.uRimStrength.value.toFixed(2)),
        zoneRange: toon.uZoneRange.value.map((n) => Number(n.toFixed(2))),
        zoneLit0: `#${toon.uZoneLit.value[0].getHexString()}`,
      });
    }
  });

  // Also sample the frame itself: average luminance of the left third, where the
  // fighters stand, versus the right third, which is bare floor.
  const canvas = bridge.gl.domElement;
  return { materials: rows, canvas: { w: canvas.width, h: canvas.height } };
});

console.log(JSON.stringify(report, null, 2));
await browser.close();
