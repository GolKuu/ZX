/**
 * MIM's four basic normals, authored as animation sequences rather than single
 * key poses.
 *
 * Angles follow the rig convention in pose-skeleton.mjs: degrees, clockwise,
 * 0 pointing down the screen. So a limb at 90 points forward (right, the way
 * MIM always attacks), 180 points straight up and a negative angle points back.
 * `lean` tilts the torso backwards for positive values; `head` is negative when
 * the mask turns towards the opponent.
 *
 * Every sequence runs idle -> anticipation -> startup -> active -> follow
 * through -> recovery -> idle, and the game frame each panel is taken from is
 * recorded so the sheet can be read against the frame data.
 */

/**
 * The stance everything returns to.
 *
 * The rear forearm is carried forward rather than hanging: swung back it sits
 * behind the torso in draw order and the hand simply vanishes, so the idle would
 * be the one panel in the row with only one hand on it.
 */
const IDLE = {
  lean: 4, head: -2, hipX: 1, hipY: 2,
  frontArm: 58, frontForearm: 74, backArm: -18, backForearm: 62,
  frontThigh: 26, frontShin: -20, backThigh: -24, backShin: 22,
  braidSweep: 0.1, sashSweep: 0.05,
};

/**
 * J - Mask Jab.
 *
 * The only linear attack in the kit: the lead hand travels in a straight line
 * and nothing else in the body swings, which is why the braids droop backwards
 * here and lift on the three rotational moves.
 *
 * The forward drive is written into the rear leg, not into `hipX`. With the rear
 * ankle pinned to the pivot, moving the hips in the pose data just moves the
 * whole figure back again and nothing travels; what actually carries the body
 * over the front foot is the rear leg extending backwards behind the hips.
 */
const MASK_JAB = {
  button: 'J',
  id: 'jab',
  name: 'MASK JAB',
  limb: 'LEAD HAND',
  limbClass: 'UPPER BODY',
  level: 'HIGH',
  purpose: 'FASTEST INTERRUPT / COMBO STARTER',
  frameData: { startup: 5, active: 3, recovery: 9 },
  support: 'back',
  contact: { limb: 'front', joint: 'wrist' },
  panels: [
    {
      phase: 'idle', frame: 0, label: 'IDLE',
      pose: IDLE,
    },
    {
      // A five-frame startup still gets a real pull-back: the lead hand draws
      // in towards the chest and the weight settles onto the rear leg.
      phase: 'anticipation', frame: 1, label: 'ANTICIPATION',
      pose: {
        lean: 8, head: -1, hipX: -2, hipY: 4,
        frontArm: 38, frontForearm: 58, backArm: -12, backForearm: 58,
        // The feet keep a clear gap: converged, the anticipation dip reads
        // one-footed in silhouette against a two-footed idle.
        frontThigh: 44, frontShin: -38, backThigh: -20, backShin: 54,
        braidSweep: 0.16, sashSweep: 0.12,
      },
    },
    {
      phase: 'startup', frame: 2, label: 'STARTUP',
      pose: {
        lean: 4, head: 0, hipX: 0, hipY: 3,
        frontArm: 52, frontForearm: 66, backArm: -4, backForearm: 56,
        frontThigh: 36, frontShin: -30, backThigh: -22, backShin: 40,
        braidSweep: 0.1, sashSweep: 0.06,
      },
    },
    {
      phase: 'startup', frame: 3, label: 'STARTUP',
      pose: {
        lean: 0, head: 1, hipX: 2, hipY: 1,
        frontArm: 72, frontForearm: 80, backArm: 6, backForearm: 58,
        frontThigh: 32, frontShin: -26, backThigh: -26, backShin: 22,
        braidSweep: 0.02, sashSweep: -0.02,
      },
    },
    {
      phase: 'startup', frame: 5, label: 'STARTUP',
      pose: {
        lean: -4, head: 3, hipX: 5, hipY: 0,
        frontArm: 84, frontForearm: 87, backArm: 22, backForearm: 64,
        frontThigh: 26, frontShin: -20, backThigh: -34, backShin: 16,
        braidSweep: -0.12, sashSweep: -0.1,
        // The front knee straightens as the weight arrives over it; the rear leg
        // extends behind the hips to carry the body there.
      },
    },
    {
      // The rear leg is straight and driving, the hips have travelled nine
      // pixels since the anticipation, and the lead hand is fully out.
      phase: 'active', frame: 6, label: 'ACTIVE / CONTACT',
      pose: {
        lean: -6, head: 4, hipX: 8, hipY: 0,
        frontArm: 89, frontForearm: 91, backArm: 30, backForearm: 68,
        frontThigh: 20, frontShin: -14, backThigh: -36, backShin: 14,
        braidSweep: -0.2, sashSweep: -0.16,
      },
    },
    {
      phase: 'follow', frame: 9, label: 'FOLLOW THROUGH',
      pose: {
        lean: 4, head: 0, hipX: 5, hipY: 2,
        frontArm: 66, frontForearm: 80, backArm: 10, backForearm: 50,
        frontThigh: 24, frontShin: -18, backThigh: -34, backShin: 18,
        braidSweep: -0.34, sashSweep: -0.3,
      },
    },
    {
      phase: 'recovery', frame: 11, label: 'RECOVERY',
      pose: {
        lean: 6, head: -1, hipX: 3, hipY: 3,
        frontArm: 52, frontForearm: 70, backArm: -2, backForearm: 46,
        frontThigh: 28, frontShin: -22, backThigh: -28, backShin: 22,
        braidSweep: -0.18, sashSweep: -0.14,
      },
    },
    {
      phase: 'recovery', frame: 13, label: 'RECOVERY',
      pose: {
        lean: 7, head: -3, hipX: 0, hipY: 4,
        frontArm: 46, frontForearm: 64, backArm: -22, backForearm: 40,
        frontThigh: 32, frontShin: -26, backThigh: -28, backShin: 26,
        braidSweep: -0.04, sashSweep: -0.02,
      },
    },
    {
      phase: 'recovery', frame: 17, label: 'RECOVERY END',
      pose: {
        lean: 7, head: -4, hipX: -1, hipY: 6,
        frontArm: 72, frontForearm: 86, backArm: -4, backForearm: 54,
        frontThigh: 32, frontShin: -26, backThigh: -30, backShin: 28,
        braidSweep: 0.03, sashSweep: 0,
      },
    },
    {
      phase: 'idle', frame: 18, label: 'BACK TO IDLE',
      pose: IDLE,
    },
  ],
};

