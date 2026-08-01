/**
 * GLITCH's four basic normals, authored as animation sequences.
 *
 * Angles follow the shared rig convention: degrees, clockwise, 0 pointing down,
 * 90 pointing forward (right, the way GLITCH always attacks), 180 straight up.
 * `lean` tilts the torso backwards for positive values; `head` is negative when
 * the visor turns towards the opponent.
 *
 * Forward travel is written into the leg chain rather than into `hipX`. With the
 * support ankle pinned to the pivot column, moving the hips in the pose data
 * just moves the whole figure back again and nothing travels; what carries the
 * body forward is the rear leg extending out behind the hips.
 */

const IDLE = {
  lean: 5, head: -3, hipX: 1, hipY: 2,
  frontArm: 54, frontForearm: 78, backArm: -16, backForearm: 46,
  frontThigh: 26, frontShin: -20, backThigh: -24, backShin: 22,
  braidSweep: 0.12, sashSweep: 0.06,
};

/**
 * J — Phase Jab. The straight lead hand: the only linear attack in the kit.
 */
const PHASE_JAB = {
  button: 'J',
  id: 'phaseJab',
  name: 'PHASE JAB',
  limb: 'LEAD FIST',
  limbClass: 'UPPER BODY',
  level: 'HIGH',
  purpose: 'FASTEST INTERRUPT / COMBO STARTER',
  frameData: { startup: 5, active: 3, recovery: 8 },
  support: 'back',
  contact: { limb: 'front', joint: 'wrist' },
  panels: [
    { phase: 'idle', frame: 0, label: 'IDLE', pose: IDLE },
    {
      phase: 'anticipation', frame: 1, label: 'ANTICIPATION',
      pose: {
        lean: 9, head: -2, hipX: -2, hipY: 4,
        frontArm: 34, frontForearm: 56, backArm: -10, backForearm: 54,
        frontThigh: 40, frontShin: -34, backThigh: -20, backShin: 54,
        braidSweep: 0.18, sashSweep: 0.12,
      },
    },
    {
      phase: 'startup', frame: 2, label: 'STARTUP',
      pose: {
        lean: 5, head: -1, hipX: 0, hipY: 3,
        frontArm: 52, frontForearm: 68, backArm: -3, backForearm: 56,
        frontThigh: 34, frontShin: -28, backThigh: -23, backShin: 38,
        braidSweep: 0.1, sashSweep: 0.05,
      },
    },
    {
      phase: 'startup', frame: 3, label: 'STARTUP',
      pose: {
        lean: 1, head: 0, hipX: 2, hipY: 1,
        frontArm: 70, frontForearm: 80, backArm: 4, backForearm: 58,
        frontThigh: 26, frontShin: -20, backThigh: -26, backShin: 22,
        braidSweep: 0.02, sashSweep: -0.02,
      },
    },
    {
      phase: 'startup', frame: 5, label: 'STARTUP',
      pose: {
        lean: -4, head: 2, hipX: 5, hipY: 0,
        frontArm: 84, frontForearm: 88, backArm: 20, backForearm: 64,
        frontThigh: 26, frontShin: -20, backThigh: -34, backShin: 16,
        braidSweep: -0.14, sashSweep: -0.12,
      },
    },
    {
      phase: 'active', frame: 6, label: 'ACTIVE / CONTACT',
      pose: {
        lean: -7, head: 3, hipX: 8, hipY: 0,
        frontArm: 89, frontForearm: 91, backArm: 28, backForearm: 68,
        frontThigh: 26, frontShin: -20, backThigh: -36, backShin: 14,
        braidSweep: -0.22, sashSweep: -0.18,
      },
    },
    {
      phase: 'follow', frame: 9, label: 'FOLLOW THROUGH',
      pose: {
        lean: 3, head: 0, hipX: 5, hipY: 2,
        frontArm: 64, frontForearm: 80, backArm: 8, backForearm: 50,
        frontThigh: 26, frontShin: -20, backThigh: -34, backShin: 18,
        braidSweep: -0.36, sashSweep: -0.32,
      },
    },
    {
      phase: 'recovery', frame: 10, label: 'RECOVERY',
      pose: {
        lean: 6, head: -1, hipX: 3, hipY: 3,
        frontArm: 50, frontForearm: 70, backArm: -4, backForearm: 46,
        frontThigh: 27, frontShin: -21, backThigh: -28, backShin: 22,
        braidSweep: -0.2, sashSweep: -0.16,
      },
    },
    {
      phase: 'recovery', frame: 12, label: 'RECOVERY',
      pose: {
        lean: 8, head: -4, hipX: 0, hipY: 4,
        frontArm: 44, frontForearm: 64, backArm: -24, backForearm: 40,
        frontThigh: 30, frontShin: -24, backThigh: -28, backShin: 26,
        braidSweep: -0.06, sashSweep: -0.02,
      },
    },
    {
      phase: 'recovery', frame: 16, label: 'RECOVERY END',
      pose: {
        lean: 7, head: -4, hipX: -1, hipY: 6,
        frontArm: 68, frontForearm: 86, backArm: -6, backForearm: 54,
        frontThigh: 32, frontShin: -26, backThigh: -30, backShin: 28,
        braidSweep: 0.04, sashSweep: 0,
      },
    },
    { phase: 'idle', frame: 17, label: 'BACK TO IDLE', pose: IDLE },
  ],
};

