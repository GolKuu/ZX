import path from 'node:path';
import { buildRig, composeFigure } from './mim/build-rig.mjs';
import { buildCharacterSheet } from './mim/build-sheet.mjs';
import { emitPoses } from './mim/emit-poses.mjs';

/**
 * Regenerate every MIM asset from the drawing code.
 *
 * The art is source, not a binary drop: change a palette entry, a bone length
 * or a pose angle, re-run this, and the sprites, the character sheet and the
 * runtime pose table all move together.
 */
const PROFILE = path.join('public', 'sprites', 'mim-profile');
const SHEET = path.join('public', 'mim-character-sheet.png');
const POSE_MODULE = path.join('src', 'anim', 'mim', 'poses.generated.ts');

const rig = await buildRig(PROFILE);
console.log(`rig: ${String(Object.keys(rig.parts).length)} parts → ${PROFILE}`);

await buildCharacterSheet(SHEET, composeFigure());
console.log(`sheet: ${SHEET}`);

const posed = await emitPoses(POSE_MODULE);
console.log(`poses: ${String(posed)} entries → ${POSE_MODULE}`);
