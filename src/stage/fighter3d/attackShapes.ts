import type { AttackShape } from './attackPose';

/**
 * Move id → body shape.
 *
 * Explicit rows first, keyword inference second. The inference is what keeps a
 * roster of roughly two hundred moves animated without two hundred rows, and
 * the explicit table is what stops it guessing wrong on the moves that matter —
 * a signature special miscategorised as a jab is far more visible than a filler
 * normal being approximately right.
 */
const EXPLICIT: Readonly<Record<string, AttackShape>> = {
  'glitch.540-kick': 'spin540',
  'mim.dual.vault-knee': 'spin540',
  'glitch.phase-jab': 'jab',
  'glitch.rift-elbow': 'hook',
  'glitch.low-vector-sweep': 'lowSweep',
  'glitch.breakpoint-axe': 'slam',
  'glitch.rift-uppercut': 'uppercut',
  'glitch.ex.rift-uppercut': 'uppercut',
  'glitch.phase-break': 'slam',
  'glitch.reality-slice': 'straight',
  'glitch.teleport-strike': 'straight',
  'titan.special.ground-slam': 'slam',
  'titan.super.continental-slam': 'slam',
  'vorgh.special.predator-leap': 'highKick',
  'vorgh.special.rage-slash': 'hook',
};

const KEYWORDS: readonly (readonly [string, AttackShape])[] = [
  ['540', 'spin540'],
  ['spin', 'spin540'],
  ['sweep', 'lowSweep'],
  ['low', 'lowSweep'],
  ['uppercut', 'uppercut'],
  ['anti-air', 'uppercut'],
  ['launcher', 'uppercut'],
  ['slam', 'slam'],
  ['axe', 'slam'],
  ['stomp', 'slam'],
  ['heel', 'highKick'],
  ['roundhouse', 'highKick'],
  ['capoeira', 'highKick'],
  ['kick', 'frontKick'],
  ['knee', 'frontKick'],
  ['elbow', 'hook'],
  ['hook', 'hook'],
  ['maul', 'hook'],
  ['claw', 'hook'],
  ['slash', 'hook'],
  ['jab', 'jab'],
  ['light', 'jab'],
  ['fang', 'jab'],
];

export function attackShapeFor(moveId: string): AttackShape {
  const id = moveId.toLowerCase();
  const explicit = EXPLICIT[id];
  if (explicit !== undefined) return explicit;
  for (const [keyword, shape] of KEYWORDS) {
    if (id.includes(keyword)) return shape;
  }
  return 'straight';
}
