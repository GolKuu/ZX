import type { AangAttackButton, AangCombatElement } from '../aang/combat/elements.js';
import type { MoveFrameData } from '../sim/frame-data.js';
import { fixed } from '../sim/math.js';

type NormalRow = readonly [
  AangCombatElement,
  AangAttackButton,
  number, number, number,
  number,
  number, number,
  number, number,
  number, number,
  number?,
  ('wall' | 'ground')?,
];

const NORMALS: readonly NormalRow[] = [
  ['air', 'lp', 4, 2, 6, 22, .78, 1, .42, .3, .08, 0],
  ['air', 'hp', 9, 3, 18, 48, 1.22, 1.15, .64, .34, .18, .04],
  ['air', 'lk', 5, 2, 8, 26, .78, .35, .42, .22, .08, 0],
  ['air', 'hk', 10, 4, 20, 50, 1, 1, .56, .52, .15, .34],
  ['fire', 'lp', 5, 2, 10, 38, .8, 1, .42, .3, .1, 0, 4],
  ['fire', 'hp', 13, 3, 24, 75, .95, 1.25, .5, .54, .18, .08, 8],
  ['fire', 'lk', 7, 3, 14, 44, .88, .32, .48, .22, .12, 0, 5],
  ['fire', 'hk', 15, 4, 27, 90, 1.12, .95, .6, .44, .34, .12, 9, 'wall'],
  ['earth', 'lp', 9, 3, 18, 55, .76, 1, .4, .34, .2, 0],
  ['earth', 'hp', 18, 4, 30, 95, 1.35, 1.05, .68, .54, .18, .24],
  ['earth', 'lk', 10, 3, 19, 52, .95, .28, .52, .22, .13, 0],
  ['earth', 'hk', 20, 5, 32, 105, 1.22, .38, .66, .28, .22, .1, 0, 'ground'],
  ['water', 'lp', 6, 3, 11, 34, 1.16, 1, .6, .25, .12, 0],
  ['water', 'hp', 12, 4, 23, 62, 1.48, 1.08, .76, .38, .2, .06],
  ['water', 'lk', 8, 3, 15, 38, 1.35, .28, .7, .2, .13, 0],
  ['water', 'hk', 14, 4, 25, 70, 1.56, 1.38, .8, .3, .24, .12],
];

export const AANG_NORMAL_MOVES: readonly MoveFrameData[] = NORMALS.map(toMove);

function toMove(row: NormalRow): MoveFrameData {
  const [
    element, button, startup, active, recovery, damage,
    reach, height, halfWidth, halfHeight, horizontal, vertical,
    chip = 0, bounce,
  ] = row;
  const light = button === 'lp' || button === 'lk';
  const next = button === 'lp'
    ? [`${element}-lk`, `${element}-hp`]
    : button === 'lk' ? [`${element}-hp`] : [];
  return {
    id: `${element}-${button}`,
    startup,
    active,
    recovery,
    hitboxes: [{
      hitId: 'element',
      frames: { from: startup, toExclusive: startup + active },
      boxes: [{
        offset: { x: fixed(reach), y: fixed(height) },
        halfSize: { x: fixed(halfWidth), y: fixed(halfHeight) },
      }],
      hit: {
        damage,
        hitstop: { attacker: light ? 6 : 10, defender: light ? 8 : 14 },
        hitstun: light ? 16 : 26,
        knockback: { x: fixed(horizontal), y: fixed(vertical) },
        block: {
          blockstun: light ? 10 : 18,
          hitstop: { attacker: light ? 5 : 8, defender: light ? 7 : 11 },
          knockback: { x: fixed(light ? .08 : .16), y: 0 },
          chipDamage: chip,
        },
        wallBounce: bounce === 'wall'
          ? { count: 1, horizontalSpeed: fixed(.2), verticalSpeed: fixed(.15), minimumHitstun: 18 }
          : undefined,
        groundBounce: bounce === 'ground'
          ? { count: 1, verticalSpeed: fixed(.22), horizontalScale: { numerator: 1, denominator: 2 }, minimumHitstun: 26 }
          : undefined,
      },
    }],
    cancels: next.length === 0 ? undefined : [{
      frames: { from: startup, toExclusive: startup + active + recovery },
      into: next,
    }],
  };
}
