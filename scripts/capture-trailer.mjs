#!/usr/bin/env node
/* global document, window */
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = join(ROOT, 'output', 'trailer');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const wait = (milliseconds) => new Promise((done) => setTimeout(done, milliseconds));

if (!existsSync(CHROME)) throw new Error('Google Chrome was not found.');
rmSync(OUTPUT, { force: true, recursive: true });
mkdirSync(OUTPUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--autoplay-policy=no-user-gesture-required', '--enable-unsafe-swiftshader'],
});
const context = await browser.newContext({
  recordVideo: { dir: OUTPUT, size: { width: 1920, height: 1080 } },
  viewport: { width: 1920, height: 1080 },
});
const page = await context.newPage();
await page.addInitScript(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});
await page.goto('http://localhost:3020/play', { waitUntil: 'load', timeout: 120_000 });
await page.waitForSelector('canvas', { timeout: 180_000 });

await page.addStyleTag({ content: `
  [aria-label="Development tools"], [aria-label="AAA Visual Judge"] { display: none !important; }
  #trailer-card { position: fixed; inset: 0; z-index: 99999; display: grid; place-content: center;
    background: radial-gradient(circle at 50% 50%, rgba(16,34,52,.78), rgba(2,5,10,.97));
    color: white; text-align: center; font-family: Arial Black, Impact, sans-serif; letter-spacing: .08em; }
  #trailer-card h1 { margin: 0; font-size: 8vw; line-height: .86; font-style: italic;
    text-shadow: 8px 8px 0 #ff2d78, -6px -6px 0 #26d9ff; }
  #trailer-card p { margin: 2.2rem 0 0; color: #ffd43b; font: 800 1.5vw Arial, sans-serif; letter-spacing: .42em; }
` });

const removeJudge = async () => page.evaluate(() => {
  for (const element of document.querySelectorAll('button, aside')) {
    if (element.textContent?.includes('AAA JUDGE')) element.remove();
  }
});
const card = async (title, subtitle) => page.evaluate(({ title, subtitle }) => {
  document.querySelector('#trailer-card')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'trailer-card';
  overlay.innerHTML = `<h1>${title}</h1><p>${subtitle}</p>`;
  document.body.append(overlay);
}, { title, subtitle });
const clearCard = async () => page.evaluate(() => document.querySelector('#trailer-card')?.remove());
const waitForScreen = async (screen) => page.waitForFunction(
  (expected) => document.querySelector('[data-screen]')?.getAttribute('data-screen') === expected,
  screen,
  { timeout: 30_000 },
);

await removeJudge();
await card('CC//ULTIMATE', 'THE FIGHT STARTS NOW');
await wait(2_300);
await clearCard();
await wait(700);
await page.keyboard.press('ArrowDown');
await page.keyboard.press('Enter');
await waitForScreen('difficulty');
await page.keyboard.press('Enter');
await waitForScreen('character');
await wait(1_500);
await page.keyboard.press('ArrowRight');
await page.keyboard.press('ArrowRight');
await page.keyboard.press('Enter');
await wait(300);
await page.keyboard.press('ArrowRight');
await page.keyboard.press('ArrowRight');
await page.keyboard.press('Enter');
await waitForScreen('stage');
await wait(1_200);
await page.keyboard.press('ArrowRight');
await wait(500);
await page.keyboard.press('Enter');
await waitForScreen('versus');
await wait(1_800);
await page.keyboard.press('Enter');
await wait(200);
await page.keyboard.press('Enter');
await waitForScreen('fight');
await removeJudge();
await wait(1_000);
await page.keyboard.down('KeyD');
await wait(1_250);
await page.keyboard.up('KeyD');
let captureIndex = 0;
for (const key of ['KeyJ', 'KeyK', 'KeyO', 'KeyI', 'KeyL']) {
  await page.keyboard.press(key);
  await wait(320);
  captureIndex += 1;
  await page.screenshot({ path: join(OUTPUT, `hero-${captureIndex}.png`) });
  await wait(580);
}
await page.keyboard.down('KeyA');
await wait(700);
await page.keyboard.up('KeyA');
await page.keyboard.press('KeyO');
await wait(320);
await page.screenshot({ path: join(OUTPUT, 'cc-ultimate-hero.png') });
await wait(880);
await card('FIGHT YOUR WAY', 'FIVE FIGHTERS · THREE ARENAS · ONE CHAMPION');
await wait(2_600);

const video = page.video();
await context.close();
await browser.close();
console.log(await video.path());
