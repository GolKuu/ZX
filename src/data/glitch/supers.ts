import type { MoveFrameData } from '../../sim/frame-data.js';
import { buildGlitchMove, hit, present } from './builder.js';
import { GLITCH_AIR_PROFILE, GLITCH_STAND_PROFILE } from './character.js';
import {
  GLITCH_SPECIAL_IDS,
  GLITCH_SUPER_IDS as S,
} from './ids.js';
import type { GlitchHit, GlitchMoveRow } from './types.js';

export const GLITCH_LEVEL_ONE_COST = 34;
export const GLITCH_LEVEL_THREE_COST = 100;

function sequenceHit(
  id: string,
  from: number,
  box: GlitchHit['box'],
  damage: number,
): GlitchHit {
  return hit({
    id, from, to: from + 3, box, level: 'mid', damage,
    hitstun: 28, hitstop: [7, 10], knockback: [0.01, 0.02],
  });
}

const riftSequence: GlitchMoveRow = {
  id: S.riftSequence, startup: 11, active: 58, recovery: 24, meterCost: 34,
  hits: [
    sequenceHit('lock', 11, [0.72, 1.35, 0.42, 0.48], 28),
    sequenceHit('rear', 22, [-0.6, 1.4, 0.4, 0.44], 30),
    sequenceHit('above', 33, [0.2, 1.94, 0.46, 0.42], 32),
    sequenceHit('cross', 44, [0.82, 1.05, 0.52, 0.52], 34),
    hit({
      id: 'rift-finale', from: 58, to: 69, box: [0.9, 1.2, 0.62, 0.62],
      level: 'mid', damage: 78, hitstun: 48, hitstop: [16, 23],
      knockback: [0.28, 0.24], wallBounce: {
        count: 1, horizontalSpeed: 138, verticalSpeed: 108, minimumHitstun: 32,
      },
    }),
  ],
  hurtboxes: [{ from: 11, to: 69, boxes: [] }, { from: 69, to: 93, boxes: GLITCH_STAND_PROFILE }],
  presentation: present('rift-sequence', 'multi-point-rift-chain', 'super_freeze', 'super_final', 'cinematic'),
  tags: ['super-1', 'confirmed-sequence', 'recovery-24'],
};

const realityCollapse: GlitchMoveRow = {
  id: S.realityCollapse, startup: 16, active: 36, recovery: 32, meterCost: 34,
  status: {
    id: 'glitch.reality-collapse-mode',
    durationFrames: 360,
    recoveryPercent: 78,
  },
  hits: [
    hit({
      id: 'collapse-open', from: 16, to: 21, box: [0.92, 1.3, 0.58, 0.62],
      level: 'mid', damage: 62, hitstun: 30, blockstun: 18,
      knockback: [0.04, 0.12], chip: 9, guardDamage: 28,
    }),
    hit({
      id: 'collapse-close', from: 44, to: 52, box: [1.2, 1.12, 0.82, 0.72],
      level: 'overhead', damage: 116, hitstun: 43, blockstun: 20,
      hitstop: [15, 21], knockback: [0.25, 0.2], chip: 14, guardDamage: 36,
    }),
  ],
  hurtboxes: [{ from: 10, to: 20, boxes: [] }, { from: 20, to: 84, boxes: GLITCH_AIR_PROFILE }],
  cancels: [{
    from: 16, to: 48,
    into: ['glitch.air-light', 'glitch.air-medium', 'glitch.teleport-strike'],
    limit: 2,
  }],
  presentation: present('reality-collapse', 'expanded-cancel-lattice', 'collapse_open', 'collapse_final', 'cinematic'),
  tags: ['super-2', 'mobility-expansion', 'cancel-limit-2', 'whiff-recovery-32'],
};

const fourthGodStarter: GlitchMoveRow = {
  id: S.fourthGod, startup: 13, active: 5, recovery: 21,
  hits: [hit({
    id: 'resonance-confirm', from: 13, to: 18, box: [0.74, 1.28, 0.46, 0.58],
    level: 'mid', damage: 36, hitstun: 44, hitstop: [18, 25],
    knockback: [0, 0.02],
  })],
  hurtboxes: [{ from: 9, to: 18, boxes: GLITCH_AIR_PROFILE }],
  onHitFollowUp: S.fourthGodSequence,
  presentation: present('fourth-god-confirm', 'white-resonance-sigil', 'god_confirm', 'god_lock', 'freeze'),
  tags: ['ultimate', 'hit-confirm-required', 'whiff-recovery-21'],
};

const ultimateHits: readonly GlitchHit[] = [
  sequenceHit('fracture', 18, [0.68, 1.32, 0.48, 0.52], 42),
  sequenceHit('god-hand', 34, [-0.62, 1.54, 0.5, 0.6], 54),
  sequenceHit('god-eye', 52, [0.12, 2.02, 0.62, 0.44], 58),
  sequenceHit('resonance-one', 70, [0.86, 0.84, 0.56, 0.5], 62),
  sequenceHit('resonance-two', 88, [0.9, 1.62, 0.62, 0.58], 66),
  hit({
    id: 'fourth-impact', from: 112, to: 122, box: [0.96, 1.25, 0.78, 0.86],
    level: 'mid', damage: 280, hitstun: 78, hitstop: [24, 34],
    knockback: [0.36, 0.32], wallBounce: {
      count: 1, horizontalSpeed: 156, verticalSpeed: 122, minimumHitstun: 46,
    },
  }),
];

const fourthGodSequence: GlitchMoveRow = {
  id: S.fourthGodSequence, startup: 16, active: 106, recovery: 68,
  hits: ultimateHits,
  hurtboxes: [{ from: 0, to: 122, boxes: [] }, { from: 122, to: 190, boxes: GLITCH_AIR_PROFILE }],
  presentation: present('fourth-god-resonance', 'fourth-god-manifestation', 'god_manifest', 'god_impact', 'cinematic'),
  tags: ['ultimate-sequence', 'cinematic-freeze', 'return-to-match', 'recovery-68'],
};

export const GLITCH_SUPER_MOVES: readonly MoveFrameData[] = [
  buildGlitchMove(riftSequence),
  buildGlitchMove(realityCollapse),
  buildGlitchMove(fourthGodStarter),
  buildGlitchMove(fourthGodSequence),
];

export type GlitchSuperKind = 'error' | 'critical' | 'patchNotes';

const KINDS: Readonly<Record<string, GlitchSuperKind>> = {
  [S.riftSequence]: 'error',
  [S.realityCollapse]: 'critical',
  [S.fourthGodSequence]: 'patchNotes',
};

export function glitchSuperKindForMove(moveId: string): GlitchSuperKind | null {
  return KINDS[moveId] ?? null;
}

export function glitchSuperCostForMove(moveId: string): number | null {
  if ((Object.values(GLITCH_SPECIAL_IDS) as readonly string[])
    .filter((id) => id.includes('.ex.'))
    .includes(moveId)) {
    return 25;
  }
  const kind = glitchSuperKindForMove(moveId);
  if (kind === null) return null;
  return kind === 'patchNotes' ? GLITCH_LEVEL_THREE_COST : GLITCH_LEVEL_ONE_COST;
}
