export type PhotoAttackKind =
  | 'jab'
  | 'heavy'
  | 'kick'
  | 'highKick'
  | 'sweep'
  | 'uppercut';

export interface PhotoAttackMotion {
  readonly x: number;
  readonly y: number;
  readonly rotation: number;
  /**
   * Hip turn around the vertical axis, always inside `MAX_HIP_TURN`.
   *
   * A value approaching PI would present the fighter's back. K and L used to do
   * exactly that so their rear-side drawings arrived from behind, which hid the
   * strike and read as turning away from the opponent mid-combo.
   */
  readonly turnY: number;
  readonly scaleX: number;
  readonly scaleY: number;
}

/**
 * The widest hip turn any attack may use, in radians.
 *
 * Rear-hand and rear-leg silhouettes come from their own atlas frames, so the
 * yaw only has to suggest the weight transfer behind them. Keeping it under a
 * seventh of a turn means every attack stays square to the camera — the player
 * must always read the fighter's front, never its back.
 */
export const MAX_HIP_TURN = 0.26;

/** The physical I/L standing normals for every fighter in the roster. */
export const PHOTO_KICK_NORMAL_IDS = [
  'mim.capoeira',
  'mim.spin',
  'glitch.low-vector-sweep',
  'glitch.breakpoint-axe',
  'lucky.sliding-bet',
  'lucky.fortune-heel',
  'titan.normal.seismic-stomp',
  'titan.normal.siege-ram',
  'vorgh.normal.hunting-sweep',
  'vorgh.normal.rising-maul',
] as const;

/**
 * The four physical attack keys must always keep their own silhouette.
 *
 * Do not infer these normals from words such as "elbow" or "ram": that used
 * to collapse MIM and Glitch's K attack into the same jab drawing as J. The
 * table is deliberately explicit so J/K/I/L remain lead hand, rear hand,
 * lead leg and rear leg for every selectable fighter.
 */
export const PHOTO_NORMAL_ATTACK_KINDS: Readonly<Record<string, PhotoAttackKind>> = {
  'mim.jab': 'jab',
  'mim.elbow': 'heavy',
  'mim.capoeira': 'kick',
  'mim.spin': 'highKick',
  'glitch.phase-jab': 'jab',
  'glitch.rift-elbow': 'heavy',
  'glitch.low-vector-sweep': 'sweep',
  'glitch.breakpoint-axe': 'highKick',
  'lucky.quick-draw': 'jab',
  'lucky.loaded-shoulder': 'heavy',
  'lucky.sliding-bet': 'sweep',
  'lucky.fortune-heel': 'highKick',
  'titan.normal.piston-hammer': 'jab',
  'titan.normal.bulkhead-backfist': 'heavy',
  'titan.normal.seismic-stomp': 'kick',
  'titan.normal.siege-ram': 'highKick',
  'vorgh.normal.predator-rake': 'jab',
  'vorgh.normal.skull-ram': 'heavy',
  'vorgh.normal.hunting-sweep': 'sweep',
  'vorgh.normal.rising-maul': 'highKick',
};

const EXPLICIT_KICKS: Readonly<Record<string, PhotoAttackKind>> = {
  ...PHOTO_NORMAL_ATTACK_KINDS,
  'titan.normal-anti-air': 'highKick',
};

export function photoAttackKind(moveId: string): PhotoAttackKind {
  const id = moveId.toLowerCase();
  const explicit = EXPLICIT_KICKS[id];
  if (explicit !== undefined) return explicit;
  if (includesAny(id, ['sweep', 'low-vector', 'shin-kick', 'sliding-fortune'])) {
    return 'sweep';
  }
  if (includesAny(id, [
    'axe', 'spin', 'heel', 'triple-kick', 'butterfly', 'fortune-break',
    'reversal-kick', 'air-heavy', 'air-finisher', 'crouch-heavy',
    'normal-anti-air', 'descending',
  ])) {
    return 'highKick';
  }
  if (includesAny(id, ['kick', 'knee', 'stomp', 'capoeira', 'vault', 'wall-dive'])) {
    return 'kick';
  }
  if (includesAny(id, ['uppercut', 'anti-air', 'launcher'])) return 'uppercut';
  if (includesAny(id, ['jab', 'light', 'elbow', 'strike'])) return 'jab';
  return 'heavy';
}

