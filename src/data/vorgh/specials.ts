import { fixed } from '../../sim/math.js';
import { buildVorgh, type VorghRow } from './builder.js';
import { VORGH_NORMAL_IDS as N, VORGH_SPECIAL_IDS as S } from './ids.js';

const rows: readonly VorghRow[] = [
  {
    id: S.rageSlash, name: 'Rage Slash', level: 'mid',
    startup: 11, active: 5, recovery: 20, rageGain: 5,
    hits: [strike([0.95, 1.35, 0.66, 0.42], 68, 27, 16, [0.22, 0.06], 8)],
    cancels: [S.berserkDash], tags: ['rage-slash'],
  },
  {
    id: S.berserkDash, name: 'Berserk Dash', level: 'mid',
    startup: 14, active: 5, recovery: 24, rageGain: 5,
    hits: [strike([1.12, 1.08, 0.72, 0.46], 74, 29, 17, [0.3, 0.06], 10)],
    armour: { frames: { from: 8, toExclusive: 13 }, hits: 1, damagePercent: 75 },
    tags: ['dash-trail'],
  },
  {
    id: S.painCounter, name: 'Pain Counter', level: 'mid',
    startup: 5, active: 18, recovery: 27, rageGain: 8,
    hits: [], counter: {
      frames: { from: 5, toExclusive: 15 },
      into: S.painCounterEx, attackerHitstop: 12,
    },
    tags: ['counter-stance'],
  },
  {
    id: S.armourBreaker, name: 'Armour Breaker', level: 'mid',
    startup: 18, active: 5, recovery: 28, rageGain: 6,
    hits: [{
      ...strike([0.82, 1.18, 0.58, 0.5], 96, 34, 20, [0.34, 0.08], 28),
      guardBreak: true,
    }],
    tags: ['guard-break'],
  },
  {
    id: S.predatorLeap, name: 'Predator Leap', level: 'high',
    startup: 17, active: 7, recovery: 24, rageGain: 5,
    hits: [strike([0.72, 1.4, 0.54, 0.6], 80, 31, 18, [0.22, -0.16], 12)],
    cancels: [N.airLight, N.airMedium], tags: ['leap-arc'],
    displacements: [{
      frame: 7,
      offset: { x: fixed(0.22), y: fixed(0.42) },
      clearVelocity: true,
    }],
  },
  {
    id: S.bloodRoar, name: 'Blood Roar', level: 'mid',
    startup: 22, active: 7, recovery: 30, rageGain: 10,
    hits: [strike([0.65, 1.3, 1.18, 0.7], 58, 25, 20, [0.36, 0.06], 18)],
    tags: ['roar-wave'],
  },
];

export const VORGH_SPECIAL_SPECS = rows.map(buildVorgh);

function strike(
  box: readonly [number, number, number, number],
  damage: number, hitstun: number, blockstun: number,
  push: readonly [number, number], guardDamage: number,
) {
  return {
    box, damage, hitstun, blockstun, push, guardDamage,
    chip: Math.max(1, Math.floor(damage / 14)),
  };
}

export const VORGH_RAGE_SLASH_WALL_BOUNCE = {
  count: 1,
  horizontalSpeed: fixed(0.2),
  verticalSpeed: fixed(0.14),
  minimumHitstun: 18,
} as const;
