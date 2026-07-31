import { fixed } from '../../sim/math.js';
import { buildVorgh, type VorghRow } from './builder.js';
import { VORGH_SUPER_IDS as U } from './ids.js';

const rows: readonly VorghRow[] = [
  dominion(U.savageDominion, 'Savage Dominion', 18, 152, 0, 34),
  dominion(U.savageDominionMedium, 'Savage Dominion: Blooded', 16, 186, 50, 42),
  dominion(U.savageDominionHigh, 'Savage Dominion: Apex', 14, 224, 75, 54),
  {
    id: U.unchained, name: 'Unchained', level: 'mid',
    startup: 12, active: 6, recovery: 18, minimumRage: 50, rageCost: 35,
    hits: [], tags: ['super', 'unchained-aura'],
  },
  {
    id: U.lastBeast, name: 'Last Beast', level: 'unblockable',
    startup: 16, active: 5, recovery: 28, minimumRage: 80, rageCost: 80,
    hits: [{
      box: [0.86, 1.25, 0.66, 0.64], damage: 38, hitstun: 54,
      hitstop: [16, 22], push: [0.08, 0.05],
    }],
    followUp: U.lastBeastSequence, tags: ['super', 'ultimate-confirm'],
  },
  {
    id: U.lastBeastSequence, name: 'Last Beast: Devour the Night',
    level: 'unblockable', startup: 4, active: 58, recovery: 72,
    minimumRage: 0,
    hits: [
      multi('rake', 4, 8, [0.7, 1.62, 0.56, 0.34], 54, [0.12, 0]),
      multi('ram', 15, 19, [0.66, 1.28, 0.52, 0.48], 68, [0.18, 0.08]),
      multi('sweep', 27, 31, [0.92, 0.38, 0.68, 0.24], 66, [0.22, 0.16]),
      {
        ...multi('maul', 42, 47, [0.72, 1.45, 0.62, 0.66], 118, [0.44, 0.3]),
        wallBounce: {
          count: 1, horizontalSpeed: fixed(0.3),
          verticalSpeed: fixed(0.2), minimumHitstun: 48,
        },
      },
    ],
    tags: ['super', 'ultimate-beast'],
  },
];

export const VORGH_SUPER_SPECS = rows.map(buildVorgh);
export const VORGH_SUPER_COST = 34;

export function vorghSuperCostForMove(moveId: string): number | null {
  return (
    moveId === U.savageDominion
    || moveId === U.savageDominionMedium
    || moveId === U.savageDominionHigh
    || moveId === U.unchained
  ) ? VORGH_SUPER_COST : null;
}

function dominion(
  id: string, name: string, startup: number, damage: number,
  minimumRage: number, rageCost: number,
): VorghRow {
  return {
    id, name, level: 'mid', startup, active: 18, recovery: 38,
    minimumRage, rageCost,
    hits: [
      multi('opening', startup, startup + 4, [0.75, 1.55, 0.55, 0.38], Math.floor(damage * 0.28), [0.1, 0]),
      multi('cross', startup + 7, startup + 11, [0.86, 1.15, 0.64, 0.44], Math.floor(damage * 0.3), [0.16, 0.08]),
      multi('finish', startup + 14, startup + 18, [0.94, 1.35, 0.72, 0.58], Math.ceil(damage * 0.42), [0.36, 0.2]),
    ],
    tags: ['super', 'dominion'],
  };
}

function multi(
  id: string, from: number, to: number,
  box: readonly [number, number, number, number],
  damage: number, push: readonly [number, number],
) {
  return { id, from, to, box, damage, hitstun: 34, hitstop: [10, 14] as const, push };
}
