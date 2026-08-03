import type { MoveFrameData } from '../../sim/frame-data.js';
import { LUCKY_AERIAL_NORMALS } from './aerials.js';
import { LUCKY_CHARGE_MOVES, LUCKY_MECHANIC_MOVES } from './mechanic.js';
import {
  LUCKY_BACK_NORMALS,
  LUCKY_CROUCHING_NORMALS,
  LUCKY_FORWARD_NORMALS,
  LUCKY_STANDING_NORMALS,
} from './normals.js';
import { LUCKY_DUAL_TECHNIQUES, LUCKY_THROWS } from './throws.js';

export { LUCKY_LUCK_IDS, LUCKY_MOVE_IDS } from './ids.js';
export { LUCKY_AERIAL_NORMALS } from './aerials.js';
export { LUCKY_CHARGE_MOVES, LUCKY_MECHANIC_MOVES } from './mechanic.js';
export {
  LUCKY_BACK_NORMALS,
  LUCKY_CROUCHING_NORMALS,
  LUCKY_FORWARD_NORMALS,
  LUCKY_STANDING_NORMALS,
} from './normals.js';
export { LUCKY_DUAL_TECHNIQUES, LUCKY_THROWS } from './throws.js';

/**
 * Everything Lucky can do that is not a special, a super or the ultimate.
 *
 * Order here is presentation only; the command table decides what beats what.
 */
export const LUCKY_MOVES: readonly MoveFrameData[] = [
  ...LUCKY_STANDING_NORMALS,
  ...LUCKY_FORWARD_NORMALS,
  ...LUCKY_BACK_NORMALS,
  ...LUCKY_CROUCHING_NORMALS,
  ...LUCKY_AERIAL_NORMALS,
  ...LUCKY_THROWS,
  ...LUCKY_DUAL_TECHNIQUES,
  ...LUCKY_MECHANIC_MOVES,
  ...LUCKY_CHARGE_MOVES,
];
