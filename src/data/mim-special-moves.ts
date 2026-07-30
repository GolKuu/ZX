import type { MoveFrameData } from '../sim/frame-data.js';
import { fixed } from '../sim/math.js';

export const MIM_SPECIAL_MOVE_IDS = {
  invisibleWall: 'mim.special.invisible-wall',
  bananaTrap: 'mim.special.banana-trap',
  fakeOpening: 'mim.special.fake-opening',
} as const;

/**
 * These are additive special actions. Existing normals and supers remain
 * byte-for-byte unchanged. The trap is deliberately low damage; the fake
 * opening has no hitbox by design.
 */
export const MIM_SPECIAL_MOVES: readonly MoveFrameData[] = [
  {
    id: MIM_SPECIAL_MOVE_IDS.invisibleWall,
    startup: 12,
    active: 72,
    recovery: 16,
    hitboxes: [],
  },
  {
    id: MIM_SPECIAL_MOVE_IDS.bananaTrap,
    startup: 13,
    active: 70,
    recovery: 16,
    hitboxes: [{
      hitId: 'peel',
      frames: { from: 25, toExclusive: 83 },
      boxes: [{
        offset: { x: fixed(1.02), y: fixed(0.12) },
        halfSize: { x: fixed(0.34), y: fixed(0.14) },
      }],
      hit: {
        damage: 12,
        hitstop: { attacker: 4, defender: 7 },
        hitstun: 22,
        knockback: { x: fixed(0.035), y: fixed(0.16) },
        groundBounce: {
          count: 1,
          verticalSpeed: fixed(0.1),
          horizontalScale: { numerator: 1, denominator: 3 },
          minimumHitstun: 18,
        },
      },
    }],
  },
  {
    id: MIM_SPECIAL_MOVE_IDS.fakeOpening,
    startup: 36,
    active: 1,
    recovery: 18,
    hitboxes: [],
  },
];
