import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const PROFILE_NAMES = [
  'idol-profile',
  'echo-profile',
  'chrono-profile',
  'glitch-profile',
];

test('MIM is slightly shorter than the average sprite fighter', async () => {
  const mim = await loadManifest('mim-profile');
  const others = await Promise.all(PROFILE_NAMES.map(loadManifest));
  const average = others.reduce(
    (total, manifest) => total + renderedHeight(manifest),
    0,
  ) / others.length;
  const difference = average - renderedHeight(mim);

  assert.ok(
    difference > 0.02 && difference < 0.07,
    `MIM ${renderedHeight(mim).toFixed(3)} vs roster ${average.toFixed(3)}`,
  );
});

test('GLITCH combat stance and upright attack match the sprite roster scale', async () => {
  const glitch = await loadManifest('glitch-profile');
  const attacks = JSON.parse(
    await readFile('public/sprites/glitch-attacks/poses.json', 'utf8'),
  );
  const others = await Promise.all(
    ['idol-profile', 'echo-profile', 'chrono-profile', 'mim-profile']
      .map(loadManifest),
  );
  const rosterAverage = others.reduce(
    (total, manifest) => total + renderedHeight(manifest),
    0,
  ) / others.length;
  const uprightAttackHeight = (
    attacks.poses.lp.height
    * attacks.poses.lp.ground
    * 2.62
    / 490
    * attacks.displayScale
  );

  assert.ok(
    Math.abs(renderedHeight(glitch) - rosterAverage) < 0.04,
    `GLITCH ${renderedHeight(glitch).toFixed(3)} vs roster `
      + `${rosterAverage.toFixed(3)}`,
  );
  assert.ok(
    Math.abs(uprightAttackHeight - renderedHeight(glitch)) < 0.04,
    `GLITCH LP ${uprightAttackHeight.toFixed(3)} vs stance `
      + `${renderedHeight(glitch).toFixed(3)}`,
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
