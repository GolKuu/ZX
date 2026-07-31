import type { MoveFrameData } from '../../sim/frame-data.js';
import { fixed, type FixedBox } from '../../sim/math.js';

export interface LuckyMoveSpec {
  readonly id: string;
  readonly startup: number;
  readonly active: number;
  readonly recovery: number;
  readonly damage: number;
  readonly level: 'high' | 'mid' | 'low' | 'air';
  readonly reach: number;
  readonly height: number;
  readonly launch?: boolean;
  readonly lowProfile?: readonly FixedBox[];
  readonly cancels?: readonly string[];
}

export function luckyMove(spec: LuckyMoveSpec): MoveFrameData {
  const heavy = spec.damage >= 65;
  return {
    id: spec.id,
    startup: spec.startup,
    active: spec.active,
    recovery: spec.recovery,
    hitboxes: [{
      hitId: spec.level,
      frames: {
        from: spec.startup,
        toExclusive: spec.startup + spec.active,
      },
      boxes: [attackBox(spec.reach, spec.height, heavy)],
      hit: {
        damage: spec.damage,
        hitstop: { attacker: heavy ? 10 : 6, defender: heavy ? 14 : 8 },
        hitstun: heavy ? 26 : 17,
        knockback: {
          x: fixed(heavy ? 0.2 : 0.1),
          y: fixed(spec.launch ? 0.36 : 0),
        },
        block: {
          blockstun: heavy ? 17 : 10,
          hitstop: { attacker: heavy ? 8 : 5, defender: heavy ? 11 : 7 },
          knockback: { x: fixed(heavy ? 0.17 : 0.08), y: 0 },
          chipDamage: heavy ? 4 : 0,
        },
      },
    }],
    hurtboxes: spec.lowProfile === undefined
      ? undefined
      : [{
          frames: {
            from: spec.startup,
            toExclusive: spec.startup + spec.active,
          },
          boxes: spec.lowProfile,
        }],
    cancels: spec.cancels === undefined
      ? undefined
      : [{
          frames: {
            from: spec.startup,
            toExclusive: spec.startup + spec.active + 3,
          },
          into: spec.cancels,
        }],
  };
}

function attackBox(reach: number, height: number, heavy: boolean): FixedBox {
  return {
    offset: { x: fixed(reach), y: fixed(height) },
    halfSize: { x: fixed(heavy ? 0.56 : 0.34), y: fixed(heavy ? 0.38 : 0.22) },
  };
}
