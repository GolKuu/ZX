import { chromium } from 'playwright';
import fs from 'node:fs';
const OUT = 'artifacts/qa/shots-before';
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:5173';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const logs = [];
page.on('pageerror', e => logs.push('ERR ' + e.message));
await page.goto(BASE + '/vs-ai', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
// pick procedural fighters: Вольт (player1) / Рагнар (player2)
const cards = await page.locator('button', { hasText: 'Вольт' }).all();
if (cards[0]) await cards[0].click();
await page.waitForTimeout(300);
const cards2 = await page.locator('button', { hasText: 'Рагнар' }).all();
if (cards2[1]) await cards2[1].click(); else if (cards2[0]) await cards2[0].click();
await page.waitForTimeout(400);
await page.getByRole('button', { name: /Бой против ИИ/i }).first().click();
await page.waitForTimeout(5000);
await page.screenshot({ path: OUT + '/20-procedural-fighters.png' });
// spam attacks
for (let i = 0; i < 25; i++) { await page.keyboard.press('KeyJ'); await page.waitForTimeout(100); }
await page.screenshot({ path: OUT + '/21-procedural-combat.png' });
// walk right
await page.keyboard.down('KeyD'); await page.waitForTimeout(900); await page.keyboard.up('KeyD');
await page.screenshot({ path: OUT + '/22-procedural-walk.png' });
fs.writeFileSync(OUT + '/logs-procedural.txt', logs.join('\n'));
await browser.close();
console.log('done', logs.length, 'errors');
