import type { MoveFrameData } from '../sim/frame-data.js';
import { fixed } from '../sim/math.js';

export type ChronoSuperKind =
  | 'rewind'
  | 'outcomes'
  | 'inevitability';

export const CHRONO_SUPER_MOVE_IDS = {
  rewind: 'chrono.super.rewind',
  outcomes: 'chrono.super.outcomes',
  inevitability: 'chrono.finisher.inevitability',
} as const;

export const CHRONO_LEVEL_ONE_COST = 34;
export const CHRONO_LEVEL_THREE_COST = 100;

const COSTS: Readonly<Record<string, number>> = {
  [CHRONO_SUPER_MOVE_IDS.rewind]: CHRONO_LEVEL_ONE_COST,
  [CHRONO_SUPER_MOVE_IDS.outcomes]: CHRONO_LEVEL_THREE_COST,
  [CHRONO_SUPER_MOVE_IDS.inevitability]: CHRONO_LEVEL_THREE_COST,
};

const KINDS: Readonly<Record<string, ChronoSuperKind>> = {
  [CHRONO_SUPER_MOVE_IDS.rewind]: 'rewind',
  [CHRONO_SUPER_MOVE_IDS.outcomes]: 'outcomes',
  [CHRONO_SUPER_MOVE_IDS.inevitability]: 'inevitability',
};

export const CHRONO_SUPER_MOVES: readonly MoveFrameData[] = [
  superMove(CHRONO_SUPER_MOVE_IDS.rewind, 24, 126, 190, 72, 0.3, 0.12),
  superMove(CHRONO_SUPER_MOVE_IDS.outcomes, 38, 202, 430, 120, 0.46, 0.28),
  superMove(
    CHRONO_SUPER_MOVE_IDS.inevitability,
    44,
    256,
    1_000,
    180,
    0.68,
    0.36,
  ),
];

export function chronoSuperKindForMove(
  moveId: string,
): ChronoSuperKind | null {
  return KINDS[moveId] ?? null;
}

export function chronoSuperCostForMove(moveId: string): number | null {
  return COSTS[moveId] ?? null;
}

function superMove(
  id: string,
  startup: number,
  recovery: number,
  damage: number,
  hitstun: number,
  knockbackX: number,
  knockbackY: number,
): MoveFrameData {
  return {
    id,
    startup,
    active: 1,
    recovery,
    hitboxes: [{
      hitId: 'collapsed-timeline',
      frames: { from: startup, toExclusive: startup + 1 },
      boxes: [{
        offset: { x: fixed(1.16), y: fixed(1.02) },
        halfSize: { x: fixed(0.92), y: fixed(0.84) },
      }],
      hit: {
        damage,
        hitstop: {
          attacker: damage >= 1_000 ? 24 : 18,
          defender: damage >= 1_000 ? 34 : 26,
        },
        hitstun,
        knockback: { x: fixed(knockbackX), y: fixed(knockbackY) },
      },
    }],
  };
}
