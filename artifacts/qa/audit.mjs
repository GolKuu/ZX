import { chromium, devices } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT = process.argv[2] || 'C:/Users/user/AppData/Local/Temp/claude/c--Users-user-Desktop-Nfactorial-project-ZX/8205e7f4-a943-4d63-9de1-ac109f077a8a/scratchpad/shots-before';
const BASE = process.env.BASE || 'http://localhost:5173';
fs.mkdirSync(OUT, { recursive: true });

const logs = [];

async function shot(page, name) {
  const p = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: p });
  console.log('SHOT', name);
}

const browser = await chromium.launch();

// ---------- DESKTOP ----------
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
page.on('console', (m) => logs.push(`[desktop][${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => logs.push(`[desktop][pageerror] ${e.message}`));

await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await shot(page, '01-home');
logs.push('HOME TEXT:\n' + (await page.locator('body').innerText()).slice(0, 2500));

await page.goto(BASE + '/vs-ai', { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
await shot(page, '02-vs-ai-setup');
logs.push('VSAI TEXT:\n' + (await page.locator('body').innerText()).slice(0, 4000));
logs.push('VSAI scrollHeight=' + await page.evaluate(() => document.documentElement.scrollHeight) +
  ' bodyScrollW=' + await page.evaluate(() => document.documentElement.scrollWidth));

// full page of setup
await page.screenshot({ path: path.join(OUT, '02b-vs-ai-full.png'), fullPage: true });

// start the fight
const startBtn = page.getByRole('button', { name: /Бой против ИИ/i });
if (await startBtn.count()) {
  await startBtn.first().click();
} else {
  logs.push('!! start button not found');
}
await page.waitForTimeout(2500);
await shot(page, '03-fight-start');

// countdown / early
await page.waitForTimeout(2000);
await shot(page, '04-fight-active');

// Try controls: focus canvas then press keys
await page.mouse.click(720, 450);
const seq = ['KeyD','KeyD','KeyA','KeyW','KeyJ','KeyK','KeyL','Space','KeyU','KeyI','KeyO'];
for (const k of seq) {
  await page.keyboard.down(k); await page.waitForTimeout(120); await page.keyboard.up(k);
  await page.waitForTimeout(120);
}
await shot(page, '05-after-inputs');

// hold attack spam for a while to progress the round
for (let i = 0; i < 40; i++) {
  await page.keyboard.press('KeyJ');
  await page.waitForTimeout(90);
}
await shot(page, '06-mid-round');

// pause
await page.keyboard.press('Escape');
await page.waitForTimeout(600);
await shot(page, '07-pause-escape');
await page.keyboard.press('Escape');
await page.waitForTimeout(400);

// let match run out (timer)
logs.push('waiting for round to end...');
for (let i = 0; i < 45; i++) {
  await page.keyboard.press('KeyJ');
  await page.waitForTimeout(400);
  const txt = await page.locator('body').innerText();
  if (/Матч завершён|побеждает/i.test(txt)) { logs.push('match ended at iter ' + i); break; }
}
await page.waitForTimeout(1500);
await shot(page, '08-match-end');
logs.push('END TEXT:\n' + (await page.locator('body').innerText()).slice(0, 2000));

// canvas info
const canvasInfo = await page.evaluate(() => {
  const cs = [...document.querySelectorAll('canvas')];
  return cs.map(c => ({ w: c.width, h: c.height, cw: c.clientWidth, ch: c.clientHeight, style: c.getAttribute('style') }));
});
logs.push('CANVAS: ' + JSON.stringify(canvasInfo, null, 2));

// ---------- MOBILE ----------
const mctx = await browser.newContext({ ...devices['iPhone 13'] });
const mpage = await mctx.newPage();
mpage.on('console', (m) => logs.push(`[mobile][${m.type()}] ${m.text()}`));
mpage.on('pageerror', (e) => logs.push(`[mobile][pageerror] ${e.message}`));
await mpage.goto(BASE + '/', { waitUntil: 'networkidle' });
await mpage.waitForTimeout(700);
await shot(mpage, '10-mobile-home');
await mpage.goto(BASE + '/vs-ai', { waitUntil: 'networkidle' });
await mpage.waitForTimeout(900);
await shot(mpage, '11-mobile-setup');
await mpage.screenshot({ path: path.join(OUT, '11b-mobile-setup-full.png'), fullPage: true });
logs.push('MOBILE scrollW=' + await mpage.evaluate(() => document.documentElement.scrollWidth) +
  ' clientW=' + await mpage.evaluate(() => document.documentElement.clientWidth));
const mstart = mpage.getByRole('button', { name: /Бой против ИИ/i });
if (await mstart.count()) await mstart.first().click();
await mpage.waitForTimeout(3000);
await shot(mpage, '12-mobile-fight');
await mpage.screenshot({ path: path.join(OUT, '12b-mobile-fight-full.png'), fullPage: true });
logs.push('MOBILE FIGHT TEXT:\n' + (await mpage.locator('body').innerText()).slice(0, 1500));

// landscape
const lctx = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
const lpage = await lctx.newPage();
lpage.on('pageerror', (e) => logs.push(`[landscape][pageerror] ${e.message}`));
await lpage.goto(BASE + '/vs-ai', { waitUntil: 'networkidle' });
await lpage.waitForTimeout(700);
const lstart = lpage.getByRole('button', { name: /Бой против ИИ/i });
if (await lstart.count()) await lstart.first().click();
await lpage.waitForTimeout(2500);
await shot(lpage, '13-mobile-landscape-fight');

fs.writeFileSync(path.join(OUT, 'logs.txt'), logs.join('\n'));
console.log('LOGS WRITTEN');
await browser.close();
