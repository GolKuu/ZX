import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PixelCanvas } from './canvas.mjs';
import { drawPose } from './draw-pose.mjs';
import { AIRBORNE_POSES, POSE_NAMES, POSE_TABLE } from './pose-table.mjs';
import { planted, solve } from './pose-skeleton.mjs';
import { ORIGIN, SOURCE, TEXTURE_SCALE } from './rig-spec.mjs';

/** Room for a fully extended butterfly kick without clipping the canvas. */
const STAGE = { width: SOURCE.width + 60, height: SOURCE.height + 40 };
const OFFSET = [30, 20];

export async function buildPosePanels(directory) {
  await mkdir(directory, { recursive: true });
  const poses = {};

  for (const name of POSE_NAMES) {
    const stage = new PixelCanvas(STAGE.width, STAGE.height);
    const solved = shift(
      AIRBORNE_POSES.has(name)
        ? solve(POSE_TABLE[name])
        : planted(solve(POSE_TABLE[name])),
    );
    drawPose(stage, solved);
    stage.outline();
    const { canvas, offsetX, offsetY } = stage.trim(1);
    poses[name] = {
      width: canvas.width,
      height: canvas.height,
      originX: round((ORIGIN[0] + OFFSET[0] - offsetX) / canvas.width),
      ground: round((ORIGIN[1] + OFFSET[1] - offsetY) / canvas.height),
    };
    await canvas.scaled(TEXTURE_SCALE).write(path.join(directory, `${name}.png`));
  }

  // Runtime impact panels keep the traditional button names. They are aliases
  // of the authored move silhouettes, not a second source of character art.
  for (const [button, poseName] of Object.entries({
    lp: 'jab',
    hp: 'elbow',
    lk: 'capoeira',
    hk: 'spin',
  })) {
    poses[button] = poses[poseName];
    await copyFile(
      path.join(directory, `${poseName}.png`),
      path.join(directory, `${button}.png`),
    );
  }

  const manifest = {
    source: 'scripts/mim (procedural pixel art)',
    textureScale: TEXTURE_SCALE,
    facesRight: true,
    poses,
  };
  await writeFile(
    path.join(directory, 'poses.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );
  return manifest;
}

function shift(solved) {
  const move = ([x, y]) => [x + OFFSET[0], y + OFFSET[1]];
  const limb = (side) => ({
    shoulder: move(side.shoulder),
    elbow: move(side.elbow),
    wrist: move(side.wrist),
    hip: move(side.hip),
    knee: move(side.knee),
    ankle: move(side.ankle),
  });
  return {
    ...solved,
    waist: move(solved.waist),
    neck: move(solved.neck),
    head: move(solved.head),
    hip: move(solved.hip),
    back: limb(solved.back),
    front: limb(solved.front),
  };
}

function round(value) {
  return Math.round(value * 10_000) / 10_000;
}
