import { readFile, readdir } from 'node:fs/promises';
import { JSDOM, VirtualConsole } from 'jsdom';

const assetName = (await readdir(new URL('../dist/assets/', import.meta.url)))
  .find((name) => name.startsWith('index-') && name.endsWith('.js'));

if (!assetName) throw new Error('Built application bundle was not found');

const source = (await readFile(new URL(`../dist/assets/${assetName}`, import.meta.url), 'utf8'))
  .replaceAll(
    'import.meta',
    `({ url: 'http://127.0.0.1:5173/assets/${assetName}' })`,
  )
  .replace(/export\{[^}]+\};?\s*$/, '');
const errors = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', (error) => errors.push(error));
virtualConsole.on('error', (...args) => errors.push(args));

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://127.0.0.1:5173/',
  pretendToBeVisual: true,
  runScripts: 'outside-only',
  virtualConsole,
});

Object.assign(dom.window, {
  fetch,
  Headers,
  Request,
  Response,
  AbortController,
  TextEncoder,
  TextDecoder,
});

dom.window.addEventListener('error', (event) => errors.push(event.error ?? event.message));
dom.window.eval(source);
await new Promise((resolve) => setTimeout(resolve, 100));

const root = dom.window.document.querySelector('#root');
console.log(JSON.stringify({
  errorCount: errors.length,
  errors: errors.map((error) => String(error)),
  renderedText: root?.textContent?.slice(0, 120),
  childCount: root?.childElementCount,
}));
