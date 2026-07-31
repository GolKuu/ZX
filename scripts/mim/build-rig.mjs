import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PixelCanvas } from './canvas.mjs';
import {
  drawBraids,
  drawForearm,
  drawHead,
  drawHips,
  drawSash,
  drawTorso,
  drawUpperArm,
} from './draw-upper.mjs';
import { drawShin, drawThigh } from './draw-lower.mjs';
import {
  JOINTS,
  ORIGIN,
  PART_ORDER,
  PART_PARENTS,
  SOURCE,
  TEXTURE_SCALE,
} from './rig-spec.mjs';

const DRAWERS = {
  head: drawHead,
  braids: drawBraids,
  torso: drawTorso,
  hips: drawHips,
  sash: drawSash,
  armBackUpper: (canvas) => { drawUpperArm(canvas, 'back'); },
  armBackLower: (canvas) => { drawForearm(canvas, 'back'); },
  armFrontUpper: (canvas) => { drawUpperArm(canvas, 'front'); },
  armFrontLower: (canvas) => { drawForearm(canvas, 'front'); },
  legBackUpper: (canvas) => { drawThigh(canvas, 'back'); },
  legBackLower: (canvas) => { drawShin(canvas, 'back'); },
  legFrontUpper: (canvas) => { drawThigh(canvas, 'front'); },
  legFrontLower: (canvas) => { drawShin(canvas, 'front'); },
};

/**
 * Draw every part on the same full-size stage, then crop.
 *
 * Drawing in shared space is what guarantees the parts line up: each piece
 * keeps the joint coordinates the skeleton table gave it, and cropping only
 * records where the crop happened.
 */
export async function buildRig(directory) {
  await mkdir(directory, { recursive: true });
  const parts = {};

  for (const name of PART_ORDER) {
    const stage = new PixelCanvas(SOURCE.width, SOURCE.height);
    DRAWERS[name](stage);
    stage.rim(0, -1, 'cyanDeep', 'clothLit');
    stage.rim(1, 0, 'cyan', 'clothLit');
    stage.outline();
    const { canvas, offsetX, offsetY } = stage.trim(1);
    const joint = JOINTS[PART_PARENTS[name].joint];
    parts[name] = {
      width: canvas.width,
      height: canvas.height,
      pivot: [
        round((joint[0] - offsetX) / canvas.width),
        round((joint[1] - offsetY) / canvas.height),
      ],
      joint: [joint[0], joint[1]],
    };
    await canvas.scaled(TEXTURE_SCALE).write(path.join(directory, `${name}.png`));
  }

  const manifest = {
    source: 'scripts/mim (procedural pixel art)',
    view: { ...SOURCE, figureHeight: 96 },
    textureScale: TEXTURE_SCALE,
    facesRight: true,
    origin: ORIGIN,
    order: PART_ORDER,
    parents: PART_PARENTS,
    parts,
  };
  await writeFile(
    path.join(directory, 'rig.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );
  return manifest;
}

/** Compose the neutral standing figure, for the character sheet and previews. */
export function composeFigure() {
  const stage = new PixelCanvas(SOURCE.width, SOURCE.height);
  for (const name of PART_ORDER) {
    const layer = new PixelCanvas(SOURCE.width, SOURCE.height);
    DRAWERS[name](layer);
    layer.rim(0, -1, 'cyanDeep', 'clothLit');
    layer.rim(1, 0, 'cyan', 'clothLit');
    layer.outline();
    stage.blit(layer, 0, 0);
  }
  return stage;
}

function round(value) {
  return Math.round(value * 10_000) / 10_000;
}
