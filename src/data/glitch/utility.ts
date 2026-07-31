import type { MoveFrameData } from '../../sim/frame-data.js';
import { buildGlitchMoves, hit, present } from './builder.js';
import { GLITCH_AIR_PROFILE, GLITCH_LOW_PROFILE } from './character.js';
import {
  GLITCH_AIR_IDS as A,
  GLITCH_SPECIAL_IDS as S,
  GLITCH_UTILITY_IDS as U,
} from './ids.js';
import type { GlitchMoveRow } from './types.js';

const rows: readonly GlitchMoveRow[] = [
  {
    id: U.launcher, startup: 9, active: 4, recovery: 16,
    hits: [hit({
      id: 'vector-launch', from: 9, to: 13, box: [0.48, 1.72, 0.34, 0.48],
      level: 'mid', damage: 55, hitstun: 29, blockstun: 13,
      knockback: [0.06, 0.36],
    })],
    hurtboxes: [{ from: 7, to: 15, boxes: GLITCH_AIR_PROFILE }],
    cancels: [{ from: 9, to: 16, into: [A.light, A.launcher, S.airShift], limit: 1 }],
    presentation: present('vector-launcher', 'vertical-cyan-slit', 'rift_step', 'launch_hit'),
    tags: ['launcher', 'air-route'],
  },
  {
    id: U.sweep, startup: 12, active: 4, recovery: 20,
    hits: [hit({
      id: 'hard-sweep', from: 12, to: 16, box: [0.96, 0.22, 0.52, 0.18],
      level: 'low', damage: 61, hitstun: 33, blockstun: 14,
      knockback: [0.17, 0.15], guardDamage: 18,
      groundBounce: {
        count: 1, verticalSpeed: 70,
        horizontalScale: { numerator: 1, denominator: 4 }, minimumHitstun: 24,
      },
    })],
    hurtboxes: [{ from: 8, to: 20, boxes: GLITCH_LOW_PROFILE }],
    presentation: present('hard-sweep', 'floor-vector', 'vector_low', 'sweep_hit'),
    tags: ['low', 'knockdown', 'punishable'],
  },
  {
    id: U.antiAir, startup: 7, active: 5, recovery: 23,
    hits: [hit({
      id: 'anti-air-rift', from: 7, to: 12, box: [0.38, 2.0, 0.35, 0.5],
      level: 'mid', damage: 63, hitstun: 29, blockstun: 14,
      knockback: [0.08, 0.34],
    })],
    hurtboxes: [
      { from: 4, to: 10, boxes: [[0, 0.54, 0.26, 0.48]] },
      { from: 10, to: 35, boxes: GLITCH_LOW_PROFILE },
    ],
    cancels: [{ from: 7, to: 14, into: [A.light, S.airShift], limit: 1 }],
    presentation: present('rift-anti-air', 'rising-violet-crack', 'uppercut_wind', 'launch_hit'),
    tags: ['anti-air', 'upper-invulnerable', 'landing-punish'],
  },
  {
    id: U.throw, startup: 6, active: 3, recovery: 22,
    hits: [hit({
      id: 'coordinate-throw', from: 6, to: 9, box: [0.46, 1.25, 0.3, 0.44],
      level: 'throw', damage: 72, hitstun: 40, knockback: [-0.18, 0.2],
    })],
    grapple: { kind: 'normal', pairedFrames: 26, targetSize: 'grounded' },
    presentation: present('coordinate-throw', 'coordinate-lock', 'grab_phase', 'throw_hit', 'nudge'),
    tags: ['throw', 'side-switch', 'throw-escape-window-6'],
  },
  {
    id: U.throwEscape, startup: 0, active: 8, recovery: 14,
    counter: {
      frames: { from: 0, toExclusive: 8 },
      into: U.throwEscapeRelease,
      attackerHitstop: 9,
      grappleOnly: true,
    },
    presentation: present('throw-escape', 'local-rift-release', 'guard_phase', 'throw_escape'),
    tags: ['defense', 'throw-escape', 'readable-whiff'],
  },
  {
    id: U.throwEscapeRelease, startup: 0, active: 1, recovery: 13,
    presentation: present('throw-escape-release', 'local-rift-release', 'throw_escape', 'phase_release'),
    tags: ['defense', 'throw-escape', 'recovery'],
  },
  {
    id: U.dualPhase, startup: 8, active: 5, recovery: 14,
    hits: [hit({
      id: 'dual-phase', from: 8, to: 13, box: [0.73, 1.42, 0.4, 0.32],
      level: 'mid', damage: 51, hitstun: 21, blockstun: 12,
    })],
    cancels: [{ from: 8, to: 16, into: [S.teleportStrike, U.dualVector], limit: 1 }],
    presentation: present('dual-phase', 'split-limb-afterimage', 'dual_phase', 'elbow_hit'),
    tags: ['dual-technique', 'route'],
  },
  {
    id: U.dualVector, startup: 12, active: 6, recovery: 17,
    hits: [
      hit({
        id: 'vector-one', from: 12, to: 14, box: [0.62, 1.62, 0.34, 0.22],
        level: 'high', damage: 28, hitstun: 15, blockstun: 10,
      }),
      hit({
        id: 'vector-two', from: 16, to: 18, box: [0.82, 0.68, 0.44, 0.3],
        level: 'low', damage: 38, hitstun: 22, blockstun: 13,
      }),
    ],
    cancels: [{ from: 16, to: 21, into: [S.realitySlice], limit: 1 }],
    presentation: present('dual-vector', 'crossed-space-trails', 'dual_phase', 'kick_hit'),
    tags: ['dual-technique', 'high-low'],
  },
];

export const GLITCH_UTILITY_MOVES: readonly MoveFrameData[] = buildGlitchMoves(rows);