/**
 * K - Back Elbow.
 *
 * The arm stays folded for the whole move: the elbow is the leading point and
 * the fist never passes it, which is what stops this reading as a second punch.
 * The rear arm drives backwards to pay for the rotation.
 *
 * The forearm folds back and DOWN, roughly 140 degrees off the upper arm, for
 * the whole move. Two readings depend on it. Folded to within about 175 degrees
 * the forearm lies along the upper arm and disappears, leaving one plain bar
 * with a hand on the end and no elbow to see; folded back and up, the fist ends
 * beside the mask and the pose reads as guarding the face. Back and down puts
 * the fist at the ribs and leaves the elbow as the highest, furthest-forward
 * corner of the arm - which is the whole silhouette of an elbow strike.
 *
 * The trailing shin likewise keeps a clear downward run, or the shoe is
 * swallowed by the thigh capsule and the leg ends in nothing.
 */
const BACK_ELBOW = {
  button: 'K',
  id: 'elbow',
  name: 'BACK ELBOW',
  limb: 'LEAD ELBOW',
  limbClass: 'UPPER BODY',
  level: 'MID',
  purpose: 'CLOSE INTERRUPT / INTO SPIN',
  frameData: { startup: 9, active: 4, recovery: 13 },
  support: 'front',
  contact: { limb: 'front', joint: 'elbow' },
  panels: [
    {
      phase: 'idle', frame: 0, label: 'IDLE',
      pose: IDLE,
    },
    {
      phase: 'anticipation', frame: 2, label: 'ANTICIPATION',
      pose: {
        lean: 10, head: 2, hipX: -2, hipY: 6,
        frontArm: -30, frontForearm: 190, backArm: -20, backForearm: 20,
        frontThigh: 40, frontShin: -34, backThigh: -30, backShin: 28,
        braidSweep: 0.3, sashSweep: 0.24,
      },
    },
    {
      phase: 'startup', frame: 5, label: 'STARTUP',
      pose: {
        lean: 2, head: 0, hipX: 1, hipY: 8,
        frontArm: 5, frontForearm: 225, backArm: -40, backForearm: -20,
        frontThigh: 30, frontShin: -32, backThigh: -28, backShin: 34,
        braidSweep: 0.36, sashSweep: 0.3,
      },
    },
    {
      phase: 'startup', frame: 7, label: 'STARTUP',
      pose: {
        lean: -4, head: -2, hipX: 3, hipY: 9,
        frontArm: 24, frontForearm: 245, backArm: -50, backForearm: -38,
        frontThigh: 25, frontShin: -32, backThigh: -29, backShin: 38,
        braidSweep: 0.39, sashSweep: 0.33,
      },
    },
    {
      phase: 'startup', frame: 9, label: 'STARTUP',
      pose: {
        lean: -10, head: -4, hipX: 5, hipY: 10,
        frontArm: 45, frontForearm: 265, backArm: -60, backForearm: -60,
        frontThigh: 20, frontShin: -32, backThigh: -30, backShin: 42,
        braidSweep: 0.42, sashSweep: 0.36,
      },
    },
    {
      phase: 'active', frame: 10, label: 'ACTIVE / CONTACT',
      pose: {
        lean: -26, head: -8, hipX: 9, hipY: 15,
        frontArm: 82, frontForearm: -46, backArm: -72, backForearm: -96,
        frontThigh: 10, frontShin: -30, backThigh: -34, backShin: 46,
        braidSweep: 0.48, sashSweep: 0.42,
      },
    },
    {
      phase: 'follow', frame: 13, label: 'FOLLOW THROUGH',
      pose: {
        lean: -14, head: -10, hipX: 14, hipY: 8,
        frontArm: 116, frontForearm: -20, backArm: -92, backForearm: -120,
        frontThigh: 2, frontShin: -26, backThigh: -42, backShin: 54,
        braidSweep: 0.56, sashSweep: 0.48,
      },
    },
    {
      phase: 'recovery', frame: 16, label: 'RECOVERY',
      pose: {
        lean: -18, head: -6, hipX: 6, hipY: 8,
        frontArm: 78, frontForearm: -62, backArm: -56, backForearm: -60,
        frontThigh: 16, frontShin: -30, backThigh: -30, backShin: 44,
        braidSweep: 0.4, sashSweep: 0.34,
      },
    },
    {
      phase: 'recovery', frame: 21, label: 'RECOVERY',
      pose: {
        lean: -2, head: -3, hipX: 3, hipY: 5,
        frontArm: 40, frontForearm: 150, backArm: -30, backForearm: 0,
        frontThigh: 26, frontShin: -26, backThigh: -24, backShin: 30,
        braidSweep: 0.24, sashSweep: 0.2,
      },
    },
    {
      phase: 'recovery', frame: 26, label: 'RECOVERY END',
      pose: {
        lean: 8, head: -4, hipX: 3, hipY: 6,
        frontArm: 46, frontForearm: 102, backArm: -28, backForearm: 22,
        frontThigh: 31, frontShin: -23, backThigh: -27, backShin: 29,
        braidSweep: 0.14, sashSweep: 0.1,
      },
    },
    {
      phase: 'idle', frame: 27, label: 'BACK TO IDLE',
      pose: IDLE,
    },
  ],
};

