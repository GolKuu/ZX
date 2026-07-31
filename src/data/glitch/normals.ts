import type { MoveFrameData } from '../../sim/frame-data.js';
import { buildGlitchMoves, displacement, hit, present } from './builder.js';
import { GLITCH_LOW_PROFILE, GLITCH_STAND_PROFILE } from './character.js';
import {
  GLITCH_NORMAL_IDS as N,
  GLITCH_SPECIAL_IDS as S,
  GLITCH_UTILITY_IDS as U,
} from './ids.js';
import type { GlitchMoveRow } from './types.js';

const rows: readonly GlitchMoveRow[] = [
  {
    id: N.phaseJab, startup: 4, active: 2, recovery: 9,
    hits: [hit({
      id: 'checksum-needle', from: 4, to: 6, box: [0.82, 1.7, 0.38, 0.12],
      level: 'high', damage: 26, hitstun: 14, blockstun: 9,
    })],
    cancels: [{
      from: 4, to: 11,
      into: [N.riftElbow, N.lowVectorSweep, U.launcher, S.teleportStrike],
      limit: 1,
    }],
    presentation: present('checksum-needle', 'ice-hash-streak', 'phase_wind', 'jab_hit'),
    tags: ['interrupt', 'combo-starter'],
  },
  {
    id: N.riftElbow, startup: 10, active: 5, recovery: 14,
    hits: [hit({
      id: 'rollback-ram', from: 10, to: 15, box: [0.78, 1.36, 0.43, 0.3],
      level: 'mid', damage: 54, hitstun: 21, blockstun: 13,
      knockback: [0.2, 0.03], guardDamage: 15,
    })],
    displacements: [displacement(8, 0.16, 0, false)],
    cancels: [{
      from: 10, to: 18,
      into: [N.breakpointAxe, U.launcher, U.dualVector, S.phaseBreak],
      limit: 1,
    }],
    presentation: present('rollback-ram', 'amber-frame-echo', 'rift_step', 'elbow_hit', 'nudge'),
    tags: ['advancing', 'pushback'],
  },
  {
    id: N.lowVectorSweep, startup: 13, active: 5, recovery: 16,
    hits: [hit({
      id: 'packet-scythe', from: 13, to: 18, box: [1.02, 0.28, 0.56, 0.2],
      level: 'low', damage: 64, hitstun: 26, blockstun: 14,
      knockback: [0.19, 0.1], guardDamage: 18,
    })],
    hurtboxes: [{ from: 8, to: 21, boxes: GLITCH_LOW_PROFILE }],
    cancels: [{ from: 13, to: 20, into: [U.launcher, S.spatialDash], limit: 1 }],
    presentation: present('packet-scythe', 'floor-checksum-arc', 'vector_low', 'sweep_hit'),
    tags: ['low', 'low-profile'],
  },
  {
    id: N.breakpointAxe, startup: 19, active: 4, recovery: 21,
    hits: [hit({
      id: 'kernel-drop', from: 19, to: 23, box: [0.8, 1.42, 0.44, 0.72],
      level: 'overhead', damage: 94, hitstun: 34, blockstun: 18,
      knockback: [0.18, 0.22], guardDamage: 27,
      groundBounce: {
        count: 1, verticalSpeed: 102,
        horizontalScale: { numerator: 1, denominator: 2 }, minimumHitstun: 25,
        counterHitOnly: true,
      },
    })],
    hurtboxes: [{ from: 14, to: 28, boxes: GLITCH_STAND_PROFILE }],
    presentation: present('kernel-drop', 'amber-kernel-fracture', 'rise_cut', 'axe_hit', 'shake'),
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
