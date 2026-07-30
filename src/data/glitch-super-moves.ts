import type { MoveFrameData } from '../sim/frame-data.js';
import { fixed, type FixedBox, type FixedVector } from '../sim/math.js';

export const GLITCH_SUPER_MOVE_IDS = {
  error: 'glitch.super.error',
  critical: 'glitch.super.critical-error',
  patchNotes: 'glitch.finisher.patch-notes',
} as const;

export type GlitchSuperKind = keyof typeof GLITCH_SUPER_MOVE_IDS;

export const GLITCH_LEVEL_ONE_COST = 34;
export const GLITCH_LEVEL_THREE_COST = 100;
export const GLITCH_CINEMATIC_FRAMES: Readonly<Record<
  GlitchSuperKind,
  number
>> = {
  error: 192,
  critical: 276,
  patchNotes: 252,
};

interface GlitchSuperRow {
  readonly id: string;
  readonly startup: number;
  readonly active: number;
  readonly recovery: number;
  readonly damage: number;
  readonly hitstop: readonly [number, number];
  readonly hitstun: number;
  readonly box: FixedBox;
  readonly knockback: FixedVector;
}

const rows: readonly GlitchSuperRow[] = [
  {
    id: GLITCH_SUPER_MOVE_IDS.error,
    startup: 18,
    active: 4,
    recovery: GLITCH_CINEMATIC_FRAMES.error - 18 - 4,
    damage: 110,
    hitstop: [14, 20],
    hitstun: 72,
    box: box(1.08, 1.02, 0.84, 0.78),
    knockback: { x: fixed(0.08), y: fixed(0.08) },
  },
  {
    id: GLITCH_SUPER_MOVE_IDS.critical,
    startup: 22,
    active: 5,
    recovery: GLITCH_CINEMATIC_FRAMES.critical - 22 - 5,
    damage: 390,
    hitstop: [20, 28],
    hitstun: 128,
    box: box(1.12, 1.02, 0.9, 0.86),
    knockback: { x: fixed(0.16), y: fixed(0.12) },
  },
  {
    id: GLITCH_SUPER_MOVE_IDS.patchNotes,
    startup: 14,
    active: 5,
    recovery: GLITCH_CINEMATIC_FRAMES.patchNotes - 14 - 5,
    damage: 1_000,
    hitstop: [24, 34],
    hitstun: 210,
    box: box(1.14, 1.02, 0.94, 0.94),
    knockback: { x: 0, y: 0 },
  },
];

export const GLITCH_SUPER_MOVES: readonly MoveFrameData[] = rows.map((row) => ({
  id: row.id,
  startup: row.startup,
  active: row.active,
  recovery: row.recovery,
  hitboxes: [{
    hitId: 'system-command',
    frames: {
      from: row.startup,
      toExclusive: row.startup + row.active,
    },
    boxes: [row.box],
    hit: {
      damage: row.damage,
      hitstop: { attacker: row.hitstop[0], defender: row.hitstop[1] },
      hitstun: row.hitstun,
      knockback: row.knockback,
    },
  }],
}));

export function glitchSuperKindForMove(
  moveId: string,
): GlitchSuperKind | null {
  for (const [kind, id] of Object.entries(GLITCH_SUPER_MOVE_IDS)) {
    if (id === moveId) return kind as GlitchSuperKind;
  }
  return null;
}

export function glitchSuperCostForMove(moveId: string): number | null {
  const kind = glitchSuperKindForMove(moveId);
  if (kind === null) return null;
  return kind === 'error'
    ? GLITCH_LEVEL_ONE_COST
    : GLITCH_LEVEL_THREE_COST;
}

function box(
  x: number,
  y: number,
  halfWidth: number,
  halfHeight: number,
): FixedBox {
  return {
    offset: { x: fixed(x), y: fixed(y) },
    halfSize: { x: fixed(halfWidth), y: fixed(halfHeight) },
  };
}
