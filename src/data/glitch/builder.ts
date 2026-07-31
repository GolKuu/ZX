import type { MoveFrameData } from '../../sim/frame-data.js';
import { fixed, type FixedBox } from '../../sim/math.js';
import type {
  GlitchHit,
  GlitchMoveDefinition,
  GlitchMoveRow,
} from './types.js';
import { GLITCH_AIR_RULES } from './character.js';

export const GLITCH_MOVE_DEFINITIONS = new Map<string, GlitchMoveDefinition>();

export function buildGlitchMove(row: GlitchMoveRow): MoveFrameData {
  const totalFrames = row.startup + row.active + row.recovery;
  GLITCH_MOVE_DEFINITIONS.set(row.id, {
    id: row.id,
    startup: row.startup,
    active: row.active,
    recovery: row.recovery,
    hitLevels: [...new Set((row.hits ?? []).map((hit) => hit.level))],
    cancelLimit: Math.max(0, ...((row.cancels ?? []).map((cancel) => cancel.limit ?? 1))),
    presentation: row.presentation,
    tags: row.tags,
  });
  return {
    id: row.id,
    attackLevel: attackLevelFrom(row),
    startup: row.startup,
    active: row.active,
    recovery: row.recovery,
    hitboxes: (row.hits ?? []).map(buildHitbox),
    hurtboxes: row.hurtboxes?.map((hurt) => ({
      frames: {
        from: Math.min(hurt.from, totalFrames - 1),
        toExclusive: Math.min(hurt.to, totalFrames),
      },
      boxes: hurt.boxes.map(box),
    })),
    cancels: row.cancels?.map((cancel) => ({
      frames: { from: cancel.from, toExclusive: cancel.to },
      into: [...cancel.into],
    })),
    displacements: row.displacements,
    armour: row.armour,
    counter: row.counter,
    grapple: row.grapple,
    resourceCost: row.meterCost,
    onHitFollowUp: row.onHitFollowUp,
    status: row.status,
    airCombo: row.tags.includes('air') ? {
      juggleLimit: GLITCH_AIR_RULES.juggleLimit,
      hitstunDecayPerHit: GLITCH_AIR_RULES.hitstunDecayPerHit,
      repeatedMoveDamagePercent: GLITCH_AIR_RULES.repeatedMoveDamagePercent,
    } : undefined,
    cooldownFrames: cooldownFrom(row.tags),
  };
}

function attackLevelFrom(row: GlitchMoveRow): MoveFrameData['attackLevel'] {
  const level = row.hits?.[0]?.level;
  if (level === 'overhead') return 'high';
  if (level === 'throw') return 'throw';
  return level;
}

export function buildGlitchMoves(
  rows: readonly GlitchMoveRow[],
): readonly MoveFrameData[] {
  return rows.map(buildGlitchMove);
}

export function present(
  animation: string,
  vfx: string,
  startupSound: string,
  impactSound: string,
  camera: GlitchMoveRow['presentation']['camera'] = 'none',
): GlitchMoveRow['presentation'] {
  return { animation, vfx, startupSound, impactSound, camera };
}

export function hit(
  values: Omit<GlitchHit, 'hitstop' | 'knockback'> & {
    readonly hitstop?: readonly [number, number];
    readonly knockback?: readonly [number, number];
  },
): GlitchHit {
  return {
    hitstop: values.damage >= 80 ? [10, 14] : [6, 9],
    knockback: [0.1, 0],
    ...values,
  };
}

export function displacement(
  frame: number,
  x: number,
  y = 0,
  clearVelocity = true,
) {
  return {
    frame,
    offset: { x: fixed(x), y: fixed(y) },
    clearVelocity,
  };
}

function buildHitbox(source: GlitchHit) {
  const hitstop = { attacker: source.hitstop[0], defender: source.hitstop[1] };
  return {
    hitId: source.id,
    frames: { from: source.from, toExclusive: source.to },
    boxes: [box(source.box)],
    hit: {
      damage: source.damage,
      hitstop,
      hitstun: source.hitstun,
      knockback: {
        x: fixed(source.knockback[0]),
        y: fixed(source.knockback[1]),
      },
      block: source.blockstun === undefined ? undefined : {
        blockstun: source.blockstun,
        hitstop,
        knockback: {
          x: fixed(source.blockKnockback?.[0] ?? 0.11),
          y: fixed(source.blockKnockback?.[1] ?? 0),
        },
        chipDamage: source.chip,
        guardDamage: source.guardDamage,
      },
      wallBounce: source.wallBounce,
      groundBounce: source.groundBounce,
    },
  };
}

function box(tuple: readonly [number, number, number, number]): FixedBox {
  return {
    offset: { x: fixed(tuple[0]), y: fixed(tuple[1]) },
    halfSize: { x: fixed(tuple[2]), y: fixed(tuple[3]) },
  };
}

function cooldownFrom(tags: readonly string[]): number | undefined {
  const tag = tags.find((entry) => entry.startsWith('cooldown-'));
  if (tag === undefined) return undefined;
  const frames = Number.parseInt(tag.slice('cooldown-'.length), 10);
  return Number.isFinite(frames) ? frames : undefined;
}
