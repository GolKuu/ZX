import type { AangAttackButton, AangCombatElement } from '../aang/combat/elements.js';
import type { MoveFrameData, WallBounceData, GroundBounceData } from '../sim/frame-data.js';
import { fixed } from '../sim/math.js';

type NormalRow = {
  readonly element: AangCombatElement;
  readonly button: AangAttackButton;
  readonly frames: readonly [startup: number, active: number, recovery: number];
  readonly damage: number;
  readonly reach: number;
  readonly height: number;
  readonly size: readonly [width: number, height: number];
  readonly knockback: readonly [horizontal: number, vertical: number];
  readonly chip?: number;
  readonly wallBounce?: WallBounceData;
  readonly groundBounce?: GroundBounceData;
};

const NORMALS: readonly NormalRow[] = [
  { element: 'air', button: 'lp', frames: [4, 2, 6], damage: 22, reach: 0.78, height: 1, size: [0.42, 0.3], knockback: [0.08, 0] },
  { element: 'air', button: 'hp', frames: [9, 3, 18], damage: 48, reach: 1.22, height: 1.15, size: [0.64, 0.34], knockback: [0.18, 0.04] },
  { element: 'air', button: 'lk', frames: [5, 2, 8], damage: 26, reach: 0.78, height: 0.35, size: [0.42, 0.22], knockback: [0.08, 0] },
  { element: 'air', button: 'hk', frames: [10, 4, 20], damage: 50, reach: 1, height: 1, size: [0.56, 0.52], knockback: [0.15, 0.34] },

  { element: 'fire', button: 'lp', frames: [5, 2, 10], damage: 38, reach: 0.8, height: 1, size: [0.42, 0.3], knockback: [0.1, 0], chip: 4 },
  { element: 'fire', button: 'hp', frames: [13, 3, 24], damage: 75, reach: 0.95, height: 1.25, size: [0.5, 0.54], knockback: [0.18, 0.08], chip: 8 },
  { element: 'fire', button: 'lk', frames: [7, 3, 14], damage: 44, reach: 0.88, height: 0.32, size: [0.48, 0.22], knockback: [0.12, 0], chip: 5 },
  { element: 'fire', button: 'hk', frames: [15, 4, 27], damage: 90, reach: 1.12, height: 0.95, size: [0.6, 0.44], knockback: [0.34, 0.12], chip: 9, wallBounce: { count: 1, horizontalSpeed: fixed(0.2), verticalSpeed: fixed(0.15), minimumHitstun: 18 } },

  { element: 'earth', button: 'lp', frames: [9, 3, 18], damage: 55, reach: 0.76, height: 1, size: [0.4, 0.34], knockback: [0.2, 0] },
  { element: 'earth', button: 'hp', frames: [18, 4, 30], damage: 95, reach: 1.35, height: 1.05, size: [0.68, 0.54], knockback: [0.18, 0.24] },
  { element: 'earth', button: 'lk', frames: [10, 3, 19], damage: 52, reach: 0.95, height: 0.28, size: [0.52, 0.22], knockback: [0.13, 0] },
  { element: 'earth', button: 'hk', frames: [20, 5, 32], damage: 105, reach: 1.22, height: 0.38, size: [0.66, 0.28], knockback: [0.22, 0.1], groundBounce: { count: 1, verticalSpeed: fixed(0.22), horizontalScale: { numerator: 1, denominator: 2 }, minimumHitstun: 26 } },

  { element: 'water', button: 'lp', frames: [6, 3, 11], damage: 34, reach: 1.16, height: 1, size: [0.6, 0.25], knockback: [0.12, 0] },
  { element: 'water', button: 'hp', frames: [12, 4, 23], damage: 62, reach: 1.48, height: 1.08, size: [0.76, 0.38], knockback: [0.2, 0.06] },
  { element: 'water', button: 'lk', frames: [8, 3, 15], damage: 38, reach: 1.35, height: 0.28, size: [0.7, 0.2], knockback: [0.13, 0] },
  { element: 'water', button: 'hk', frames: [14, 4, 25], damage: 70, reach: 1.56, height: 1.38, size: [0.8, 0.3], knockback: [0.24, 0.12] },
];

export const AANG_NORMAL_MOVES: readonly MoveFrameData[] = NORMALS.map(toMove);

function toMove(row: NormalRow): MoveFrameData {
  const [startup, active, recovery] = row.frames;
  const [halfWidth, halfHeight] = row.size;
  const [horizontal, vertical] = row.knockback;
  const light = row.button === 'lp' || row.button === 'lk';
  const next = row.button === 'lp'
    ? [`${row.element}-lk`, `${row.element}-hp`]
    : row.button === 'lk' ? [`${row.element}-hp`] : [];
  return {
    id: `${row.element}-${row.button}`,
    startup,
    active,
    recovery,
    hitboxes: [{
      hitId: 'element',
      frames: { from: startup, toExclusive: startup + active },
      boxes: [{
        offset: { x: fixed(row.reach), y: fixed(row.height) },
        halfSize: { x: fixed(halfWidth), y: fixed(halfHeight) },
      }],
      hit: {
        damage: row.damage,
        hitstop: { attacker: light ? 6 : 10, defender: light ? 8 : 14 },
        hitstun: light ? 16 : 26,
        knockback: { x: fixed(horizontal), y: fixed(vertical) },
        block: {
          blockstun: light ? 10 : 18,
          hitstop: { attacker: light ? 5 : 8, defender: light ? 7 : 11 },
          knockback: { x: fixed(light ? 0.08 : 0.16), y: 0 },
          chipDamage: row.chip ?? 0,
        },
        wallBounce: row.wallBounce,
        groundBounce: row.groundBounce,
      },
    }],
    cancels: next.length === 0 ? undefined : [{
      frames: { from: startup, toExclusive: startup + active + recovery },
      into: next,
    }],
  };
}
