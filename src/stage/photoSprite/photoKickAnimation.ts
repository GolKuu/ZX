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
  readonly scaleX: number;
  readonly scaleY: number;
}

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
 * Continuous whole-body motion layered under the authored photo frames.
 * The atlas supplies the silhouette; this supplies anticipation, drive and a
 * visible return so switching drawings never reads as a teleport.
 */
export function photoAttackMotion(
  moveId: string,
  progress: number,
): PhotoAttackMotion {
  const kind = photoAttackKind(moveId);
  if (kind === 'jab') return leadHandMotion(progress);
  if (kind === 'heavy') return rearHandMotion(progress);
  if (kind === 'highKick') return rearLegMotion(progress);
  if (kind !== 'kick' && kind !== 'sweep') {
    return neutralMotion();
  }
  const { chamber, contact } = kickEnvelope(progress);
  const low = kind === 'sweep';
  return {
    x: -chamber * 0.055 + contact * (low ? 0.13 : 0.09),
    y: chamber * (low ? -0.1 : -0.045) + contact * (low ? -0.07 : 0.035),
    rotation: chamber * (low ? 0.055 : 0.035) - contact * 0.045,
    scaleX: 1 + contact * 0.035,
    scaleY: 1 - chamber * 0.035 - contact * 0.015,
  };
}

/** J snaps the lead hand out with almost no body coil. */
function leadHandMotion(progress: number): PhotoAttackMotion {
  const { chamber, contact } = kickEnvelope(progress);
  return {
    x: -chamber * 0.015 + contact * 0.08,
    y: contact * 0.015,
    rotation: -contact * 0.035,
    scaleX: 1 + contact * 0.025,
    scaleY: 1 - contact * 0.01,
  };
}

/**
 * K comes from the rear shoulder: coil away, turn the hips through the target,
 * then recover. The atlas supplies the rear-hand contact silhouette while this
 * motion makes the weight transfer readable instead of looking like a second J.
 */
function rearHandMotion(progress: number): PhotoAttackMotion {
  const { chamber, contact } = kickEnvelope(progress);
  return {
    x: -chamber * 0.07 + contact * 0.16,
    y: -chamber * 0.02 + contact * 0.03,
    rotation: chamber * 0.09 - contact * 0.18,
    scaleX: 1 + contact * 0.045,
    scaleY: 1 - chamber * 0.02 + contact * 0.01,
  };
}

/**
 * L lifts the rear knee from behind the stance, turns the hip over and sends
 * that leg past the lead side. Its deeper coil and higher contact travel keep
 * it visibly separate from I's lead-leg kick.
 */
function rearLegMotion(progress: number): PhotoAttackMotion {
  const { chamber, contact } = kickEnvelope(progress);
  return {
    x: -chamber * 0.09 + contact * 0.12,
    y: -chamber * 0.06 + contact * 0.15,
    rotation: chamber * 0.12 - contact * 0.16,
    scaleX: 1 + contact * 0.045,
    scaleY: 1 - chamber * 0.025 + contact * 0.035,
  };
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

function neutralMotion(): PhotoAttackMotion {
  return { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 };
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