/**
 * One attack's whole-body travel, as signed coefficients on the two envelope
 * terms. Every field multiplies `chamber` or `contact`, and both decay to zero
 * by the end of recovery — so an attack always lands back on exact neutral
 * without a separate settle pass, and a table cannot leave the fighter drifted.
 */
interface MotionCurve {
  readonly chamberX: number;
  readonly contactX: number;
  readonly chamberY: number;
  readonly contactY: number;
  /** Roll about Z. Positive tips the torso back, away from the opponent. */
  readonly chamberRoll: number;
  readonly contactRoll: number;
  /** Hip yaw, as a fraction of `MAX_HIP_TURN`. */
  readonly chamberTurn: number;
  readonly contactTurn: number;
  readonly chamberWide: number;
  readonly contactWide: number;
  readonly chamberTall: number;
  readonly contactTall: number;
}

function curve(overrides: Partial<MotionCurve> = {}): MotionCurve {
  return {
    chamberX: 0,
    contactX: 0,
    chamberY: 0,
    contactY: 0,
    chamberRoll: 0,
    contactRoll: 0,
    chamberTurn: 0,
    contactTurn: 0,
    chamberWide: 0,
    contactWide: 0,
    chamberTall: 0,
    contactTall: 0,
    ...overrides,
  };
}

function motionFrom(shape: MotionCurve, progress: number): PhotoAttackMotion {
  const { chamber, contact } = kickEnvelope(progress);
  return {
    x: chamber * shape.chamberX + contact * shape.contactX,
    y: chamber * shape.chamberY + contact * shape.contactY,
    rotation: chamber * shape.chamberRoll + contact * shape.contactRoll,
    turnY: MAX_HIP_TURN * (
      chamber * shape.chamberTurn + contact * shape.contactTurn
    ),
    scaleX: 1 + chamber * shape.chamberWide + contact * shape.contactWide,
    scaleY: 1 + chamber * shape.chamberTall + contact * shape.contactTall,
  };
}

/**
 * ## Why the standing normals move so much more than everything else
 *
 * The atlas gives each fighter one drawing per limb action, and the two hand
 * drawings were photographed from the same side: measured as silhouettes, the
 * lead-hand and rear-hand contact cells overlap by 64–74% for all four
 * fighters, and the two leg cells by up to 57%. The artwork alone therefore
 * cannot tell the player which hand or which leg just moved — J and K arrive
 * as the same picture with a bigger spark on it.
 *
 * So the separation has to come from the body, and the numbers below are the
 * only thing on screen that can carry it. They are roughly twice the size of
 * the generic curves further down, and — more importantly — each one has a
 * signature the other three do not share:
 *
 * - **J, lead hand** — short flat snap. Square hips, no lift, no yaw.
 * - **K, rear hand** — the longest travel of the four, hips turning over and
 *   the shoulder rolling down through the target.
 * - **I, lead leg** — the fighter *sinks*: hips drop, body squashes, and the
 *   torso counter-leans back while the hips stay square.
 * - **L, rear leg** — the fighter *rises*, on the deepest hip turn of the four.
 *
 * Lead limbs never yaw and rear limbs always do; hands stay level while legs
 * move the fighter up or down. Those two rules alone are enough to read the
 * limb off a drawing that cannot show it.
 */
