import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const PROFILE_NAMES = [
  'idol-profile',
  'echo-profile',
  'chrono-profile',
  'glitch-profile',
];

test('MIM matches the average rendered height of the sprite roster', async () => {
  const mim = await loadManifest('mim-profile');
  const others = await Promise.all(PROFILE_NAMES.map(loadManifest));
  const average = others.reduce(
    (total, manifest) => total + renderedHeight(manifest),
    0,
  ) / others.length;

  assert.ok(
    Math.abs(renderedHeight(mim) - average) < 0.04,
    `MIM ${renderedHeight(mim).toFixed(3)} vs roster ${average.toFixed(3)}`,
  );
});

async function loadManifest(name) {
  return JSON.parse(
    await readFile(`public/sprites/${name}/rig.json`, 'utf8'),
  );
}

function renderedHeight(manifest) {
  const floor = manifest.origin[1];
  const top = Math.min(...Object.values(manifest.parts).map((part) => (
    part.joint[1] - part.pivot[1] * part.height
  )));
  const referenceHeight = manifest.view.figureHeight ?? manifest.view.height;
  return (floor - top) * 2.62 / referenceHeight;
}
