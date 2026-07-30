#!/usr/bin/env node
/* global requestAnimationFrame, window */
// Checks that impact spray actually reaches the screen.
//
// A droplet burst is a handful of pixels for under a second, so a screenshot that
// happens to miss it is indistinguishable from a burst that never spawned. This
// walks into a fight, stands still while the AI attacks, and samples the blood
// instance buffer every frame вЂ” reporting how many droplets were ever alive and
// where they were, which a screenshot cannot tell you.
//
//   node scripts/probe-blood.mjs --headless

import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
];

const headless = process.argv.includes('--headless');
const url = 'http://localhost:3000';
const wait = (ms) => new Promise((done) => setTimeout(done, ms));

const executablePath = process.env.CHROME_PATH
  ?? CHROME_CANDIDATES.find((candidate) => existsSync(candidate));
if (executablePath === undefined) throw new Error('No Chrome found.');

const browser = await chromium.launch({
  executablePath,
  headless,
  args: [
    '--autoplay-policy=no-user-gesture-required',
    ...(headless ? ['--enable-unsafe-swiftshader'] : []),
  ],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', (error) => errors.push(String(error)));
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});

await page.goto(`${url}/play`, { waitUntil: 'load', timeout: 120_000 });
await page.waitForSelector('canvas', { timeout: 180_000 });
await wait(2_500);
await page.keyboard.press('ArrowDown');
await wait(200);
await page.keyboard.press('Enter');
await wait(1_200);
// P1 = fighter, the sliced sprite rig.
for (let step = 0; step < 3; step += 1) {
  await page.keyboard.press('ArrowRight');
  await wait(120);
}
await page.keyboard.press('Enter');
await wait(400);
await page.keyboard.press('Enter');
await wait(1_200);
await page.keyboard.press('Enter');
await wait(2_000);

const mounted = await page.evaluate(() => {
  const scene = window.__ccu?.scene;
  if (scene === undefined) return 'no debug bridge';
  let found = null;
  scene.traverse((node) => {
    if (node.name === 'hit-blood') found = node;
  });
  if (found === null) return 'not in scene';
  return `count ${String(found.count)}, geometry ${String(found.geometry?.type)}, material ${String(found.material?.type)}`;
});
console.log(`blood mesh: ${mounted}`);

// Close in, then throw hands so hits definitely land.
await page.keyboard.down('KeyD');
await wait(800);
await page.keyboard.up('KeyD');

const observed = await page.evaluate(async () => {
  const scene = window.__ccu?.scene;
  let mesh = null;
  scene?.traverse((node) => {
    if (node.name === 'hit-blood') mesh = node;
  });
  if (mesh === null) return null;

  let alivePeak = 0;
  let samples = 0;
  const extents = { minX: 1e9, maxX: -1e9, minY: 1e9, maxY: -1e9 };
  const start = performance.now();
  while (performance.now() - start < 4_000) {
    await new Promise((done) => requestAnimationFrame(() => done(undefined)));
    samples += 1;
    let alive = 0;
    const array = mesh.instanceMatrix.array;
    for (let index = 0; index < mesh.count; index += 1) {
      const base = index * 16;
      // Column 0's length is the x scale; zero means the slot is parked.
      const scaleX = Math.abs(array[base]) + Math.abs(array[base + 1]);
      if (scaleX < 1e-6) continue;
      alive += 1;
      const x = array[base + 12];
      const y = array[base + 13];
      extents.minX = Math.min(extents.minX, x);
      extents.maxX = Math.max(extents.maxX, x);
      extents.minY = Math.min(extents.minY, y);
      extents.maxY = Math.max(extents.maxY, y);
    }
    alivePeak = Math.max(alivePeak, alive);
  }
  return { alivePeak, samples, extents };
});

console.log(`observed: ${JSON.stringify(observed)}`);

// Screenshot the moment a burst is actually in the air. Polling from outside the
// page cannot hit a 600ms burst reliably, so wait inside it for a frame with
// droplets alive and only then grab the frame.
const caught = await page.evaluate(async () => {
  const scene = window.__ccu?.scene;
  let mesh = null;
  scene?.traverse((node) => {
    if (node.name === 'hit-blood') mesh = node;
  });
  if (mesh === null) return 0;
  const start = performance.now();
  while (performance.now() - start < 12_000) {
    await new Promise((done) => requestAnimationFrame(() => done(undefined)));
    let alive = 0;
    const array = mesh.instanceMatrix.array;
    for (let index = 0; index < mesh.count; index += 1) {
      const base = index * 16;
      if (Math.abs(array[base]) + Math.abs(array[base + 1]) > 1e-6) alive += 1;
    }
    if (alive >= 8) return alive;
  }
  return 0;
});
if (caught > 0) {
  await page.screenshot({ path: '.shots/blood.png' });
  console.log(`caught ${String(caught)} droplets in flight в†’ .shots/blood.png`);
} else {
  console.log('no burst caught while watching');
}
if (errors.length > 0) {
  console.log(`console errors (${String(errors.length)}):`);
  for (const error of errors.slice(0, 6)) console.log(`  ${error}`);
}
await browser.close();