/**
 * I - Capoeira Kick.
 *
 * The rasteira: the hips drop far enough that the sweeping shin travels along
 * the floor, and the lead hand carries the weight behind the body.
 *
 * The bracing hand has to be the lead one. The rear arm is drawn behind the
 * torso, so a rear-hand plant is simply invisible at this size - the pose then
 * reads as a fall rather than a supported sweep.
 */
const CAPOEIRA_KICK = {
  button: 'I',
  id: 'capoeira',
  name: 'CAPOEIRA KICK',
  limb: 'LEAD SHIN / FOOT',
  limbClass: 'LEG',
  level: 'LOW',
  purpose: 'LOW PROFILE / OPENS STANDING GUARD',
  frameData: { startup: 11, active: 4, recovery: 15 },
  support: 'back',
  contact: { limb: 'front', joint: 'ankle' },
  panels: [
    {
      phase: 'idle', frame: 0, label: 'IDLE',
      pose: IDLE,
    },
    {
      phase: 'anticipation', frame: 3, label: 'ANTICIPATION',
      pose: {
        lean: 16, head: -10, hipX: -1, hipY: 12,
        frontArm: 20, frontForearm: 40, backArm: -20, backForearm: 10,
        frontThigh: 60, frontShin: -30, backThigh: -50, backShin: 44,
        braidSweep: 0.24, sashSweep: 0.2,
      },
    },
    {
      phase: 'startup', frame: 7, label: 'STARTUP / DROP',
      pose: {
        lean: 32, head: -30, hipX: -3, hipY: 24,
        frontArm: -26, frontForearm: -8, backArm: 96, backForearm: 124,
        frontThigh: 132, frontShin: 24, backThigh: -96, backShin: 28,
        braidSweep: 0.4, sashSweep: 0.34,
      },
    },
    {
      phase: 'startup', frame: 9, label: 'STARTUP / SINK',
      pose: {
        lean: 44, head: -46, hipX: -3, hipY: 28,
        frontArm: -22, frontForearm: -12, backArm: 114, backForearm: 138,
        frontThigh: 118, frontShin: 40, backThigh: -102, backShin: 26,
        braidSweep: 0.47, sashSweep: 0.6,
      },
    },
    {
      phase: 'startup', frame: 11, label: 'HAND PLANT',
      pose: {
        // Lean and hip drop are both tuned to one thing: the bracing hand has to
        // reach the floor. The arm is 27px and the shoulder has to come inside
        // that of the ground, which only happens once the torso is past about
        // fifty degrees over deeply folded legs.
        lean: 52, head: -54, hipX: -3, hipY: 34,
        frontArm: -18, frontForearm: -10, backArm: 130, backForearm: 152,
        frontThigh: 104, frontShin: 54, backThigh: -108, backShin: 24,
        braidSweep: 0.52, sashSweep: 0.74,
      },
    },
    {
      phase: 'active', frame: 12, label: 'ACTIVE / CONTACT',
      pose: {
        // The bracing hand is swung clear of the tucked support shoe and the
        // sash is thrown up behind the hip, so the floor contact reads as a
        // hand rather than as one knot of hand, shoe, sash and bracer.
        lean: 51, head: -53, hipX: -2, hipY: 35,
        frontArm: -18, frontForearm: -10, backArm: 138, backForearm: 160,
        frontThigh: 84, frontShin: 92, backThigh: -116, backShin: 22,
        braidSweep: 0.62, sashSweep: 0.82,
      },
    },
    {
      phase: 'follow', frame: 15, label: 'FOLLOW THROUGH',
      pose: {
        lean: 48, head: -52, hipX: 2, hipY: 22,
        frontArm: -30, frontForearm: -22, backArm: 160, backForearm: 182,
        frontThigh: 112, frontShin: 116, backThigh: -102, backShin: 28,
        braidSweep: 0.7, sashSweep: 0.86,
      },
    },
    {
      phase: 'recovery', frame: 19, label: 'RECOVERY',
      pose: {
        lean: 34, head: -36, hipX: -3, hipY: 21,
        frontArm: -24, frontForearm: -10, backArm: 124, backForearm: 148,
        frontThigh: 122, frontShin: 34, backThigh: -92, backShin: 30,
        braidSweep: 0.5, sashSweep: 0.44,
      },
    },
    {
      phase: 'recovery', frame: 25, label: 'RECOVERY',
      pose: {
        lean: 20, head: -18, hipX: -2, hipY: 16,
        frontArm: 14, frontForearm: 34, backArm: 40, backForearm: 80,
        frontThigh: 92, frontShin: -14, backThigh: -66, backShin: 38,
        braidSweep: 0.32, sashSweep: 0.26,
      },
    },
    {
      phase: 'recovery', frame: 30, label: 'RECOVERY END',
      pose: {
        lean: 8, head: -4, hipX: 0, hipY: 5,
        frontArm: 50, frontForearm: 66, backArm: -14, backForearm: 40,
        frontThigh: 34, frontShin: -26, backThigh: -32, backShin: 28,
        braidSweep: 0.16, sashSweep: 0.1,
      },
    },
    {
      phase: 'idle', frame: 31, label: 'BACK TO IDLE',
      pose: IDLE,
    },
  ],
};

