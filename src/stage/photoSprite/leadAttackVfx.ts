export type PhotoFighterKind = 'glitch' | 'lucky' | 'mim' | 'titan' | 'vorgh';
export type LeadAttackVfxKind = 'jab' | 'kick' | 'sweep';

export interface LeadAttackPalette {
  readonly core: string;
  readonly edge: string;
  readonly ember: string;
}

export interface LeadAttackVfxState {
  readonly kind: LeadAttackVfxKind;
  readonly x: number;
  readonly y: number;
  readonly rotation: number;
  readonly intensity: number;
  readonly travel: number;
}

const J_ATTACKS = new Set([
  'mim.jab',
  'glitch.phase-jab',
  'lucky.quick-draw',
  'titan.normal.piston-hammer',
  'vorgh.normal.predator-rake',
]);

const I_KICKS = new Set([
  'mim.capoeira',
  'titan.normal.seismic-stomp',
]);

const I_SWEEPS = new Set([
  'glitch.low-vector-sweep',
  'lucky.sliding-bet',
  'vorgh.normal.hunting-sweep',
]);

export const LEAD_ATTACK_PALETTES: Readonly<Record<PhotoFighterKind, LeadAttackPalette>> = {
  mim: { core: '#fff2c7', edge: '#ff4938', ember: '#8c161f' },
  glitch: { core: '#e9ffff', edge: '#3af2ff', ember: '#d84dff' },
  lucky: { core: '#fffbd0', edge: '#ffc52f', ember: '#38e79a' },
  titan: { core: '#fff4df', edge: '#ff8b2c', ember: '#7fdcff' },
  vorgh: { core: '#ffe9ec', edge: '#ff365f', ember: '#9d49ff' },
};

/** Identifies exactly the J and I standing normals shared by the whole roster. */
export function leadAttackVfxKind(moveId: string): LeadAttackVfxKind | null {
  if (J_ATTACKS.has(moveId)) return 'jab';
  if (I_KICKS.has(moveId)) return 'kick';
  if (I_SWEEPS.has(moveId)) return 'sweep';
  return null;
}

/**
 * A short authored envelope for the procedural trail. It peaks on the contact
 * drawing and disappears before recovery finishes, so it accents the limb
 * instead of hiding the fighter behind a permanent glow.
 */
export function leadAttackVfxState(
  moveId: string,
  progress: number,
): LeadAttackVfxState | null {
  const kind = leadAttackVfxKind(moveId);
  if (kind === null) return null;
  const p = Math.max(0, Math.min(1, progress));
  if (p < 0.12 || p > 0.88) return null;

  const contact = smooth(clamp01((p - 0.2) / 0.34));
  const release = 1 - smooth(clamp01((p - 0.58) / 0.3));
  const intensity = Math.sin(clamp01((p - 0.12) / 0.76) * Math.PI) * release;

  if (kind === 'jab') {
    return {
      kind,
      x: 0.34 + contact * 0.62,
      y: 1.48 + Math.sin(contact * Math.PI) * 0.045,
      rotation: -0.06 - contact * 0.08,
      intensity,
      travel: contact,
    };
  }

  const sweep = kind === 'sweep';
  return {
    kind,
    x: 0.26 + contact * 0.7,
    y: (sweep ? 0.42 : 0.58) + Math.sin(contact * Math.PI) * (sweep ? 0.05 : 0.1),
    rotation: (sweep ? -0.82 : -0.55) + contact * (sweep ? 0.28 : 0.18),
    intensity,
    travel: contact,
  };
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function smooth(value: number): number {
  return value * value * (3 - 2 * value);
}
