import type { MoveFrameData } from '../../sim/frame-data.js';
import { buildGlitchMoves, displacement, hit, present } from './builder.js';
import { GLITCH_AIR_PROFILE, GLITCH_STAND_PROFILE } from './character.js';
import { GLITCH_AIR_IDS as A, GLITCH_SPECIAL_IDS as S } from './ids.js';
import type { GlitchMoveRow } from './types.js';

const rows: readonly GlitchMoveRow[] = [
  /**
   * 540 kick — J + I.
   *
   * Glitch hops, turns a full turn and a half in the air and lands the heel on
   * the way round. Two hits, because that is what makes a spin read as a spin:
   * the first catches on the rise and pops the opponent up a little, the second
   * arrives out of the rotation and puts them on the floor. One hit and the
   * whole move would look like a long, slow roundhouse.
   *
   * Priced as a commitment. Twelve frames of startup is slow for a chord, and
   * twenty-two of recovery is a full punish if it is blocked — the payoff is the
   * knockdown and the route out of the second hit.
   */
  {
    id: S.fiveFortyKick, startup: 12, active: 15, recovery: 22,
    hits: [
      hit({
        id: '540-rise', from: 12, to: 17, box: [0.66, 1.52, 0.46, 0.42],
        level: 'mid', damage: 44, hitstun: 26, blockstun: 13,
        knockback: [0.06, 0.24], guardDamage: 16,
      }),
      hit({
        id: '540-heel', from: 21, to: 27, box: [0.88, 1.16, 0.56, 0.5],
        level: 'mid', damage: 74, hitstun: 34, blockstun: 17,
        knockback: [0.26, 0.2], hitstop: [10, 15], chip: 6, guardDamage: 28,
      }),
    ],
    hurtboxes: [
      { from: 0, to: 10, boxes: GLITCH_STAND_PROFILE },
      // Airborne through the spin: the legs leave the ground, so a sweep no
      // longer catches them. This is the move's defensive reward.
      { from: 10, to: 30, boxes: GLITCH_AIR_PROFILE },
      { from: 30, to: 49, boxes: GLITCH_STAND_PROFILE },
    ],
    cancels: [{ from: 21, to: 30, into: [A.medium, S.airShift, S.teleportStrike], limit: 1 }],
    displacements: [displacement(10, 0.72), displacement(20, 0.48)],
    presentation: present('540-kick', 'spiral-space-trail', 'spin_wind', 'launch_hit', 'shake'),
    tags: ['special', 'chord', 'spin', 'airborne-10', 'knockdown', 'punish-recovery-22'],
  },
  {
    id: S.riftUppercut, startup: 8, active: 6, recovery: 25,
    hits: [hit({
      id: 'rift-uppercut', from: 8, to: 14, box: [0.42, 1.88, 0.38, 0.58],
      level: 'mid', damage: 76, hitstun: 32, blockstun: 15,
      knockback: [0.1, 0.4], guardDamage: 22,
    })],
    hurtboxes: [
      { from: 4, to: 10, boxes: [[0, 0.55, 0.25, 0.48]] },
      { from: 10, to: 39, boxes: GLITCH_AIR_PROFILE },
    ],
    cancels: [{ from: 8, to: 15, into: [A.light, S.airShift], limit: 1 }],
    presentation: present('rift-uppercut', 'vertical-reality-rip', 'uppercut_wind', 'launch_hit', 'shake'),
    tags: ['special', 'anti-air', 'upper-invulnerable', 'punish-recovery-25'],
  },
  {
    id: S.phaseBreak, startup: 14, active: 5, recovery: 20,
    hits: [hit({
      id: 'phase-break', from: 14, to: 19, box: [0.92, 1.2, 0.54, 0.48],
      level: 'overhead', damage: 84, hitstun: 30, blockstun: 16,
      knockback: [0.22, 0.12], chip: 5, guardDamage: 26,
    })],
    hurtboxes: [{ from: 0, to: 39, boxes: GLITCH_STAND_PROFILE }],
    presentation: present('phase-break', 'white-violet-cleave', 'break_charge', 'heavy_hit', 'shake'),
    tags: ['special', 'overhead', 'guard-pressure', 'punishable'],
  },
  {
    id: S.realitySlice, startup: 18, active: 7, recovery: 24,
    hits: [hit({
      id: 'reality-slice', from: 18, to: 25, box: [1.36, 1.08, 0.92, 0.28],
      level: 'mid', damage: 73, hitstun: 28, blockstun: 16,
      knockback: [0.2, 0.06], chip: 7, guardDamage: 23,
    })],
    presentation: present('reality-slice', 'horizontal-space-wave', 'slice_charge', 'slice_hit', 'nudge'),
    tags: ['special', 'range', 'projectile-like', 'punishable'],
  },
  {
    id: S.teleportStrike, startup: 10, active: 4, recovery: 19,
    hits: [hit({
      id: 'teleport-strike', from: 10, to: 14, box: [0.62, 1.48, 0.42, 0.34],
      level: 'mid', damage: 66, hitstun: 24, blockstun: 13,
      knockback: [-0.12, 0.08], guardDamage: 18,
    })],
    hurtboxes: [
      { from: 0, to: 6, boxes: GLITCH_STAND_PROFILE },
      { from: 6, to: 9, boxes: [] },
      { from: 9, to: 33, boxes: GLITCH_STAND_PROFILE },
    ],
    displacements: [displacement(8, 1.34)],
    presentation: present('teleport-strike', 'cross-up-body-split', 'teleport_warn', 'teleport_hit', 'nudge'),
    tags: ['special', 'teleport', 'side-switch-at-close-range', 'cooldown-52', 'punish-recovery-19'],
  },
  {
    id: S.exRiftUppercut, startup: 6, active: 7, recovery: 21, meterCost: 25,
    hits: [hit({
      id: 'ex-rift-uppercut', from: 6, to: 13, box: [0.45, 1.94, 0.42, 0.62],
      level: 'mid', damage: 96, hitstun: 36, blockstun: 16,
      knockback: [0.08, 0.46], hitstop: [12, 17], chip: 5, guardDamage: 27,
    })],
    hurtboxes: [{ from: 2, to: 9, boxes: [] }, { from: 9, to: 34, boxes: GLITCH_AIR_PROFILE }],
    cancels: [{ from: 6, to: 14, into: [A.medium, S.airShift], limit: 1 }],
    presentation: present('ex-rift-uppercut', 'double-vertical-rip', 'ex_flash', 'ex_launch', 'shake'),
    tags: ['enhanced', 'meter-25', 'invulnerable-7', 'punishable'],
  },
  {
    id: S.exPhaseBreak, startup: 11, active: 6, recovery: 17, meterCost: 25,
    hits: [hit({
      id: 'ex-phase-break', from: 11, to: 17, box: [1.0, 1.22, 0.6, 0.54],
      level: 'overhead', damage: 104, hitstun: 35, blockstun: 18,
      knockback: [0.25, 0.18], chip: 9, guardDamage: 34,
    })],
    presentation: present('ex-phase-break', 'triple-white-cleave', 'ex_flash', 'ex_break', 'shake'),
    tags: ['enhanced', 'meter-25', 'overhead', 'guard-pressure'],
  },
  {
    id: S.exRealitySlice, startup: 14, active: 10, recovery: 20, meterCost: 25,
    hits: [hit({
      id: 'ex-reality-slice', from: 14, to: 24, box: [1.55, 1.1, 1.12, 0.34],
      level: 'mid', damage: 94, hitstun: 33, blockstun: 18,
      knockback: [0.25, 0.08], chip: 11, guardDamage: 30,
    })],
    presentation: present('ex-reality-slice', 'layered-space-wave', 'ex_flash', 'ex_slice', 'shake'),
    tags: ['enhanced', 'meter-25', 'range', 'chip'],
  },
  {
    id: S.exTeleportStrike, startup: 8, active: 5, recovery: 16, meterCost: 25,
    hits: [hit({
      id: 'ex-teleport-strike', from: 8, to: 13, box: [0.68, 1.46, 0.46, 0.38],
      level: 'mid', damage: 89, hitstun: 31, blockstun: 15,
      knockback: [-0.16, 0.14], chip: 4, guardDamage: 25,
    })],
    hurtboxes: [{ from: 3, to: 7, boxes: [] }, { from: 7, to: 29, boxes: GLITCH_STAND_PROFILE }],
    displacements: [displacement(6, 1.55)],
    presentation: present('ex-teleport-strike', 'violet-cross-up-burst', 'ex_teleport', 'ex_impact', 'freeze'),
    tags: ['enhanced', 'meter-25', 'teleport', 'side-switch', 'cooldown-38', 'punish-recovery-16'],
  },
];

export const GLITCH_SPECIAL_MOVES: readonly MoveFrameData[] = buildGlitchMoves(rows);