/**
 * L - Spinning Kick.
 *
 * The heaviest normal: a full chamber, a horizontal leg through contact, and a
 * landing crouch deep enough that the punish window is visible on the sheet.
 *
 * The arms are deliberately split - lead arm down and across, rear arm up and
 * back. Swinging both to the same side turns the upper body into one dark mass
 * and the rotation stops reading.
 *
 * The support leg carries a real vertical arc: it compresses into the coil and
 * the chamber, drives up through contact, and folds deep again on the landing.
 * Without it the heaviest move in the kit travels horizontally at a constant
 * pelvis height and weighs nothing.
 */
const SPINNING_KICK = {
  button: 'L',
  id: 'spin',
  name: 'SPINNING KICK',
  limb: 'LEAD FOOT',
  limbClass: 'LEG',
  level: 'MID-HIGH',
  purpose: 'SPACE CONTROL / KNOCKBACK ENDER',
  frameData: { startup: 16, active: 5, recovery: 18 },
  support: 'back',
  contact: { limb: 'front', joint: 'ankle' },
  panels: [
    {
      phase: 'idle', frame: 0, label: 'IDLE',
      pose: IDLE,
    },
    {
      phase: 'anticipation', frame: 4, label: 'ANTICIPATION',
      pose: {
        lean: 16, head: 4, hipX: -3, hipY: 6,
        frontArm: 14, frontForearm: 54, backArm: 60, backForearm: 96,
        frontThigh: 34, frontShin: -28, backThigh: -34, backShin: 40,
        braidSweep: 0.18, sashSweep: 0.14,
      },
    },
    {
      phase: 'startup', frame: 9, label: 'STARTUP / CHAMBER',
      pose: {
        // Knee high and forward with the shin hanging down: the shoe has to sit
        // at the far end of the leg, or the chamber reads as a foot growing out
        // of the hip.
        lean: 22, head: 0, hipX: -1, hipY: 0,
        frontArm: -30, frontForearm: -4, backArm: 150, backForearm: 168,
        frontThigh: 108, frontShin: 8, backThigh: -32, backShin: 42,
        braidSweep: 0.44, sashSweep: 0.4,
      },
    },
    {
      phase: 'startup', frame: 13, label: 'STARTUP / TURN',
      pose: {
        lean: 25, head: -2, hipX: 0, hipY: -1,
        frontArm: -37, frontForearm: -10, backArm: 166, backForearm: 182,
        frontThigh: 104, frontShin: 17, backThigh: -32, backShin: 43,
        braidSweep: 0.53, sashSweep: 0.48,
      },
    },
    {
      phase: 'startup', frame: 16, label: 'STARTUP / HIP OPENS',
      pose: {
        lean: 28, head: -4, hipX: 1, hipY: -3,
        frontArm: -44, frontForearm: -16, backArm: 180, backForearm: 196,
        frontThigh: 100, frontShin: 26, backThigh: -30, backShin: 40,
        braidSweep: 0.62, sashSweep: 0.56,
      },
    },
    {
      phase: 'active', frame: 17, label: 'ACTIVE / CONTACT',
      pose: {
        lean: 32, head: -6, hipX: 2, hipY: -4,
        frontArm: -54, frontForearm: -24, backArm: 196, backForearm: 212,
        // Hip, knee and ankle collinear: at contact the leg is locked out, and
        // the bend only returns in the follow-through.
        frontThigh: 100, frontShin: 100, backThigh: -12, backShin: 24,
        braidSweep: 0.78, sashSweep: 0.68,
      },
    },
    {
      phase: 'follow', frame: 21, label: 'FOLLOW THROUGH',
      pose: {
        lean: 38, head: -8, hipX: 3, hipY: -2,
        frontArm: -64, frontForearm: -34, backArm: 208, backForearm: 224,
        frontThigh: 116, frontShin: 104, backThigh: -10, backShin: 22,
        braidSweep: 0.9, sashSweep: 0.8,
      },
    },
    {
      phase: 'recovery', frame: 26, label: 'OVERSHOOT',
      pose: {
        lean: 22, head: -2, hipX: 2, hipY: 4,
        frontArm: -40, frontForearm: -10, backArm: 172, backForearm: 190,
        frontThigh: 92, frontShin: 44, backThigh: -18, backShin: 30,
        braidSweep: 0.56, sashSweep: 0.5,
      },
    },
    {
      phase: 'recovery', frame: 32, label: 'RECOVERY / LANDING',
      pose: {
        lean: 12, head: -6, hipX: 0, hipY: 14,
        frontArm: 30, frontForearm: 96, backArm: 96, backForearm: 132,
        frontThigh: 50, frontShin: -50, backThigh: -42, backShin: 52,
        braidSweep: 0.2, sashSweep: 0.16,
      },
    },
    {
      phase: 'recovery', frame: 39, label: 'RECOVERY END',
      pose: {
        lean: 6, head: -3, hipX: 1, hipY: 5,
        frontArm: 70, frontForearm: 88, backArm: -22, backForearm: 34,
        frontThigh: 32, frontShin: -26, backThigh: -28, backShin: 26,
        braidSweep: 0.1, sashSweep: 0.06,
      },
    },
    {
      phase: 'idle', frame: 40, label: 'BACK TO IDLE',
      pose: IDLE,
    },
  ],
};

export const MOVE_SHEET = [MASK_JAB, BACK_ELBOW, CAPOEIRA_KICK, SPINNING_KICK];

export const IDLE_POSE = IDLE;

