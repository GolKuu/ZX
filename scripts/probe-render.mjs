#!/usr/bin/env node
// One-off diagnostic: walks into a fight, then reports what the renderer and
// scene graph actually believe about shadows, lights and materials.

import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((p) => existsSync(p));

const wait = (ms) => new Promise((done) => setTimeout(done, ms));

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('console', (m) => {
  if (m.type() === 'error') console.log('  console error:', m.text());
});

await page.goto('http://localhost:3000/play', { waitUntil: 'load', timeout: 120_000 });
await page.waitForSelector('canvas', { timeout: 180_000 });
await wait(2_500);
await page.keyboard.press('ArrowDown');
await page.keyboard.press('Enter');
await wait(1_000);
await page.keyboard.press('Enter');
await wait(300);
await page.keyboard.press('Enter');
await wait(1_200);
await page.keyboard.press('Enter');
await wait(3_000);

const report = await page.evaluate(() => {
  // Published by `RenderDebugBridge`, which only mounts outside production.
  const bridge = window.__ccu;
  if (bridge === undefined) return { error: 'window.__ccu missing' };
  const { gl, scene } = bridge;

  const lights = [];
  const casters = [];
  const receivers = [];
  const materials = new Map();

  scene.traverse((object) => {
    if (object.isLight === true) {
      lights.push({
        type: object.type,
        intensity: Number(object.intensity.toFixed(2)),
        castShadow: object.castShadow,
        mapSize: object.shadow?.mapSize?.width ?? null,
      });
    }
    if (object.isMesh === true) {
      const entry = `${object.type}:${object.material?.type ?? '?'}`;
      materials.set(entry, (materials.get(entry) ?? 0) + 1);
      if (object.castShadow === true) casters.push(object.name || object.type);
      if (object.receiveShadow === true) receivers.push(object.name || object.type);
    }
  });

  return {
    shadowMapEnabled: gl.shadowMap.enabled,
    shadowMapType: gl.shadowMap.type,
    toneMapping: gl.toneMapping,
    lights,
    casterCount: casters.length,
    casters: casters.slice(0, 14),
    receiverCount: receivers.length,
    receivers: receivers.slice(0, 14),
    meshes: [...materials.entries()],
  };
});

console.log(JSON.stringify(report, null, 2));
await browser.close();
