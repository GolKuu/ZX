import { BONES, PALETTE, drawPose } from './figure.mjs';
import { IDLE_POSE, MOVES } from './moves.mjs';

/**
 * What each attack level means in pixels on a 96px figure.
 *
 * The bands come from the rig's real reach, not from taste: the shoulder sits
 * about 76px above the floor and the arm is 27px long, so a straight lead fist
 * lands near 68 and a folded elbow only gets below that if the hips sink. An
 * overhead lands on the way down, between chest and head height.
 */
export const FIGHTER = {
  key: 'glitch',
  name: 'GLITCH',
  title: 'THE REALITY BREAKER',
  accent: PALETTE.cyan,
  trail: PALETTE.violet,
  trailGlow: PALETTE.cyanGlow,
  // GLITCH's boot is a pixel deeper than MIM's shoe, so its ankle joint has to
  // sit a pixel higher for the sole to land flush on the shared floor line.
  ankleAboveFloor: 6,
  bones: BONES,
  idlePose: IDLE_POSE,
  moves: MOVES,
  drawPose,
  levelBands: {
    HIGH: [60, 82],
    MID: [50, 68],
    'MID-HIGH': [38, 72],
    OVERHEAD: [44, 78],
    LOW: [0, 18],
  },
};
