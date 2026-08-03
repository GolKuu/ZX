import { readFile, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';

const ROOTS = ['src'];
const TEXT_EXTENSIONS = new Set(['.css', '.json', '.ts', '.tsx']);
const MOJIBAKE = /(?:[\u0420\u0421][\u0402-\u040f\u0452-\u045f\u00a0-\u00bf]|\u0432\u0402|\u0413\u2014|\u00d0|\u00d1|\ufffd)/u;
const failures = [];

async function visit(path) {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const target = join(path, entry.name);
    if (entry.isDirectory()) await visit(target);
    else if (TEXT_EXTENSIONS.has(extname(entry.name))) {
      const text = await readFile(target, 'utf8');
      text.split(/\r?\n/u).forEach((line, index) => {
        if (MOJIBAKE.test(line)) failures.push(`${target}:${index + 1}`);
      });
    }
  }
}

for (const root of ROOTS) await visit(root);
if (failures.length > 0) {
  console.error(`Broken UTF-8/mojibake detected:\n${failures.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log('UTF-8 encoding check passed.');
}
