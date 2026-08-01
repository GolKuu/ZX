import { PALETTE } from '../../mim/palette.mjs';
import { BONES, drawPose } from './figure.mjs';
import { IDLE_POSE, MOVE_SHEET } from '../../mim/move-sheet-poses.mjs';

/**
 * What each attack level means in pixels on a 96px figure.
 *
 * The bands come from the rig's real reach, not from taste: the shoulder sits
 * about 76px above the floor and the arm is 27px long, so a straight lead hand
 * lands near 68 and a folded elbow only gets below that if the hips sink.
 */
export const FIGHTER = {
  key: 'mim',
  name: 'MIM',
  title: 'THE SHADOW PUPPETEER',
  accent: PALETTE.cyan,
  trail: PALETTE.cyan,
  trailGlow: PALETTE.cyanGlow,
  ankleAboveFloor: 5,
  bones: BONES,
  idlePose: IDLE_POSE,
  moves: MOVE_SHEET,
  drawPose,
  levelBands: {
    HIGH: [60, 82],
    MID: [50, 68],
    'MID-HIGH': [38, 72],
    OVERHEAD: [44, 78],
    LOW: [0, 18],
  },
};
