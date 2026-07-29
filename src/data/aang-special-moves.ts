import type { MoveFrameData } from '../sim/frame-data.js';
import { fixed } from '../sim/math.js';

const noHit = (
  id: string,
  startup: number,
  recovery: number,
): MoveFrameData => ({ id, startup, active: 1, recovery, hitboxes: [] });

export const AANG_SPECIAL_MOVES: readonly MoveFrameData[] = [
  ranged('air-squall', 12, 5, 24, 58, 2.45, 1.05, 0.9, 0.55, 0.4, 0.12),
  noHit('earth-wall', 9, 34),
  ranged('water-diagonal', 10, 5, 26, 68, 2.5, 1.55, 1.05, 0.72, 0.22, 0.32),
  noHit('element-shift-air', 3, 8),
  noHit('element-shift-fire', 3, 8),
  noHit('element-shift-earth', 3, 8),
  noHit('element-shift-water', 3, 8),
  ranged('elemental-cocoon', 16, 10, 34, 145, 0.82, 1, 0.82, 0.9, 0.28, 0.3),
  ranged('avatar-state', 22, 8, 52, 260, 1.25, 1.1, 1.05, 1.1, 0.4, 0.38),
];

function ranged(
  id: string,
  startup: number,
  active: number,
  recovery: number,
  damage: number,
  reach: number,
  height: number,
  halfWidth: number,
  halfHeight: number,
  horizontal: number,
  vertical: number,
): MoveFrameData {
  return {
    id,
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
        hitstop: { attacker: 10, defender: 14 },
        hitstun: 28,
        knockback: { x: fixed(horizontal), y: fixed(vertical) },
        block: {
          blockstun: 18,
          hitstop: { attacker: 8, defender: 11 },
          knockback: { x: fixed(horizontal / 2), y: 0 },
          chipDamage: id === 'elemental-cocoon' ? 12 : 0,
        },
      },
    }],
  };
}
