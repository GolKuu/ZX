import { fixed } from '../../sim/math.js';
import { buildVorgh, type VorghRow } from './builder.js';
import { VORGH_NORMAL_IDS as N, VORGH_SPECIAL_IDS as S } from './ids.js';

const specials = [S.rageSlash, S.berserkDash, S.armourBreaker];
const rows: readonly VorghRow[] = [
  {
    id: N.predatorRake, name: 'Predator Rake', level: 'high',
    startup: 6, active: 4, recovery: 10, rageGain: 3,
    hits: [hit([0.74, 1.75, 0.46, 0.38], 34, 17, 12, [0.1, 0])],
    cancels: [N.skullRam, N.crouchLight, S.rageSlash], tags: ['claw-arc'],
  },
  {
    id: N.skullRam, name: 'Skull Ram', level: 'mid',
    startup: 9, active: 4, recovery: 14, rageGain: 4,
    hits: [hit([0.73, 1.55, 0.5, 0.38], 52, 23, 15, [0.15, 0])],
    cancels: [N.huntingSweep, S.berserkDash], tags: ['armour-spark'],
  },
  {
    id: N.huntingSweep, name: 'Hunting Sweep', level: 'low',
    startup: 12, active: 5, recovery: 15, rageGain: 5,
    hits: [{
      ...hit([0.98, 0.3, 0.7, 0.22], 61, 28, 17, [0.2, 0.12]),
      groundBounce: {
        count: 1, verticalSpeed: fixed(0.2),
        horizontalScale: { numerator: 2, denominator: 3 }, minimumHitstun: 18,
      },
    }],
    cancels: [S.predatorLeap], tags: ['dust-rake'],
  },
  {
    id: N.risingMaul, name: 'Rising Maul', level: 'mid',
    startup: 16, active: 5, recovery: 18, rageGain: 6,
    hits: [hit([0.52, 1.74, 0.46, 0.78], 72, 31, 18, [0.12, 0.38])],
    cancels: [S.predatorLeap], tags: ['rising-ember'],
  },
  {
    id: N.crouchLight, name: 'Shin Gouge', level: 'low',
    startup: 5, active: 3, recovery: 11, rageGain: 2,
    hits: [hit([0.62, 0.42, 0.4, 0.2], 27, 15, 10, [0.08, 0])],
    cancels: [N.crouchMedium, N.predatorRake], tags: ['claw-short'],
  },
  {
    id: N.crouchMedium, name: 'Rib Tear', level: 'mid',
    startup: 8, active: 4, recovery: 13, rageGain: 3,
    hits: [hit([0.75, 0.8, 0.48, 0.28], 43, 20, 13, [0.12, 0.04])],
    cancels: [N.crouchHeavy, ...specials], tags: ['claw-cross'],
  },
  {
    id: N.crouchHeavy, name: 'Beast Pivot', level: 'low',
    startup: 14, active: 5, recovery: 20, rageGain: 5,
    hits: [hit([0.92, 0.45, 0.66, 0.28], 69, 27, 17, [0.22, 0.18])],
    cancels: [S.bloodRoar], tags: ['dust-heavy'],
  },
  {
    id: N.airLight, name: 'Aerial Talon', level: 'high',
    startup: 5, active: 4, recovery: 9, rageGain: 2,
    hits: [hit([0.66, 1.24, 0.38, 0.32], 29, 16, 10, [0.08, -0.04])],
    cancels: [N.airMedium], tags: ['air-claw'],
  },
  {
    id: N.airMedium, name: 'Falling Knee', level: 'mid',
    startup: 8, active: 5, recovery: 13, rageGain: 3,
    hits: [hit([0.52, 0.82, 0.42, 0.44], 48, 22, 14, [0.14, -0.14])],
    cancels: [N.airHeavy, S.predatorLeap], tags: ['air-knee'],
  },
  {
    id: N.airHeavy, name: 'Meteor Maul', level: 'mid',
    startup: 13, active: 6, recovery: 21, rageGain: 5,
    hits: [hit([0.58, 0.72, 0.55, 0.5], 75, 30, 17, [0.2, -0.25])],
    tags: ['air-impact'],
  },
];

export const VORGH_NORMAL_SPECS = rows.map(buildVorgh);

function hit(
  box: readonly [number, number, number, number],
  damage: number, hitstun: number, blockstun: number,
  push: readonly [number, number],
) {
  return { box, damage, hitstun, blockstun, push, guardDamage: Math.ceil(damage / 7) };
}
