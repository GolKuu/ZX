#!/usr/bin/env node
/* global requestAnimationFrame, window */
// Confirms the sheet's own attack drawing is on screen at the strike.
//
// The window is a handful of frames wide, so timing a screenshot from outside the
// page catches it by luck. This throws each attack in turn and, from inside the
// render loop, watches for the frame where the drawn pose is visible and the
// jointed rig is hidden — then screenshots exactly that frame.
//
//   node scripts/probe-strike.mjs --headless

import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
];

const headless = process.argv.includes('--headless');
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

// `--url` matters here: a second `next dev` on the same repo takes another port,
// and probing the wrong one reports on somebody else's working tree.
const urlFlag = process.argv.indexOf('--url');
const base = urlFlag === -1 ? 'http://localhost:3000' : process.argv[urlFlag + 1];
await page.goto(`${base}/play`, { waitUntil: 'load', timeout: 120_000 });
await page.waitForSelector('canvas', { timeout: 180_000 });
await wait(2_500);
await page.keyboard.press('ArrowDown');
await wait(200);
await page.keyboard.press('Enter');
await wait(1_200);
for (let step = 0; step < 3; step += 1) {
  await page.keyboard.press('ArrowRight');
  await wait(120);
}
await page.keyboard.press('Enter');
await wait(400);
await page.keyboard.press('Enter');
await wait(1_200);
await page.keyboard.press('Enter');
await wait(2_500);

const found = await page.evaluate(() => {
  const scene = window.__ccu?.scene;
  const panels = [];
  scene?.traverse((node) => {
    const source = node.material?.map?.image?.currentSrc
      ?? node.material?.map?.image?.src;
    if (typeof source === 'string' && source.includes('-attacks/')) {
      panels.push(source.slice(source.lastIndexOf('/') + 1));
    }
  });
  return panels;
});
console.log(`attack panels loaded into the scene: ${found.join(', ') || 'none'}`);

// Throw all four buttons; each is watched for its own strike frame.
for (const [button, label] of [['KeyJ', 'lp'], ['KeyK', 'hp'], ['KeyL', 'lk'], ['KeyU', 'hk']]) {
  await page.keyboard.press(button);
  const shown = await page.evaluate(async () => {
    const scene = window.__ccu?.scene;
    const visibleChain = (node) => {
      for (let step = node; step !== null && step !== undefined; step = step.parent) {
        if (step.visible === false) return false;
      }
      return true;
    };
    const start = performance.now();
    while (performance.now() - start < 1_200) {
      await new Promise((done) => requestAnimationFrame(() => done(undefined)));
      let drawn = null;
      scene?.traverse((node) => {
        const source = node.material?.map?.image?.currentSrc
          ?? node.material?.map?.image?.src;
        // Scoped to one character's panels on purpose: both fighters can have
        // them, and an unscoped traverse happily reports the opponent's drawing
        // as proof that this one works.
        if (typeof source !== 'string' || !source.includes('idol-attacks/')) return;
        if (node.visible && visibleChain(node)) {
          drawn = source.slice(source.lastIndexOf('/') + 1);
        }
      });
      if (drawn !== null) return drawn;
    }
    return null;
  });
  if (shown !== null) {
    await page.screenshot({ path: `.shots/strike-${label}.png` });
    console.log(`${label}: drew ${shown} → .shots/strike-${label}.png`);
  } else {
    console.log(`${label}: no drawn panel reached the screen`);
  }
  await wait(900);
}

if (errors.length > 0) {
  console.log(`page errors (${String(errors.length)}):`);
  for (const error of errors.slice(0, 5)) console.log(`  ${error}`);
}
await browser.close();
