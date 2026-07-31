import type { MoveFrameData } from '../../sim/frame-data.js';
import { buildGlitchMoves, hit, present } from './builder.js';
import { GLITCH_AIR_PROFILE } from './character.js';
import { GLITCH_AIR_IDS as A, GLITCH_SPECIAL_IDS as S } from './ids.js';
import type { GlitchMoveRow } from './types.js';

const airHurt = [{ from: 0, to: 60, boxes: GLITCH_AIR_PROFILE }] as const;
const rows: readonly GlitchMoveRow[] = [
  {
    id: A.light, startup: 5, active: 4, recovery: 8,
    hits: [hit({
      id: 'air-palm', from: 5, to: 9, box: [0.58, 1.1, 0.33, 0.24],
      level: 'high', damage: 27, hitstun: 15, blockstun: 8,
    })],
    hurtboxes: airHurt,
    cancels: [{ from: 5, to: 12, into: [A.medium, A.launcher, S.airShift], limit: 1 }],
    presentation: present('air-light', 'pixel-feather', 'air_cut', 'jab_hit'),
    tags: ['air', 'starter', 'repeat-proration'],
  },
  {
    id: A.medium, startup: 8, active: 5, recovery: 12,
    hits: [hit({
      id: 'air-cross-kick', from: 8, to: 13, box: [0.7, 0.96, 0.42, 0.34],
      level: 'mid', damage: 46, hitstun: 20, blockstun: 11,
      knockback: [0.08, 0.09],
    })],
    hurtboxes: airHurt,
    cancels: [{ from: 8, to: 16, into: [A.heavy, A.launcher, S.airShift], limit: 1 }],
    presentation: present('air-medium', 'cross-rift', 'air_cut', 'kick_hit'),
    tags: ['air', 'route'],
  },
  {
    id: A.heavy, startup: 13, active: 5, recovery: 18,
    hits: [hit({
      id: 'air-heel', from: 13, to: 18, box: [0.74, 0.74, 0.48, 0.48],
      level: 'overhead', damage: 74, hitstun: 27, blockstun: 15,
      knockback: [0.14, -0.24], guardDamage: 20,
    })],
    hurtboxes: airHurt,
    cancels: [{ from: 13, to: 19, into: [A.finisher], limit: 1 }],
    presentation: present('air-heavy', 'downward-tear', 'break_charge', 'heavy_hit', 'nudge'),
    tags: ['air', 'spike', 'repeat-proration'],
  },
  {
    id: A.launcher, startup: 10, active: 4, recovery: 14,
    hits: [hit({
      id: 'aerial-launch', from: 10, to: 14, box: [0.52, 1.52, 0.38, 0.44],
      level: 'mid', damage: 52, hitstun: 25, blockstun: 12,
      knockback: [0.04, 0.32],
    })],
    hurtboxes: airHurt,
    cancels: [{ from: 10, to: 17, into: [A.medium, S.airShift], limit: 1 }],
    presentation: present('aerial-launcher', 'upward-tear', 'rift_step', 'launch_hit'),
    tags: ['air', 'launcher', 'juggle-plus-one'],
  },
  {
    id: A.finisher, startup: 15, active: 5, recovery: 24,
    hits: [hit({
      id: 'air-finisher', from: 15, to: 20, box: [0.65, 0.82, 0.55, 0.5],
      level: 'mid', damage: 88, hitstun: 34,
      knockback: [0.2, -0.3], hitstop: [12, 17],
      groundBounce: {
        count: 1, verticalSpeed: 82,
        horizontalScale: { numerator: 1, denominator: 2 }, minimumHitstun: 25,
      },
    })],
    hurtboxes: airHurt,
    presentation: present('air-finisher', 'shattered-vector', 'finisher_wind', 'finisher_hit', 'shake'),
    tags: ['air', 'finisher', 'ends-route'],
  },
  {
    id: A.throw, startup: 7, active: 3, recovery: 24,
    hits: [hit({
      id: 'air-throw', from: 7, to: 10, box: [0.4, 1.15, 0.3, 0.42],
      level: 'throw', damage: 68, hitstun: 34, knockback: [0.16, -0.28],
    })],
    hurtboxes: airHurt,
    presentation: present('air-throw', 'locked-coordinate', 'grab_phase', 'throw_hit', 'nudge'),
    tags: ['air', 'throw', 'throw-escape-window-7'],
  },
];

export const GLITCH_AIR_MOVES: readonly MoveFrameData[] = buildGlitchMoves(rows);