/**
 * K — Rift Elbow. The forearm folds back and DOWN, about 140 degrees off the
 * upper arm, for the whole move: folded flat it lies along the upper arm and the
 * elbow disappears; folded back and up the fist ends beside the visor and the
 * pose reads as guarding. Back and down leaves the elbow as the highest,
 * furthest-forward corner of the arm, which is the whole silhouette of an elbow.
 */
const RIFT_ELBOW = {
  button: 'K',
  id: 'riftElbow',
  name: 'RIFT ELBOW',
  limb: 'LEAD ELBOW',
  limbClass: 'UPPER BODY',
  level: 'MID',
  purpose: 'ADVANCING PRESSURE / PUSHBACK',
  frameData: { startup: 9, active: 4, recovery: 13 },
  support: 'front',
  contact: { limb: 'front', joint: 'elbow' },
  panels: [
    { phase: 'idle', frame: 0, label: 'IDLE', pose: IDLE },
    {
      phase: 'anticipation', frame: 2, label: 'ANTICIPATION',
      pose: {
        lean: 11, head: 1, hipX: -2, hipY: 6,
        frontArm: -30, frontForearm: 190, backArm: -18, backForearm: 22,
        frontThigh: 40, frontShin: -34, backThigh: -30, backShin: 28,
        braidSweep: 0.32, sashSweep: 0.26,
      },
    },
    {
      phase: 'startup', frame: 5, label: 'STARTUP',
      pose: {
        lean: 3, head: -1, hipX: 1, hipY: 8,
        frontArm: 5, frontForearm: 225, backArm: -38, backForearm: -18,
        frontThigh: 30, frontShin: -32, backThigh: -28, backShin: 34,
        braidSweep: 0.38, sashSweep: 0.32,
      },
    },
    {
      phase: 'startup', frame: 7, label: 'STARTUP',
      pose: {
        lean: -4, head: -3, hipX: 3, hipY: 9,
        frontArm: 25, frontForearm: 245, backArm: -48, backForearm: -38,
        frontThigh: 25, frontShin: -32, backThigh: -29, backShin: 38,
        braidSweep: 0.41, sashSweep: 0.35,
      },
    },
    {
      phase: 'startup', frame: 9, label: 'STARTUP',
      pose: {
        lean: -10, head: -5, hipX: 5, hipY: 10,
        frontArm: 45, frontForearm: 265, backArm: -58, backForearm: -58,
        frontThigh: 20, frontShin: -32, backThigh: -30, backShin: 42,
        braidSweep: 0.44, sashSweep: 0.38,
      },
    },
    {
      phase: 'active', frame: 10, label: 'ACTIVE / CONTACT',
      pose: {
        lean: -26, head: -9, hipX: 9, hipY: 15,
        frontArm: 82, frontForearm: -46, backArm: -70, backForearm: -94,
        frontThigh: 10, frontShin: -30, backThigh: -34, backShin: 46,
        braidSweep: 0.5, sashSweep: 0.44,
      },
    },
    {
      phase: 'follow', frame: 13, label: 'FOLLOW THROUGH',
      pose: {
        lean: -14, head: -11, hipX: 14, hipY: 8,
        frontArm: 116, frontForearm: -20, backArm: -90, backForearm: -118,
        frontThigh: 2, frontShin: -26, backThigh: -42, backShin: 54,
        braidSweep: 0.58, sashSweep: 0.5,
      },
    },
    {
      phase: 'recovery', frame: 16, label: 'RECOVERY',
      pose: {
        lean: -18, head: -7, hipX: 6, hipY: 8,
        frontArm: 78, frontForearm: -62, backArm: -54, backForearm: -58,
        frontThigh: 16, frontShin: -30, backThigh: -30, backShin: 44,
        braidSweep: 0.42, sashSweep: 0.36,
      },
    },
    {
      phase: 'recovery', frame: 21, label: 'RECOVERY',
      pose: {
        lean: -2, head: -4, hipX: 3, hipY: 5,
        frontArm: 40, frontForearm: 150, backArm: -28, backForearm: 2,
        frontThigh: 26, frontShin: -26, backThigh: -24, backShin: 30,
        braidSweep: 0.26, sashSweep: 0.22,
      },
    },
    {
      phase: 'recovery', frame: 26, label: 'RECOVERY END',
      pose: {
        lean: 9, head: -5, hipX: 3, hipY: 6,
        frontArm: 44, frontForearm: 102, backArm: -28, backForearm: 24,
        frontThigh: 31, frontShin: -23, backThigh: -27, backShin: 29,
        braidSweep: 0.16, sashSweep: 0.12,
      },
    },
    { phase: 'idle', frame: 27, label: 'BACK TO IDLE', pose: IDLE },
  ],
};