const STANDING_NORMAL_MOTION: Readonly<Record<PhotoAttackKind, MotionCurve>> = {
  jab: curve({
    chamberX: -0.03,
    contactX: 0.16,
    contactY: 0.02,
    contactRoll: -0.05,
    contactWide: 0.05,
    contactTall: -0.02,
  }),
  heavy: curve({
    chamberX: -0.12,
    contactX: 0.34,
    chamberY: -0.04,
    contactY: 0.02,
    chamberRoll: 0.1,
    contactRoll: -0.2,
    chamberTurn: 0.55,
    contactTurn: -1,
    contactWide: 0.09,
    chamberTall: -0.03,
    contactTall: 0.01,
  }),
  kick: curve({
    chamberX: -0.06,
    contactX: 0.22,
    chamberY: -0.1,
    contactY: -0.06,
    chamberRoll: 0.04,
    contactRoll: 0.06,
    contactWide: 0.07,
    chamberTall: -0.04,
    contactTall: -0.03,
  }),
  sweep: curve({
    chamberX: -0.06,
    contactX: 0.26,
    chamberY: -0.12,
    contactY: -0.04,
    chamberRoll: 0.05,
    contactRoll: 0.07,
    contactWide: 0.06,
    chamberTall: -0.05,
    contactTall: -0.02,
  }),
  highKick: curve({
    chamberX: -0.12,
    contactX: 0.18,
    chamberY: -0.05,
    contactY: 0.24,
    chamberRoll: 0.14,
    contactRoll: -0.22,
    chamberTurn: 0.8,
    contactTurn: -1.35,
    contactWide: 0.05,
    chamberTall: -0.04,
    contactTall: 0.07,
  }),
  uppercut: curve(),
};

/**
 * Everything that is not one of the twenty standing normals: specials, supers,
 * throws, air and crouching buttons, and any id the keyword rules above had to
 * guess at. These keep the smaller, safer travel — a command grab that lunged a
 * tenth of the fighter's height would leave its own hitbox behind.
 */
const GENERIC_MOTION: Readonly<Record<PhotoAttackKind, MotionCurve>> = {
  jab: curve({
    chamberX: -0.015,
    contactX: 0.08,
    contactY: 0.015,
    contactRoll: -0.035,
    contactWide: 0.025,
    contactTall: -0.01,
  }),
  heavy: curve({
    chamberX: -0.07,
    contactX: 0.16,
    chamberY: -0.02,
    contactY: 0.03,
    chamberRoll: 0.09,
    contactRoll: -0.18,
    chamberTurn: 0.5,
    contactTurn: -1,
    contactWide: 0.045,
    chamberTall: -0.02,
    contactTall: 0.01,
  }),
  kick: curve({
    chamberX: -0.055,
    contactX: 0.09,
    chamberY: -0.045,
    contactY: 0.035,
    chamberRoll: 0.035,
    contactRoll: -0.045,
    contactWide: 0.035,
    chamberTall: -0.035,
    contactTall: -0.015,
  }),
  sweep: curve({
    chamberX: -0.055,
    contactX: 0.13,
    chamberY: -0.1,
    contactY: -0.07,
    chamberRoll: 0.055,
    contactRoll: -0.045,
    contactTurn: 0.46,
    contactWide: 0.035,
    chamberTall: -0.035,
    contactTall: -0.015,
  }),
  highKick: curve({
    chamberX: -0.09,
    contactX: 0.12,
    chamberY: -0.06,
    contactY: 0.15,
    chamberRoll: 0.12,
    contactRoll: -0.16,
    chamberTurn: 0.72,
    contactTurn: -1.2,
    contactWide: 0.045,
    chamberTall: -0.025,
    contactTall: 0.035,
  }),
  uppercut: curve(),
};

/**
 * Continuous whole-body motion layered under the authored photo frames.
 * The atlas supplies the silhouette; this supplies anticipation, drive and a
 * visible return so switching drawings never reads as a teleport.
 */
export function photoAttackMotion(
  moveId: string,
  progress: number,
): PhotoAttackMotion {
  const standingNormal = PHOTO_NORMAL_ATTACK_KINDS[moveId.toLowerCase()];
  if (standingNormal !== undefined) {
    return motionFrom(STANDING_NORMAL_MOTION[standingNormal], progress);
  }
  return motionFrom(GENERIC_MOTION[photoAttackKind(moveId)], progress);
}

function kickEnvelope(progress: number): { chamber: number; contact: number } {
  const p = clamp01(progress);
  if (p < 0.34) {
    return { chamber: smooth(p / 0.34), contact: 0 };
  }
  if (p < 0.58) {
    return { chamber: 1, contact: smooth((p - 0.34) / 0.24) };
  }
  const returnAmount = 1 - smooth((p - 0.58) / 0.42);
  return { chamber: returnAmount, contact: returnAmount };
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function smooth(value: number): number {
  return value * value * (3 - 2 * value);
}

function includesAny(value: string, needles: readonly string[]): boolean {
  return needles.some((needle) => value.includes(needle));
}
