import { fixed } from '../../sim/math.js';
import { buildVorgh, type VorghRow } from './builder.js';
import { VORGH_SPECIAL_IDS as S, VORGH_TECHNIQUE_IDS as T } from './ids.js';

const rows: readonly VorghRow[] = [
  {
    id: T.throw, name: 'Hunter Clamp', level: 'throw',
    startup: 6, active: 2, recovery: 24,
    hits: [hit([0.48, 1.25, 0.34, 0.56], 78, 26, [0.22, 0.16])],
    rageGain: 4, tags: ['throw'],
    grapple: { kind: 'normal', pairedFrames: 26, targetSize: 'grounded' },
  },
  {
    id: T.airThrow, name: 'Carrion Drop', level: 'throw',
    startup: 7, active: 3, recovery: 26,
    hits: [hit([0.38, 1.45, 0.4, 0.46], 88, 32, [0.16, -0.3])],
    rageGain: 5, tags: ['air-throw'],
    grapple: { kind: 'air', pairedFrames: 32, targetSize: 'airborne' },
  },
  {
    id: T.dualFang, name: 'Dual Technique: Fang Chain', level: 'mid',
    startup: 8, active: 8, recovery: 16,
    hits: [
      { ...hit([0.68, 1.52, 0.45, 0.3], 30, 16, [0.08, 0], 12), from: 8, to: 11 },
      { ...hit([0.83, 1.12, 0.5, 0.36], 38, 22, [0.16, 0.1], 14), id: 'second', from: 13, to: 16 },
    ],
    rageGain: 6, cancels: [S.rageSlash], tags: ['dual-claw'],
  },
  {
    id: T.dualRend, name: 'Dual Technique: Rend Step', level: 'low',
    startup: 11, active: 5, recovery: 18,
    hits: [hit([0.94, 0.5, 0.62, 0.24], 65, 27, [0.24, 0.08], 15)],
    rageGain: 6, cancels: [S.berserkDash], tags: ['dual-rend'],
  },
  {
    id: T.dualBreak, name: 'Dual Technique: Bone Gate', level: 'mid',
    startup: 15, active: 5, recovery: 22,
    hits: [{
      ...hit([0.7, 1.28, 0.52, 0.55], 82, 34, [0.28, 0.2], 18),
      wallBounce: {
        count: 1, horizontalSpeed: fixed(0.22),
        verticalSpeed: fixed(0.16), minimumHitstun: 22,
      },
    }],
    rageGain: 7, tags: ['dual-break'],
  },
];

export const VORGH_TECHNIQUE_SPECS = rows.map(buildVorgh);

function hit(
  box: readonly [number, number, number, number],
  damage: number, hitstun: number, push: readonly [number, number],
  blockstun?: number,
) {
  return { box, damage, hitstun, push, blockstun, hitstop: [9, 12] as const };
}