/**
 * I — Low Vector Sweep.
 *
 * The bracing hand has to be the lead one. The rear arm is drawn behind the
 * torso, so a rear-hand plant is simply invisible at this size and the pose
 * reads as a fall rather than a supported sweep.
 */
const LOW_VECTOR_SWEEP = {
  button: 'I',
  id: 'lowVectorSweep',
  name: 'LOW VECTOR SWEEP',
  limb: 'LEAD SHIN / FOOT',
  limbClass: 'LEG',
  level: 'LOW',
  purpose: 'LOW PROFILE / OPENS STANDING GUARD',
  frameData: { startup: 11, active: 4, recovery: 15 },
  support: 'back',
  contact: { limb: 'front', joint: 'ankle' },
  panels: [
    { phase: 'idle', frame: 0, label: 'IDLE', pose: IDLE },
    {
      phase: 'anticipation', frame: 3, label: 'ANTICIPATION',
      pose: {
        lean: 17, head: -11, hipX: -1, hipY: 12,
        frontArm: 18, frontForearm: 38, backArm: -22, backForearm: 8,
        frontThigh: 60, frontShin: -30, backThigh: -50, backShin: 44,
        braidSweep: 0.26, sashSweep: 0.22,
      },
    },
    {
      phase: 'startup', frame: 7, label: 'STARTUP / DROP',
      pose: {
        lean: 33, head: -31, hipX: -3, hipY: 24,
        frontArm: -26, frontForearm: -8, backArm: 96, backForearm: 124,
        frontThigh: 132, frontShin: 24, backThigh: -96, backShin: 28,
        braidSweep: 0.42, sashSweep: 0.36,
      },
    },
    {
      phase: 'startup', frame: 9, label: 'STARTUP / SINK',
      pose: {
        lean: 38, head: -39, hipX: -3, hipY: 28,
        frontArm: -30, frontForearm: -16, backArm: 114, backForearm: 138,
        frontThigh: 118, frontShin: 40, backThigh: -102, backShin: 26,
        braidSweep: 0.48, sashSweep: 0.6,
      },
    },
    {
      phase: 'startup', frame: 11, label: 'HAND PLANT',
      pose: {
        lean: 43, head: -47, hipX: -3, hipY: 32,
        frontArm: -34, frontForearm: -24, backArm: 130, backForearm: 152,
        frontThigh: 104, frontShin: 54, backThigh: -108, backShin: 24,
        braidSweep: 0.54, sashSweep: 0.76,
      },
    },
    {
      phase: 'active', frame: 12, label: 'ACTIVE / CONTACT',
      pose: {
        lean: 45, head: -49, hipX: -2, hipY: 35,
        frontArm: -36, frontForearm: -26, backArm: 138, backForearm: 160,
        frontThigh: 84, frontShin: 92, backThigh: -116, backShin: 22,
        braidSweep: 0.64, sashSweep: 0.84,
      },
    },
    {
      phase: 'follow', frame: 15, label: 'FOLLOW THROUGH',
      pose: {
        lean: 49, head: -53, hipX: 2, hipY: 22,
        frontArm: -30, frontForearm: -22, backArm: 160, backForearm: 182,
        frontThigh: 112, frontShin: 116, backThigh: -102, backShin: 28,
        braidSweep: 0.72, sashSweep: 0.88,
      },
    },
    {
      phase: 'recovery', frame: 19, label: 'RECOVERY',
      pose: {
        lean: 35, head: -37, hipX: -3, hipY: 21,
        frontArm: -24, frontForearm: -10, backArm: 124, backForearm: 148,
        frontThigh: 122, frontShin: 34, backThigh: -92, backShin: 30,
        braidSweep: 0.52, sashSweep: 0.46,
      },
    },
    {
      phase: 'recovery', frame: 25, label: 'RECOVERY',
      pose: {
        lean: 21, head: -19, hipX: -2, hipY: 16,
        frontArm: 14, frontForearm: 34, backArm: 40, backForearm: 80,
        frontThigh: 92, frontShin: -14, backThigh: -66, backShin: 38,
        braidSweep: 0.34, sashSweep: 0.28,
      },
    },
    {
      phase: 'recovery', frame: 30, label: 'RECOVERY END',
      pose: {
        lean: 9, head: -5, hipX: 0, hipY: 5,
        frontArm: 50, frontForearm: 66, backArm: -12, backForearm: 42,
        frontThigh: 34, frontShin: -26, backThigh: -32, backShin: 28,
        braidSweep: 0.18, sashSweep: 0.12,
      },
    },
    { phase: 'idle', frame: 31, label: 'BACK TO IDLE', pose: IDLE },
  ],
};

