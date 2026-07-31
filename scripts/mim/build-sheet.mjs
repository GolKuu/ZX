import { PixelCanvas } from './canvas.mjs';
import { drawPose } from './draw-pose.mjs';
import { POSE_TABLE } from './pose-table.mjs';
import { planted, solve } from './pose-skeleton.mjs';

const SHEET_POSES = [
  'jab', 'elbow', 'capoeira', 'spin',
  'mirrorStrike', 'vaultKnee', 'acrobat', 'butterfly',
  'wallSummon', 'wallLaunch', 'wallRun', 'wallDive',
];

const CELL = { width: 132, height: 128 };
const COLUMNS = 4;

/**
 * The character sheet: the neutral silhouette beside the twelve poses that
 * define MIM's reading. Generated from the same code that ships the sprites, so
 * the sheet can never drift from the character in the build.
 */
export async function buildCharacterSheet(file, figure) {
  const rows = Math.ceil(SHEET_POSES.length / COLUMNS);
  const sheet = new PixelCanvas(
    CELL.width * COLUMNS + figure.width + 8,
    Math.max(CELL.height * rows, figure.height) + 8,
  );
  sheet.rect(0, 0, sheet.width, sheet.height, [10, 14, 28, 255]);

  const trimmedFigure = figure.trim(2).canvas;
  sheet.blit(trimmedFigure, 4, 4);
  sheet.rect(trimmedFigure.width + 6, 0, 1, sheet.height, 'cyanDeep');

  for (const [index, name] of SHEET_POSES.entries()) {
    const cell = new PixelCanvas(CELL.width, CELL.height);
    const solved = planted(solve(POSE_TABLE[name]));
    // Bring the source-space figure into the cell: body centre to the middle,
    // floor row eight pixels off the bottom.
    drawPose(cell, offsetPose(solved, CELL.width / 2 - 88, CELL.height - 8 - 112));
    cell.outline();
    sheet.blit(
      cell,
      trimmedFigure.width + 10 + (index % COLUMNS) * CELL.width,
      4 + Math.floor(index / COLUMNS) * CELL.height,
    );
  }

  await sheet.scaled(2).write(file);
}

function offsetPose(solved, dx, dy) {
  const move = ([x, y]) => [x + dx, y + dy];
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
