/**
 * MIM's skeleton, in source pixels.
 *
 * One table, read by both the part drawings and the pose panels, so a limb can
 * never be one length in the idle and another in the butterfly kick. The whole
 * figure is 96 pixels crown to floor — roughly seven heads, which is the slim
 * acrobatic build the design calls for.
 */
export const SOURCE = { width: 176, height: 120 };

/** Body centre line and the floor row, in source pixels. */
export const ORIGIN = [88, 112];

const CROWN = ORIGIN[1] - 96;

/** y for a distance measured down from the crown. */
export function fromCrown(distance) {
  return CROWN + distance;
}

export const JOINTS = {
  headTop: [88, fromCrown(1)],
  headCentre: [88, fromCrown(8)],
  neck: [88, fromCrown(16)],
  braidRoot: [85, fromCrown(9)],
  shoulderBack: [85, fromCrown(20)],
  shoulderFront: [91, fromCrown(20)],
  elbowBack: [85, fromCrown(34)],
  elbowFront: [91, fromCrown(34)],
  wristBack: [85, fromCrown(47)],
  wristFront: [91, fromCrown(47)],
  waist: [88, fromCrown(45)],
  hipBack: [84, fromCrown(50)],
  hipFront: [91, fromCrown(50)],
  sashRoot: [84, fromCrown(46)],
  kneeBack: [84, fromCrown(72)],
  kneeFront: [91, fromCrown(72)],
  ankleBack: [84, fromCrown(91)],
  ankleFront: [91, fromCrown(91)],
  floor: [88, fromCrown(96)],
};

/** Segment lengths, so poses are built from a fixed bone list. */
export const BONES = {
  upperArm: 14,
  forearm: 13,
  thigh: 22,
  shin: 19,
  foot: 5,
  neckToHead: 8,
};

/** Limb radii. Slim, with the baggy trousers wider than the calf beneath. */
export const THICKNESS = {
  upperArm: 2.6,
  forearm: 2.2,
  hand: 2.4,
  thigh: 4.6,
  shin: 3.2,
  torso: 7,
};

/** Every part the runtime hangs, in draw order (back to front). */
export const PART_ORDER = [
  'braids',
  'armBackUpper',
  'armBackLower',
  'legBackUpper',
  'legBackLower',
  'sash',
  'hips',
  'torso',
  'head',
  'legFrontUpper',
  'legFrontLower',
  'armFrontUpper',
  'armFrontLower',
];

/** Which joint each part rotates about, and whose space it lives in. */
export const PART_PARENTS = {
  braids: { joint: 'braidRoot', parent: 'head' },
  head: { joint: 'neck', parent: 'torso' },
  torso: { joint: 'waist', parent: null },
  hips: { joint: 'waist', parent: 'torso' },
  sash: { joint: 'sashRoot', parent: 'torso' },
  armBackUpper: { joint: 'shoulderBack', parent: 'torso' },
  armBackLower: { joint: 'elbowBack', parent: 'armBackUpper' },
  armFrontUpper: { joint: 'shoulderFront', parent: 'torso' },
  armFrontLower: { joint: 'elbowFront', parent: 'armFrontUpper' },
  legBackUpper: { joint: 'hipBack', parent: 'hips' },
  legBackLower: { joint: 'kneeBack', parent: 'legBackUpper' },
  legFrontUpper: { joint: 'hipFront', parent: 'hips' },
  legFrontLower: { joint: 'kneeFront', parent: 'legFrontUpper' },
};

/** Authoring is 1×; textures ship at 3× so the grid survives on screen. */
export const TEXTURE_SCALE = 3;
