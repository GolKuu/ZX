#!/usr/bin/env node
/* global document, requestAnimationFrame, window */
// Render-critique harness. Drives the running dev server with a real Chrome so
// the WebGL context gets the machine's GPU, walks the menu flow into a fight
// and writes PNGs the art-direction pass can be judged against.
//
//   node scripts/shoot.mjs                       # localhost:3000, headed
//   node scripts/shoot.mjs --headless --tag base # tag the output set
//
// Screenshots land in .shots/<tag>/ which is git-ignored.

import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

function parseArgs(argv) {
  const args = {
    url: 'http://localhost:3000',
    tag: 'shot',
    width: 1600,
    height: 900,
    headless: false,
    scale: 1,
    p1: 0,
    p2: 0,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (flag === '--headless') args.headless = true;
    else if (flag === '--url') args.url = argv[(i += 1)];
    else if (flag === '--tag') args.tag = argv[(i += 1)];
    else if (flag === '--width') args.width = Number(argv[(i += 1)]);
    else if (flag === '--height') args.height = Number(argv[(i += 1)]);
    else if (flag === '--scale') args.scale = Number(argv[(i += 1)]);
    // Roster index to move P1 / P2 onto before confirming. The select screen
    // opens on the first entry, so without this every shot is the same matchup
    // and a character you have just changed never appears in one.
    else if (flag === '--p1') args.p1 = Number(argv[(i += 1)]);
    else if (flag === '--p2') args.p2 = Number(argv[(i += 1)]);
  }
  return args;
}

function findBrowser() {
  const explicit = process.env.CHROME_PATH;
  if (explicit !== undefined && existsSync(explicit)) return explicit;
  const found = CHROME_CANDIDATES.find((candidate) => existsSync(candidate));
  if (found === undefined) {
    throw new Error(
      'No Chrome/Edge binary found. Set CHROME_PATH to a Chromium executable.',
    );
  }
  return found;
}

const wait = (ms) => new Promise((done) => setTimeout(done, ms));

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const outDir = join(ROOT, '.shots', args.tag);
  rmSync(outDir, { force: true, recursive: true });
  mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({
    executablePath: findBrowser(),
    headless: args.headless,
    args: [
      '--autoplay-policy=no-user-gesture-required',
      '--use-angle=default',
      // Headless Chrome falls back to SwiftShader without this; the software
      // rasteriser renders the same pixels, only slower.
      ...(args.headless ? ['--enable-unsafe-swiftshader'] : []),
    ],
  });
  const page = await browser.newPage({
    deviceScaleFactor: args.scale,
    viewport: { width: args.width, height: args.height },
  });

  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(String(error)));

  const shot = async (name) => {
    const file = join(outDir, `${name}.png`);
    await page.screenshot({ path: file });
    console.log(`shot  ${name}`);
  };
  const currentScreen = async () => page.evaluate(
    () => document.querySelector('[data-screen]')?.getAttribute('data-screen') ?? 'unknown',
  );
  const waitForScreen = async (screen) => {
    await page.waitForFunction(
      (expected) => document.querySelector('[data-screen]')?.getAttribute('data-screen') === expected,
      screen,
      { timeout: 30_000 },
    );
  };

  console.log(`open  ${args.url}/play`);
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  await page.goto(`${args.url}/play`, { waitUntil: 'load', timeout: 120_000 });

  // The route compiles the render pipeline on first hit; give dev-mode time.
  await page.waitForSelector('canvas', { timeout: 180_000 });
  await wait(2_500);
  const initialScreen = await currentScreen();
  if (initialScreen === 'result' || initialScreen === 'victory') {
    await page.locator(`[data-screen="${initialScreen}"] button`).last().click();
    await waitForScreen('mode');
  }
  await shot('01-mode-menu');

  // mode -> character select -> P1 -> P2 -> versus -> fight
  await page.keyboard.press('ArrowDown'); // focus "vs AI"
  await wait(200);
  await page.keyboard.press('Enter');
  await waitForScreen('difficulty');
  await page.keyboard.press('Enter'); // default AI difficulty
  await waitForScreen('character');
  await wait(800);
  await shot('02-character-select');

  // Walk the roster cursor onto the requested fighters before confirming.
  for (let step = 0; step < args.p1; step += 1) {
    await page.keyboard.press('ArrowRight');
    await wait(120);
  }
  await page.keyboard.press('Enter');
  await wait(400);
  for (let step = 0; step < args.p2; step += 1) {
    await page.keyboard.press('ArrowRight');
    await wait(120);
  }
  await page.keyboard.press('Enter');
  await waitForScreen('stage');
  await wait(800);
  await shot('03-stage-select');

  await page.keyboard.press('Enter');
  await waitForScreen('versus');
  await wait(800);
  await shot('04-versus');

  await page.keyboard.press('Enter');
  await wait(200);
  await page.keyboard.press('Enter');
  await waitForScreen('fight');
  await wait(2_000);
  await shot('05-fight-neutral');

  // A few frames of actual combat: walk in, then throw attacks so the shot
  // catches impact FX rather than an idle pose.
  await page.keyboard.down('KeyD');
  await wait(900);
  await page.keyboard.up('KeyD');
  await wait(300);
  await shot('06-fight-closed-in');

  await page.keyboard.press('KeyK'); // heavy punch
  // Long enough to land inside the active window. A heavy runs ~47 frames, so a
  // 150ms capture only ever caught the windup.
  await wait(330);
  await shot('07-attack-active');
  await wait(700);
  await page.keyboard.press('KeyO'); // special
  await wait(280);
  await shot('08-special');

  // Stand still in range and let the AI hit back. The damage reaction and the
  // blood spray are the only things in the frame the player never triggers, so
  // without a phase that deliberately takes a hit they were never in a shot.
  // Several captures because which frame the AI commits on is not fixed.
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    await wait(320);
    await shot(`09-taking-a-hit-${String(attempt)}`);
  }
  await wait(1_200);
  await shot('10-fight-recovery');

  const fps = await page.evaluate(async () => {
    let frames = 0;
    const start = performance.now();
    await new Promise((done) => {
      const tick = () => {
        frames += 1;
        if (performance.now() - start >= 1_000) done(undefined);
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    return Math.round((frames * 1_000) / (performance.now() - start));
  });

  const renderer = await page.evaluate(() => {
    const probe = document.createElement('canvas').getContext('webgl2');
    const info = probe?.getExtension('WEBGL_debug_renderer_info');
    return info === null || info === undefined || probe === null
      ? 'unknown'
      : String(probe.getParameter(info.UNMASKED_RENDERER_WEBGL));
  });

  console.log(`\nfps    ~${String(fps)}`);
  console.log(`gpu    ${renderer}`);
  console.log(`out    .shots/${args.tag}/`);
  if (consoleErrors.length > 0) {
    console.log(`\nconsole errors (${String(consoleErrors.length)}):`);
    for (const error of consoleErrors.slice(0, 10)) console.log(`  ${error}`);
  }

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
