import type { MoveFrameData } from '../sim/frame-data.js';

/** One taunt for the whole roster; the voice line is what differs. */
export const TAUNT_MOVE_ID = 'taunt';

/**
 * A pose with no hitbox. The recovery is long enough to be a real risk — a
 * taunt is a bet that the opponent cannot reach you, not a free animation.
 */
export const TAUNT_MOVES: readonly MoveFrameData[] = [
  {
    id: TAUNT_MOVE_ID,
    startup: 10,
    active: 1,
    recovery: 44,
    hitboxes: [],
  },
];
