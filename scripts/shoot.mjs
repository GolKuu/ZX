#!/usr/bin/env node
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
  };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (flag === '--headless') args.headless = true;
    else if (flag === '--url') args.url = argv[(i += 1)];
    else if (flag === '--tag') args.tag = argv[(i += 1)];
    else if (flag === '--width') args.width = Number(argv[(i += 1)]);
    else if (flag === '--height') args.height = Number(argv[(i += 1)]);
    else if (flag === '--scale') args.scale = Number(argv[(i += 1)]);
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

  console.log(`open  ${args.url}/play`);
  await page.goto(`${args.url}/play`, { waitUntil: 'load', timeout: 120_000 });

  // The route compiles the render pipeline on first hit; give dev-mode time.
  await page.waitForSelector('canvas', { timeout: 180_000 });
  await wait(2_500);
  await shot('01-mode-menu');

  // mode -> character select -> P1 -> P2 -> versus -> fight
  await page.keyboard.press('ArrowDown'); // focus "vs AI"
  await wait(200);
  await page.keyboard.press('Enter');
  await wait(1_200);
  await shot('02-character-select');

  await page.keyboard.press('Enter');
  await wait(400);
  await page.keyboard.press('Enter');
  await wait(1_200);
  await shot('03-versus');

  await page.keyboard.press('Enter');
  await wait(2_500);
  await shot('04-fight-neutral');

  // A few frames of actual combat: walk in, then throw attacks so the shot
  // catches impact FX rather than an idle pose.
  await page.keyboard.down('KeyD');
  await wait(900);
  await page.keyboard.up('KeyD');
  await wait(300);
  await shot('05-fight-closed-in');

  await page.keyboard.press('KeyK'); // heavy punch
  await wait(150);
  await shot('06-attack-active');
  await wait(700);
  await page.keyboard.press('KeyO'); // special
  await wait(280);
  await shot('07-special');
  await wait(1_500);
  await shot('08-fight-recovery');

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
