import type {
  AttackLevel,
  AuthoredHitbox,
  GrappleKind,
  MoveCounterData,
  MoveFrameData,
  MoveStatusData,
} from '../../sim/frame-data.js';
import { fixed, type FixedBox } from '../../sim/math.js';

export interface LuckyMoveSpec {
  readonly id: string;
  readonly startup: number;
  readonly active: number;
  readonly recovery: number;
  readonly damage: number;
  /** Guard rule. `air` moves are blocked as overheads by grounded defenders. */
  readonly level: AttackLevel | 'air';
  readonly reach: number;
  readonly height: number;
  readonly launch?: boolean;
  readonly lowProfile?: readonly FixedBox[];
  readonly cancels?: readonly string[];
  readonly lunge?: number;
  readonly resourceCost?: number;
  readonly resourceGainOnHit?: number;
  readonly status?: MoveStatusData;
  readonly grapple?: readonly [GrappleKind, number, 'grounded' | 'airborne'];
  /** Split the active window into this many separate strikes. */
  readonly hits?: number;
  /** Frames the fighter has no hurtbox at all, as `[from, toExclusive)`. */
  readonly invulnerable?: readonly [number, number];
  readonly counter?: MoveCounterData;
  readonly wallBounce?: boolean;
  readonly knockdown?: boolean;
  /** Hard override of the generated attack box, for reach-shaped moves. */
  readonly halfSize?: readonly [number, number];
  /** A pose with no attack at all — the Luck modifier verbs use this. */
  readonly noHitbox?: boolean;
  readonly cooldownFrames?: number;
}

/**
 * One authoring surface for every Lucky action.
 *
 * Frame numbers stay exactly as written: nothing here rounds, scales or infers
 * startup. What it does infer is the boring half — hitstop, blockstun and
 * knockback scale off damage so that two moves of the same weight always feel
 * the same, and a reviewer comparing the table to the brief only has to read
 * the numbers the brief actually specifies.
 */
export function luckyMove(spec: LuckyMoveSpec): MoveFrameData {
  const heavy = spec.damage >= 65;
  const attackLevel: AttackLevel = spec.level === 'air' ? 'high' : spec.level;
  const activeFrom = spec.startup;
  const activeTo = spec.startup + spec.active;

  return {
    id: spec.id,
    attackLevel,
    startup: spec.startup,
    active: spec.active,
    recovery: spec.recovery,
    hitboxes: spec.noHitbox === true
      ? []
      : buildHitboxes(spec, heavy, attackLevel, activeFrom, activeTo),
    hurtboxes: buildHurtboxes(spec, activeFrom, activeTo),
    cancels: spec.cancels === undefined
      ? undefined
      : [{
          frames: { from: activeFrom, toExclusive: activeTo + 3 },
          into: spec.cancels,
        }],
    counter: spec.counter,
    grapple: spec.grapple === undefined ? undefined : {
      kind: spec.grapple[0],
      pairedFrames: spec.grapple[1],
      targetSize: spec.grapple[2],
    },
    wallPiercing: spec.grapple !== undefined,
    minimumResource: spec.resourceCost,
    resourceCost: spec.resourceCost,
    resourceGainOnHit: spec.resourceGainOnHit ?? defaultLuckGain(spec),
    status: spec.status,
    cooldownFrames: spec.cooldownFrames,
    displacements: spec.lunge === undefined ? undefined : [{
      frame: Math.max(1, spec.startup - 2),
      offset: { x: fixed(spec.lunge), y: 0 },
      clearVelocity: true,
    }],
  };
}

/**
 * Luck earned on hit.
 *
 * Supers, the ultimate and the Luck verbs earn nothing — letting the resource
 * pay for its own refill is the "infinite Luck generation" the brief forbids.
 */
function defaultLuckGain(spec: LuckyMoveSpec): number {
  if (spec.id.includes('.super.') || spec.id.includes('.ultimate.')) return 0;
  if (spec.id.includes('.luck.')) return 0;
  if (spec.noHitbox === true) return 0;
  return spec.damage >= 70 ? 8 : 5;
}

