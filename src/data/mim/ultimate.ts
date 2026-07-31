import type { MoveFrameData } from '../../sim/frame-data.js';
import { buildMove, wall, type MimHit, type MimMoveRow } from './builder.js';
import { MIM_AIRBORNE_PROFILE } from './character.js';

const SEQUENCE_ID = 'mim.ultimate.perfect-box.sequence';

/**
 * Perfect Box, after the trap hit confirms.
 *
 * Every blow in the list is a different approach angle, because the whole point
 * of the ultimate is that the cage removes the opponent's ability to predict
 * where MIM comes from next. Knockback stays near zero until the finale so the
 * geometry, not the pushback, is what holds them in place.
 */
function blow(
  hitId: string,
  from: number,
  box: MimHit['box'],
  damage: number,
  hitstun: number,
): MimHit {
  return {
    hitId,
    from,
    to: from + 4,
    box,
    damage,
    hitstop: [7, 9],
    hitstun,
    knockback: [0, 0.02],
  };
}

const hits: readonly MimHit[] = [
  // From the left, off the near plane.
  blow('left', 16, [0.7, 1.32, 0.46, 0.5], 34, 30),
  // From above.
  blow('above', 26, [1.16, 1.96, 0.42, 0.52], 34, 30),
  // Rebound off the rear plane, driving forward again.
  blow('rebound', 38, [0.86, 1.1, 0.5, 0.46], 38, 32),
  // Diagonal, shoulder through the line.
  blow('diagonal', 50, [1.0, 1.56, 0.48, 0.52], 38, 32),
  // From below — the sweep angle the cage makes possible.
  blow('below', 62, [0.94, 0.42, 0.5, 0.3], 42, 34),
  // Butterfly Kick, full horizontal rotation.
  { ...blow('butterfly', 76, [0.9, 1.24, 0.6, 0.56], 52, 40), to: 82 },
  // Wall Dive from the top platform.
  { ...blow('dive', 92, [0.8, 0.98, 0.44, 0.7], 58, 40), to: 98 },
  // Rotational finale: the only blow that moves them, and it breaks the cage.
  {
    hitId: 'finale',
    from: 110,
    to: 118,
    box: [0.92, 1.3, 0.66, 0.78],
    damage: 150,
    hitstop: [22, 30],
    hitstun: 70,
    knockback: [0.34, 0.3],
    wallBounce: {
      count: 1,
      horizontalSpeed: 150,
      verticalSpeed: 120,
      minimumHitstun: 44,
    },
    groundBounce: {
      count: 1,
      verticalSpeed: 96,
      horizontalScale: { numerator: 1, denominator: 3 },
      minimumHitstun: 40,
    },
  },
];

const row: MimMoveRow = {
  id: SEQUENCE_ID,
  startup: 14,
  active: 106,
  recovery: 70,
  wallPiercing: true,
  hits,
  // The cage: a front plane, a rear plane MIM rebounds from, and a ceiling she
  // dives off. All three expire with the sequence.
  walls: [
    wall({
      kind: 'ultimate',
      at: [2.35, 1.25],
      size: [0.09, 1.25],
      spawnFrame: 2,
      materializeFrames: 6,
      lifetimeFrames: 116,
      integrity: 9,
      runnable: true,
    }),
    wall({
      kind: 'ultimate',
      at: [-0.55, 1.25],
      size: [0.09, 1.25],
      spawnFrame: 5,
      materializeFrames: 6,
      lifetimeFrames: 113,
      integrity: 9,
      runnable: true,
    }),
    wall({
      kind: 'ultimate',
      at: [1.2, 2.5],
      size: [1.3, 0.07],
      spawnFrame: 8,
      materializeFrames: 6,
      lifetimeFrames: 110,
      integrity: 9,
      platform: true,
    }),
  ],
  // Untouchable while the cage is closed; the recovery tail is not.
  hurtboxes: [
    { from: 0, to: 118, boxes: [] },
    { from: 118, to: 190, boxes: MIM_AIRBORNE_PROFILE },
  ],
};

export const MIM_PERFECT_BOX_SEQUENCE = {
  id: SEQUENCE_ID,
  move: buildMove(row) satisfies MoveFrameData,
  /** Frame the cage breaks and the opponent is released. */
  cageBreakFrame: 118,
  totalFrames: row.startup + row.active + row.recovery,
} as const;
