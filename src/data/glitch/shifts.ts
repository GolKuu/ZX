import type { MoveFrameData } from '../../sim/frame-data.js';
import { buildGlitchMoves, displacement, present } from './builder.js';
import { GLITCH_AIR_PROFILE, GLITCH_STAND_PROFILE } from './character.js';
import { GLITCH_SPECIAL_IDS as S } from './ids.js';
import type { GlitchMoveRow } from './types.js';

const rows: readonly GlitchMoveRow[] = [
  {
    id: S.spatialDash, startup: 4, active: 8, recovery: 9,
    hurtboxes: [{ from: 0, to: 21, boxes: GLITCH_STAND_PROFILE }],
    displacements: [displacement(4, 0.82)],
    presentation: present('spatial-dash', 'cyan-ribbon-afterimage', 'shift_warn', 'shift_arrive'),
    tags: ['movement', 'no-invulnerability', 'punish-recovery-9'],
  },
  {
    id: S.shiftForward, startup: 7, active: 5, recovery: 13,
    hurtboxes: [
      { from: 0, to: 7, boxes: GLITCH_STAND_PROFILE },
      { from: 7, to: 10, boxes: [] },
      { from: 10, to: 25, boxes: GLITCH_STAND_PROFILE },
    ],
    displacements: [displacement(9, 1.45)],
    presentation: present('shift-forward', 'spatial-tear-forward', 'teleport_warn', 'teleport_arrive'),
    tags: ['teleport', 'invulnerable-3', 'cooldown-48', 'punish-recovery-13'],
  },
  {
    id: S.shiftBackward, startup: 6, active: 4, recovery: 12,
    hurtboxes: [
      { from: 0, to: 6, boxes: GLITCH_STAND_PROFILE },
      { from: 6, to: 8, boxes: [] },
      { from: 8, to: 22, boxes: GLITCH_STAND_PROFILE },
    ],
    displacements: [displacement(7, -1.18)],
    presentation: present('shift-backward', 'spatial-tear-back', 'teleport_warn', 'teleport_arrive'),
    tags: ['teleport', 'invulnerable-2', 'cooldown-42', 'punish-recovery-12'],
  },
  {
    id: S.airShift, startup: 6, active: 4, recovery: 15,
    hurtboxes: [
      { from: 0, to: 6, boxes: GLITCH_AIR_PROFILE },
      { from: 6, to: 9, boxes: [] },
      { from: 9, to: 25, boxes: GLITCH_AIR_PROFILE },
    ],
    displacements: [displacement(8, 1.12, 0.2)],
    presentation: present('air-shift', 'diagonal-air-tear', 'teleport_warn', 'teleport_arrive'),
    tags: ['air', 'teleport', 'air-dash', 'air-use-limit-1', 'cooldown-45', 'punish-recovery-15'],
  },
  {
    id: S.doubleJump, startup: 3, active: 5, recovery: 10,
    hurtboxes: [{ from: 0, to: 18, boxes: GLITCH_AIR_PROFILE }],
    displacements: [displacement(3, 0, 0.58)],
    presentation: present('spatial-double-jump', 'underfoot-rift-ring', 'double_jump', 'shift_arrive'),
    tags: ['air', 'double-jump', 'air-use-limit-1', 'cooldown-45', 'no-invulnerability'],
  },
];

export const GLITCH_SHIFT_MOVES: readonly MoveFrameData[] = buildGlitchMoves(rows);
