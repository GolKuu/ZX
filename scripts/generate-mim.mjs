import path from 'node:path';
import { buildRig, composeFigure } from './mim/build-rig.mjs';
import { buildPosePanels } from './mim/build-poses.mjs';
import { buildCharacterSheet } from './mim/build-sheet.mjs';

/**
 * Regenerate every MIM texture from the drawing code.
 *
 * The art is source, not a binary drop: changing a palette entry or a bone
 * length and re-running this is the whole edit loop.
 */
const PROFILE = path.join('public', 'sprites', 'mim-profile');
const POSES = path.join('public', 'sprites', 'mim-attacks');
const SHEET = path.join('public', 'mim-character-sheet.png');

const rig = await buildRig(PROFILE);
console.log(`rig: ${String(Object.keys(rig.parts).length)} parts → ${PROFILE}`);

const poses = await buildPosePanels(POSES);
console.log(`poses: ${String(Object.keys(poses.poses).length)} panels → ${POSES}`);

await buildCharacterSheet(SHEET, composeFigure());
console.log(`sheet: ${SHEET}`);
