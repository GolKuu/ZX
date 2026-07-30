import type { AuthoredHitbox, MoveFrameData } from '../sim/frame-data.js';
import { fixed } from '../sim/math.js';

export type EchoSuperKind = 'analysis' | 'repeat' | 'statistics';

export const ECHO_SUPER_MOVE_IDS = {
  analysis: 'echo.super.analysis',
  repeat: 'echo.super.repeat',
  statistics: 'echo.super.statistics',
} as const;

export const ECHO_SUPER_COSTS: Readonly<Record<string, number>> = {
  [ECHO_SUPER_MOVE_IDS.analysis]: 34,
  [ECHO_SUPER_MOVE_IDS.repeat]: 100,
  [ECHO_SUPER_MOVE_IDS.statistics]: 100,
};

export const ECHO_SUPER_KINDS: Readonly<Record<string, EchoSuperKind>> = {
  [ECHO_SUPER_MOVE_IDS.analysis]: 'analysis',
  [ECHO_SUPER_MOVE_IDS.repeat]: 'repeat',
  [ECHO_SUPER_MOVE_IDS.statistics]: 'statistics',
};

export function echoSuperKindForMove(moveId: string): EchoSuperKind | null {
  return ECHO_SUPER_KINDS[moveId] ?? null;
}

export function echoSuperCostForMove(moveId: string): number | null {
  return ECHO_SUPER_COSTS[moveId] ?? null;
}

const ANALYSIS_HITS = Array.from(
  { length: 12 },
  (_, index) => hit(`hologram-${index + 1}`, 18, 8, 14, 0.02, 0),
);

const REPEAT_HITS = [16, 25, 34, 43, 52, 61].map(
  (frame, index) => hit(`copy-combo-${index + 1}`, frame, 34, 22, 0.04, 0.015),
);

const REPEAT_FINISH = hit('copy-finisher', 72, 70, 38, 0.34, 0.22);
const STATISTICS_FINISH = hit('habit-collapse', 44, 1_000, 90, 0.5, 0.3);

export const ECHO_SUPER_MOVES: readonly MoveFrameData[] = [
  {
    id: ECHO_SUPER_MOVE_IDS.analysis,
    startup: 18,
    active: 1,
    recovery: 80,
    hitboxes: ANALYSIS_HITS,
  },
  {
    id: ECHO_SUPER_MOVE_IDS.repeat,
    startup: 16,
    active: 57,
    recovery: 112,
    hitboxes: [...REPEAT_HITS, REPEAT_FINISH],
  },
  {
    id: ECHO_SUPER_MOVE_IDS.statistics,
    startup: 44,
    active: 1,
    recovery: 164,
    hitboxes: [STATISTICS_FINISH],
  },
];

function hit(
  hitId: string,
  frame: number,
  damage: number,
  hitstun: number,
  knockbackX: number,
  knockbackY: number,
): AuthoredHitbox {
  const finisher = damage >= 70;
  return {
    hitId,
    frames: { from: frame, toExclusive: frame + 1 },
    boxes: [{
      offset: { x: fixed(0.94), y: fixed(1.02) },
      halfSize: { x: fixed(0.86), y: fixed(0.78) },
    }],
    hit: {
      damage,
      hitstop: {
        attacker: finisher ? 14 : 3,
        defender: finisher ? 20 : 5,
      },
      hitstun,
      knockback: { x: fixed(knockbackX), y: fixed(knockbackY) },
    },
  };
}
