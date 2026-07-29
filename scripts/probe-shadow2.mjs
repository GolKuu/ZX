#!/usr/bin/env node
// Decisive shadow test: at runtime, bleach the floor, kill its emissive, and
// move the key light straight overhead. If nothing darkens under the fighters
// after that, the casters are not reaching the shadow pass at all.

import { existsSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((p) => existsSync(p));

const wait = (ms) => new Promise((done) => setTimeout(done, ms));
mkdirSync('.shots/shadow', { recursive: true });

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1400, height: 800 } });

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

const info = await page.evaluate(() => {
  const { scene } = window.__ccu;
  const notes = [];
  scene.traverse((object) => {
    if (object.isDirectionalLight === true && object.castShadow === true) {
      object.position.set(0.6, 11, 0.6);
      object.intensity = 6;
      notes.push('key light moved overhead');
    }
    if (object.isDirectionalLight === true && object.castShadow === false) {
      object.intensity = 0;
    }
    if (object.isHemisphereLight === true || object.isAmbientLight === true) {
      object.intensity = 0.05;
    }
    if (object.isPointLight === true) object.intensity = 0;
    if (object.isMesh === true && object.material?.isMeshStandardMaterial === true) {
      object.material.color.set('#ffffff');
      object.material.metalness = 0;
      object.material.roughness = 1;
      notes.push(`bleached ${object.name || 'floor'}`);
    }
  });

  // Where is each fighter actually standing? Read straight out of the world
  // matrix so no Vector3 constructor is needed in page scope.
  const positions = [];
  scene.traverse((object) => {
    if (object.isSkinnedMesh === true) {
      const e = object.matrixWorld.elements;
      positions.push({
        name: object.name,
        x: Number(e[12].toFixed(2)),
        y: Number(e[13].toFixed(2)),
        z: Number(e[14].toFixed(2)),
        castShadow: object.castShadow,
        visible: object.visible,
      });
    }
  });
  return { notes: [...new Set(notes)], positions };
});

console.log(JSON.stringify(info, null, 2));
await wait(1_200);
await page.screenshot({ path: '.shots/shadow/bleached.png' });
await browser.close();
