import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const SOURCE_ROOT = path.resolve('src');
const VOICE_API_PATTERNS = [
  /speechSynthesis/,
  /SpeechSynthesisUtterance/,
  /new\s+(?:window\.)?Audio\s*\(/,
];

test('runtime source contains no voice playback path', async () => {
  const sourceFiles = await collectSourceFiles(SOURCE_ROOT);
  const violations = [];

  for (const file of sourceFiles) {
    const source = await readFile(file, 'utf8');
    if (VOICE_API_PATTERNS.some((pattern) => pattern.test(source))) {
      violations.push(path.join('src', path.relative(SOURCE_ROOT, file)));
    }
  }

  assert.deepEqual(violations, []);
});

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(absolute);
    return /\.(?:ts|tsx|js|jsx|mjs)$/.test(entry.name) ? [absolute] : [];
  }));
  return nested.flat();
}