function buildHitboxes(
  spec: LuckyMoveSpec,
  heavy: boolean,
  attackLevel: AttackLevel,
  activeFrom: number,
  activeTo: number,
): readonly AuthoredHitbox[] {
  const box = attackBox(spec, heavy);
  const hits = Math.max(1, spec.hits ?? 1);
  if (hits === 1) {
    return [{
      hitId: attackLevel,
      frames: { from: activeFrom, toExclusive: activeTo },
      boxes: [box],
      hit: hitData(spec, heavy, true, spec.damage),
    }];
  }

  // Multi-hit: the active window is cut into evenly spaced strikes. Only the
  // last one carries the real knockback, so a two-part technique cannot launch
  // twice and loop into itself.
  const span = Math.max(1, Math.floor(spec.active / hits));
  return Array.from({ length: hits }, (_, index) => {
    const final = index === hits - 1;
    const from = activeFrom + index * span;
    return {
      hitId: `${attackLevel}-${String(index + 1)}`,
      frames: {
        from,
        toExclusive: final ? activeTo : Math.min(activeTo, from + span),
      },
      boxes: [box],
      hit: hitData(spec, heavy, final, Math.floor(spec.damage / hits)),
    };
  });
}

function hitData(
  spec: LuckyMoveSpec,
  heavy: boolean,
  final: boolean,
  damage: number,
) {
  // Lucky's clean photo poses need a slightly longer contact beat than the
  // old blockout. The freeze makes the strike readable without moving the
  // hitbox or changing startup/recovery balance.
  const hitstop = heavy
    ? { attacker: 14, defender: 18 }
    : { attacker: 9, defender: 12 };
  return {
    damage,
    hitstop,
    hitstun: final ? (heavy ? 26 : 17) : 12,
    knockback: {
      x: fixed(final ? (heavy ? 0.2 : 0.1) : 0.02),
      y: fixed(final && spec.launch === true ? 0.36 : 0),
    },
    ...(spec.grapple === undefined
      ? {
          block: {
            blockstun: heavy ? 17 : 10,
            hitstop: heavy
              ? { attacker: 11, defender: 14 }
              : { attacker: 7, defender: 10 },
            knockback: { x: fixed(heavy ? 0.17 : 0.08), y: 0 },
            chipDamage: heavy ? 4 : 0,
          },
        }
      : {}),
    ...(final && spec.wallBounce === true
      ? {
          wallBounce: {
            count: 1,
            horizontalSpeed: fixed(0.24),
            verticalSpeed: fixed(0.18),
            minimumHitstun: 24,
          },
        }
      : {}),
    ...(final && spec.knockdown === true
      ? {
          groundBounce: {
            count: 1,
            verticalSpeed: fixed(0.14),
            horizontalScale: { numerator: 1, denominator: 3 },
            minimumHitstun: 20,
          },
        }
      : {}),
  };
}

/**
 * Hurtbox overrides.
 *
 * Two independent reasons a move touches its hurtboxes: a low-profile normal
 * ducks under highs while it is active, and an invulnerable reversal has no
 * hurtbox at all for an authored window. An empty box list is a real, bounded
 * invulnerability the validator understands — it is never open-ended.
 */
function buildHurtboxes(
  spec: LuckyMoveSpec,
  activeFrom: number,
  activeTo: number,
) {
  const windows = [];
  if (spec.invulnerable !== undefined) {
    windows.push({
      frames: { from: spec.invulnerable[0], toExclusive: spec.invulnerable[1] },
      boxes: [],
    });
  }
  if (spec.lowProfile !== undefined) {
    windows.push({
      frames: { from: activeFrom, toExclusive: activeTo },
      boxes: spec.lowProfile,
    });
  }
  return windows.length === 0 ? undefined : windows;
}

function attackBox(spec: LuckyMoveSpec, heavy: boolean): FixedBox {
  const [halfWidth, halfHeight] = spec.halfSize ?? [
    heavy ? 0.56 : 0.34,
    heavy ? 0.38 : 0.22,
  ];
  return {
    offset: { x: fixed(spec.reach), y: fixed(spec.height) },
    halfSize: { x: fixed(halfWidth), y: fixed(halfHeight) },
  };
}
