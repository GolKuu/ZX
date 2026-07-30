import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { URL } from 'node:url';

import {
  ECHO_CINEMATIC_FREEZE_FRAMES,
} from '../.sim-test-build/src/data/echo-super-moves.js';

const CASES = [
  ['analysis', 'EchoAnalysis.module.css'],
  ['repeat', 'EchoRepeat.module.css'],
  ['statistics', 'EchoStatistics.module.css'],
];

test('Echo cinematic CSS ends with its simulation freeze', () => {
  for (const [kind, file] of CASES) {
    const source = readFileSync(
      new URL(`../src/ui/echo-super/${file}`, import.meta.url),
      'utf8',
    );
    const duration = source.match(/\.scene\s*\{[\s\S]*?animation:\s*scene\s+([\d.]+)s/)?.[1];
    assert.ok(duration, `missing scene duration in ${file}`);
    const freezeSeconds = ECHO_CINEMATIC_FREEZE_FRAMES[kind] / 60;
    assert.ok(
      Math.abs(Number(duration) - freezeSeconds) <= 0.02,
      `${kind}: ${duration}s animation vs ${freezeSeconds}s freeze`,
    );
  }
});