/**
 * L — Breakpoint Axe.
 *
 * An overhead, not a roundhouse: the heel climbs above head height, then falls
 * along a steep downward line into the contact. The contact frame is on the way
 * DOWN, which is what separates this from a side kick — the leg is already past
 * its highest point when the hit lands, and it keeps falling afterwards.
 */
const BREAKPOINT_AXE = {
  button: 'L',
  id: 'breakpointAxe',
  name: 'BREAKPOINT AXE',
  limb: 'LEAD HEEL',
  limbClass: 'LEG',
  level: 'OVERHEAD',
  purpose: 'OVERHEAD / PUNISHES LOW BLOCK',
  frameData: { startup: 17, active: 5, recovery: 18 },
  support: 'back',
  contact: { limb: 'front', joint: 'heel' },
  panels: [
    { phase: 'idle', frame: 0, label: 'IDLE', pose: IDLE },
    {
      phase: 'anticipation', frame: 4, label: 'ANTICIPATION',
      pose: {
        lean: 18, head: 5, hipX: -3, hipY: 8,
        frontArm: 12, frontForearm: 50, backArm: 56, backForearm: 92,
        frontThigh: 36, frontShin: -30, backThigh: -34, backShin: 44,
        braidSweep: 0.2, sashSweep: 0.16,
      },
    },
    {
      phase: 'startup', frame: 9, label: 'STARTUP / KNEE UP',
      pose: {
        lean: 24, head: 1, hipX: -1, hipY: 2,
        frontArm: -28, frontForearm: -2, backArm: 146, backForearm: 166,
        frontThigh: 118, frontShin: 22, backThigh: -30, backShin: 40,
        braidSweep: 0.4, sashSweep: 0.36,
      },
    },
    {
      phase: 'startup', frame: 13, label: 'STARTUP / RISE',
      pose: {
        lean: 27, head: -1, hipX: 0, hipY: 0,
        frontArm: -37, frontForearm: -10, backArm: 161, backForearm: 180,
        frontThigh: 132, frontShin: 72, backThigh: -28, backShin: 39,
        braidSweep: 0.49, sashSweep: 0.44,
      },
    },
    {
      phase: 'startup', frame: 16, label: 'TOP OF ARC',
      pose: {
        lean: 30, head: -2, hipX: 0, hipY: -2,
        frontArm: -46, frontForearm: -18, backArm: 176, backForearm: 194,
        frontThigh: 146, frontShin: 122, backThigh: -26, backShin: 38,
        braidSweep: 0.58, sashSweep: 0.52,
      },
    },
    {
      phase: 'active', frame: 17, label: 'ACTIVE / CONTACT',
      pose: {
        lean: 26, head: -6, hipX: 2, hipY: -4,
        frontArm: -54, frontForearm: -24, backArm: 190, backForearm: 208,
        frontThigh: 118, frontShin: 80, backThigh: -14, backShin: 26,
        braidSweep: 0.74, sashSweep: 0.66,
      },
    },
    {
      phase: 'follow', frame: 21, label: 'FOLLOW THROUGH',
      pose: {
        lean: 16, head: -8, hipX: 3, hipY: 2,
        frontArm: -62, frontForearm: -32, backArm: 202, backForearm: 220,
        frontThigh: 84, frontShin: 50, backThigh: -20, backShin: 32,
        braidSweep: 0.86, sashSweep: 0.76,
      },
    },
    {
      phase: 'recovery', frame: 26, label: 'FOOT LANDS',
      pose: {
        lean: 10, head: -6, hipX: 1, hipY: 14,
        frontArm: 26, frontForearm: 92, backArm: 92, backForearm: 128,
        frontThigh: 52, frontShin: -50, backThigh: -44, backShin: 54,
        braidSweep: 0.22, sashSweep: 0.18,
      },
    },
    {
      phase: 'recovery', frame: 32, label: 'RECOVERY',
      pose: {
        lean: 14, head: -8, hipX: -1, hipY: 18,
        frontArm: 44, frontForearm: 108, backArm: 30, backForearm: 74,
        frontThigh: 58, frontShin: -56, backThigh: -50, backShin: 60,
        braidSweep: 0.14, sashSweep: 0.1,
      },
    },
    {
      phase: 'recovery', frame: 39, label: 'RECOVERY END',
      pose: {
        lean: 8, head: -5, hipX: 1, hipY: 6,
        frontArm: 68, frontForearm: 90, backArm: -18, backForearm: 36,
        frontThigh: 33, frontShin: -26, backThigh: -29, backShin: 27,
        braidSweep: 0.12, sashSweep: 0.08,
      },
    },
    { phase: 'idle', frame: 40, label: 'BACK TO IDLE', pose: IDLE },
  ],
};

export const MOVES = [PHASE_JAB, RIFT_ELBOW, LOW_VECTOR_SWEEP, BREAKPOINT_AXE];
export const IDLE_POSE = IDLE;
