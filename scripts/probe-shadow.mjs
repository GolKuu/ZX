#!/usr/bin/env node
// Isolates the shadow pass: shoots the same frame with the composite chain on
// and off, and reports what the shadow camera actually resolved to.

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

await page.screenshot({ path: '.shots/shadow/fx-on.png' });

// The dev overlay's FX toggle unmounts the whole composite chain.
await page.getByRole('button', { name: /^FX/ }).click();
await wait(1_500);
await page.screenshot({ path: '.shots/shadow/fx-off.png' });

const report = await page.evaluate(() => {
  const { scene } = window.__ccu;
  let out = { error: 'no shadow-casting light found' };
  scene.traverse((object) => {
    if (object.isDirectionalLight === true && object.castShadow === true) {
      const shadowCamera = object.shadow.camera;
      out = {
        lightPosition: object.position.toArray(),
        targetPosition: object.target.position.toArray(),
        targetInScene: object.target.parent !== null,
        frustum: {
          left: shadowCamera.left,
          right: shadowCamera.right,
          top: shadowCamera.top,
          bottom: shadowCamera.bottom,
          near: shadowCamera.near,
          far: shadowCamera.far,
        },
        // If the projection matrix was never refreshed after the declarative
        // props landed, this will not agree with `frustum` above.
        projectionFromMatrix: (() => {
          const e = shadowCamera.projectionMatrix.elements;
          return { halfWidth: 1 / e[0], halfHeight: 1 / e[5] };
        })(),
        mapAllocated: object.shadow.map !== null,
        mapSize: object.shadow.mapSize.toArray(),
        autoUpdate: object.shadow.autoUpdate,
      };
    }
  });
  return out;
});

console.log(JSON.stringify(report, null, 2));
await browser.close();
