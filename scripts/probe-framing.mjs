#!/usr/bin/env node
/* global window */
// One-off diagnostic: where is the camera, and where does the arena land on screen?
//
// Separates "the camera is not tracking" from "the fighters are not where the
// simulation says they are". Prints the camera transform plus the screen-space
// projection of a few known world points, so the framing can be read as numbers.
//
//   node scripts/probe-framing.mjs [--url http://localhost:3000]

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
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
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

  const camera = bridge.camera;
  const canvas = bridge.gl.domElement;

  // Project a world point to pixels without needing a Vector3 constructor.
  const project = (x, y, z) => {
    const m = camera.matrixWorldInverse.elements;
    const p = camera.projectionMatrix.elements;
    const vx = m[0] * x + m[4] * y + m[8] * z + m[12];
    const vy = m[1] * x + m[5] * y + m[9] * z + m[13];
    const vz = m[2] * x + m[6] * y + m[10] * z + m[14];
    const cx = p[0] * vx + p[4] * vy + p[8] * vz + p[12];
    const cy = p[1] * vx + p[5] * vy + p[9] * vz + p[13];
    const cw = p[3] * vx + p[7] * vy + p[11] * vz + p[15];
    if (cw === 0) return null;
    return {
      px: Math.round(((cx / cw) * 0.5 + 0.5) * canvas.clientWidth),
      py: Math.round((1 - ((cy / cw) * 0.5 + 0.5)) * canvas.clientHeight),
    };
  };

  // Find the fighter groups: each fighter's root sits directly under the scene
  // and carries children, so identify them by the meshes they contain.
  const tall = [];
  bridge.scene.traverse((object) => {
    if (object.type !== 'Group') return;
    let meshes = 0;
    object.traverse((child) => {
      if (child.isMesh === true || child.isSkinnedMesh === true) meshes += 1;
    });
    if (meshes >= 6 && meshes < 200) {
      tall.push({
        meshes,
        x: Number(object.position.x.toFixed(2)),
        y: Number(object.position.y.toFixed(2)),
        rotY: Number(object.rotation.y.toFixed(2)),
      });
    }
  });

  return {
    viewport: { w: canvas.clientWidth, h: canvas.clientHeight },
    camera: {
      x: Number(camera.position.x.toFixed(2)),
      y: Number(camera.position.y.toFixed(2)),
      z: Number(camera.position.z.toFixed(2)),
      fov: camera.fov,
    },
    screenOfWorld: {
      origin: project(0, 1.3, 0),
      leftSpawn: project(-1.55, 1.3, 0),
      rightSpawn: project(1.55, 1.3, 0),
      leftRim: project(-5.1, 0, 0),
      rightRim: project(5.1, 0, 0),
    },
    candidateGroups: tall.slice(0, 12),
  };
});

console.log(JSON.stringify(report, null, 2));
await browser.close();
