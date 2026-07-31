import type {
  GrappleKind,
  MoveFrameData,
} from '../../sim/frame-data.js';
import { fixed, type FixedBox } from '../../sim/math.js';

export interface TitanMoveSpec {
  readonly id: string;
  readonly startup: number;
  readonly active: number;
  readonly recovery: number;
  readonly damage: number;
  readonly reach: number;
  readonly height: number;
  readonly level: 'high' | 'mid' | 'low' | 'air' | 'grab';
  readonly guardDamage?: number;
  readonly guardBreak?: boolean;
  readonly armour?: readonly [from: number, to: number, hits: number];
  readonly grapple?: readonly [kind: GrappleKind, pairedFrames: number];
  readonly launch?: boolean;
  readonly wallSplat?: boolean;
  readonly hurtboxes?: readonly FixedBox[];
  readonly cancels?: readonly string[];
  readonly onHitFollowUp?: string;
  readonly lunge?: number;
  readonly resourceCost?: number;
}

export function titanMove(spec: TitanMoveSpec): MoveFrameData {
  const heavy = spec.damage >= 78;
  const hitstop = heavy ? { attacker: 11, defender: 16 } : { attacker: 7, defender: 10 };
  return {
    id: spec.id,
    startup: spec.startup,
    active: spec.active,
    recovery: spec.recovery,
    hitboxes: spec.damage === 0 ? [] : [{
      hitId: spec.level,
      frames: { from: spec.startup, toExclusive: spec.startup + spec.active },
      boxes: [attackBox(spec.reach, spec.height, spec.level === 'grab')],
      hit: {
        damage: spec.damage,
        hitstop,
        hitstun: spec.grapple?.[1] ?? (heavy ? 28 : 18),
        knockback: {
          x: fixed(spec.grapple === undefined ? (heavy ? 0.22 : 0.11) : 0.04),
          y: fixed(spec.launch ? 0.38 : 0),
        },
        block: spec.grapple === undefined ? {
          blockstun: heavy ? 18 : 11,
          hitstop,
          knockback: { x: fixed(heavy ? 0.19 : 0.09), y: 0 },
          chipDamage: heavy ? 4 : 0,
          guardDamage: spec.guardDamage ?? (heavy ? 18 : 10),
          guardBreak: spec.guardBreak,
        } : undefined,
        wallBounce: spec.wallSplat ? {
          count: 1,
          horizontalSpeed: fixed(0.24),
          verticalSpeed: fixed(0.12),
          minimumHitstun: 24,
        } : undefined,
      },
    }],
    hurtboxes: spec.hurtboxes === undefined ? undefined : [{
      frames: { from: 0, toExclusive: spec.startup + spec.active },
      boxes: spec.hurtboxes,
    }],
    cancels: spec.cancels === undefined ? undefined : [{
      frames: { from: spec.startup, toExclusive: spec.startup + spec.active + 3 },
      into: spec.cancels,
    }],
    armour: spec.armour === undefined ? undefined : {
      frames: { from: spec.armour[0], toExclusive: spec.armour[1] },
      hits: spec.armour[2],
      damagePercent: 55,
    },
    grapple: spec.grapple === undefined ? undefined : {
      kind: spec.grapple[0],
      pairedFrames: spec.grapple[1],
      targetSize: spec.level === 'air' ? 'airborne' : 'any',
    },
    onHitFollowUp: spec.onHitFollowUp,
    resourceCost: spec.resourceCost,
    wallPiercing: spec.grapple !== undefined,
    displacements: spec.lunge === undefined ? undefined : [{
      frame: Math.max(1, spec.startup - 2),
      offset: { x: fixed(spec.lunge), y: 0 },
      clearVelocity: true,
    }],
  };
}

function attackBox(reach: number, height: number, grab: boolean): FixedBox {
  return {
    offset: { x: fixed(reach), y: fixed(height) },
    halfSize: { x: fixed(grab ? 0.34 : 0.5), y: fixed(grab ? 0.5 : 0.34) },
  };
}
