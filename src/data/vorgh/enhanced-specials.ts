import { fixed } from '../../sim/math.js';
import { buildVorgh, type VorghRow } from './builder.js';
import { VORGH_NORMAL_IDS as N, VORGH_SPECIAL_IDS as S } from './ids.js';

const rows: readonly VorghRow[] = [
  {
    id: S.rageSlashEx, name: 'Rage Slash: Rupture', level: 'mid',
    startup: 9, active: 6, recovery: 24, minimumRage: 50, rageCost: 16,
    hits: [{
      ...hit([1.08, 1.38, 0.78, 0.46], 88, 32, 18, [0.3, 0.12], 14),
      wallBounce: {
        count: 1, horizontalSpeed: fixed(0.21),
        verticalSpeed: fixed(0.14), minimumHitstun: 20,
      },
    }],
    cancels: [S.berserkDashEx], tags: ['rage-slash', 'enhanced'],
  },
  {
    id: S.berserkDashEx, name: 'Berserk Dash: Ravage', level: 'mid',
    startup: 11, active: 6, recovery: 29, minimumRage: 50, rageCost: 18,
    hits: [hit([1.2, 1.05, 0.8, 0.5], 94, 33, 19, [0.36, 0.1], 16)],
    armour: { frames: { from: 7, toExclusive: 11 }, hits: 1, damagePercent: 70 },
    cancels: [N.predatorRake], tags: ['dash-trail', 'enhanced'],
  },
  {
    id: S.painCounterEx, name: 'Pain Counter: Reprisal', level: 'mid',
    startup: 4, active: 5, recovery: 26, minimumRage: 25,
    hits: [hit([0.84, 1.28, 0.62, 0.56], 102, 38, 18, [0.34, 0.2], 18)],
    tags: ['counter-burst', 'enhanced'],
  },
  {
    id: S.armourBreakerEx, name: 'Armour Breaker: Sundering', level: 'mid',
    startup: 16, active: 6, recovery: 34, minimumRage: 75, rageCost: 20,
    hits: [{
      ...hit([0.92, 1.18, 0.66, 0.56], 126, 40, 22, [0.42, 0.12], 40),
      guardBreak: true,
    }],
    tags: ['guard-break', 'enhanced'],
  },
  {
    id: S.predatorLeapEx, name: 'Predator Leap: Sky Hunt', level: 'high',
    startup: 14, active: 8, recovery: 29, minimumRage: 50, rageCost: 15,
    hits: [hit([0.82, 1.48, 0.62, 0.7], 103, 35, 19, [0.28, -0.2], 15)],
    cancels: [N.airLight, N.airMedium], tags: ['leap-arc', 'enhanced'],
    displacements: [{
      frame: 6,
      offset: { x: fixed(0.3), y: fixed(0.5) },
      clearVelocity: true,
    }],
  },
  {
    id: S.bloodRoarEx, name: 'Blood Roar: War Cry', level: 'mid',
    startup: 19, active: 8, recovery: 36, minimumRage: 75, rageCost: 22,
    hits: [hit([0.72, 1.3, 1.42, 0.82], 84, 31, 23, [0.46, 0.08], 28)],
    tags: ['roar-wave', 'enhanced'],
  },
];

export const VORGH_ENHANCED_SPECIAL_SPECS = rows.map(buildVorgh);

function hit(
  box: readonly [number, number, number, number],
  damage: number, hitstun: number, blockstun: number,
  push: readonly [number, number], guardDamage: number,
) {
  return {
    box, damage, hitstun, blockstun, push, guardDamage,
    chip: Math.max(2, Math.floor(damage / 12)),
  };
}
