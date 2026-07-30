#!/usr/bin/env node
/* global window */
// One-off diagnostic: load /play and print whatever the browser complains about.
//
// The screenshot harness swallows a broken first paint — it waits for a canvas
// and times out with no explanation. This prints console errors, page
// exceptions, whether a canvas mounted, and any WebGL shader diagnostic, which
// is what actually distinguishes "shader failed to compile" from "React threw".
//
//   node scripts/probe-console.mjs [--url http://localhost:3000]

import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((path) => existsSync(path));

const urlFlag = process.argv.indexOf('--url');
const URL = urlFlag === -1 ? 'http://localhost:3000' : process.argv[urlFlag + 1];

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

page.on('console', (message) => {
  if (message.type() === 'error' || message.type() === 'warning') {
    console.log(`${message.type().toUpperCase()}: ${message.text().slice(0, 900)}`);
  }
});
page.on('pageerror', (error) => {
  console.log(`PAGEERROR: ${String(error).slice(0, 900)}`);
});

await page.goto(`${URL}/play`, { waitUntil: 'load', timeout: 120_000 });
await new Promise((done) => setTimeout(done, 14_000));

console.log('canvas count:', await page.locator('canvas').count());
const text = await page.locator('body').innerText().catch(() => '(no body)');
console.log('body text:', text.replace(/\s+/g, ' ').slice(0, 300));

await browser.close();
