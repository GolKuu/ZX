import type { MoveFrameData } from '../../sim/frame-data.js';
import { buildGlitchMoves, hit, present } from './builder.js';
import { GLITCH_LOW_PROFILE, GLITCH_STAND_PROFILE } from './character.js';
import {
  GLITCH_NORMAL_IDS as N,
  GLITCH_SPECIAL_IDS as S,
  GLITCH_UTILITY_IDS as U,
} from './ids.js';
import type { GlitchMoveRow } from './types.js';

const rows: readonly GlitchMoveRow[] = [
  {
    id: N.phaseJab, startup: 5, active: 3, recovery: 8,
    hits: [hit({
      id: 'phase-fist', from: 5, to: 8, box: [0.7, 1.65, 0.31, 0.18],
      level: 'high', damage: 28, hitstun: 15, blockstun: 9,
    })],
    cancels: [{
      from: 5, to: 12,
      into: [N.riftElbow, N.lowVectorSweep, U.launcher, S.teleportStrike],
      limit: 1,
    }],
    presentation: present('phase-jab', 'cyan-pixel-snap', 'phase_wind', 'jab_hit'),
    tags: ['interrupt', 'combo-starter'],
  },
  {
    id: N.riftElbow, startup: 9, active: 4, recovery: 13,
    hits: [hit({
      id: 'rift-elbow', from: 9, to: 13, box: [0.7, 1.42, 0.37, 0.28],
      level: 'mid', damage: 48, hitstun: 19, blockstun: 12,
      knockback: [0.18, 0.02], guardDamage: 13,
    })],
    cancels: [{
      from: 9, to: 16, into: [N.breakpointAxe, U.dualVector, S.phaseBreak],
      limit: 1,
    }],
    presentation: present('rift-elbow', 'violet-body-offset', 'rift_step', 'elbow_hit', 'nudge'),
    tags: ['advancing', 'pushback'],
  },
  {
    id: N.lowVectorSweep, startup: 11, active: 4, recovery: 15,
    hits: [hit({
      id: 'vector-sweep', from: 11, to: 15, box: [0.91, 0.25, 0.5, 0.19],
      level: 'low', damage: 54, hitstun: 24, blockstun: 13,
      knockback: [0.16, 0.08], guardDamage: 16,
    })],
    hurtboxes: [{ from: 7, to: 18, boxes: GLITCH_LOW_PROFILE }],
    cancels: [{ from: 11, to: 17, into: [U.launcher, S.spatialDash], limit: 1 }],
    presentation: present('low-vector-sweep', 'floor-rift', 'vector_low', 'sweep_hit'),
    tags: ['low', 'low-profile'],
  },
  {
    id: N.breakpointAxe, startup: 17, active: 5, recovery: 18,
    hits: [hit({
      id: 'breakpoint-heel', from: 17, to: 22, box: [0.77, 1.5, 0.42, 0.68],
      level: 'overhead', damage: 82, hitstun: 31, blockstun: 17,
      knockback: [0.16, 0.18], guardDamage: 24,
      groundBounce: {
        count: 1, verticalSpeed: 102,
        horizontalScale: { numerator: 1, denominator: 2 }, minimumHitstun: 25,
        counterHitOnly: true,
      },
    })],
    hurtboxes: [{ from: 12, to: 25, boxes: GLITCH_STAND_PROFILE }],
    presentation: present('breakpoint-axe', 'vertical-space-crack', 'rise_cut', 'axe_hit', 'shake'),
    tags: ['overhead', 'counter-ground-bounce', 'punishable'],
  },
  {
    id: N.crouchLight, startup: 5, active: 3, recovery: 9,
    hits: [hit({
      id: 'crouch-palm', from: 5, to: 8, box: [0.55, 0.75, 0.3, 0.2],
      level: 'mid', damage: 25, hitstun: 13, blockstun: 8,
    })],
    hurtboxes: [{ from: 0, to: 17, boxes: GLITCH_LOW_PROFILE }],
    cancels: [{ from: 5, to: 11, into: [N.crouchMedium, U.sweep], limit: 1 }],
    presentation: present('crouch-light', 'short-pixel-cut', 'phase_wind', 'jab_hit'),
    tags: ['crouching', 'starter'],
  },
  {
    id: N.crouchMedium, startup: 8, active: 4, recovery: 12,
    hits: [hit({
      id: 'crouch-knee', from: 8, to: 12, box: [0.68, 0.58, 0.38, 0.27],
      level: 'low', damage: 43, hitstun: 18, blockstun: 11,
    })],
    hurtboxes: [{ from: 0, to: 20, boxes: GLITCH_LOW_PROFILE }],
    cancels: [{ from: 8, to: 15, into: [N.crouchHeavy, U.launcher], limit: 1 }],
    presentation: present('crouch-medium', 'angled-leg-rift', 'vector_low', 'knee_hit'),
    tags: ['crouching', 'low'],
  },
  {
    id: N.crouchHeavy, startup: 13, active: 5, recovery: 18,
    hits: [hit({
      id: 'crouch-break', from: 13, to: 18, box: [0.84, 0.86, 0.48, 0.48],
      level: 'mid', damage: 72, hitstun: 27, blockstun: 15,
      knockback: [0.11, 0.29], guardDamage: 20,
    })],
    hurtboxes: [{ from: 0, to: 22, boxes: GLITCH_LOW_PROFILE }],
    cancels: [{ from: 13, to: 19, into: [S.airShift], limit: 1 }],
    presentation: present('crouch-heavy', 'rising-fragments', 'break_charge', 'heavy_hit', 'nudge'),
    tags: ['crouching', 'launcher'],
  },
];

export const GLITCH_NORMAL_MOVES: readonly MoveFrameData[] = buildGlitchMoves(rows);
