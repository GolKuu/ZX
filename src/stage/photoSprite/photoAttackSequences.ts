import { photoAttackKind } from './photoKickAnimation.js';

const COLUMNS = 4;
const frame = (row: number, column: number): number => row * COLUMNS + column;

const IDLE = frame(0, 0);
const IDLE_SETTLE = frame(0, 1);
const HAND_WINDUP = frame(2, 0);
const LEAD_HAND_CONTACT = frame(2, 1);
const REAR_HAND_CONTACT = frame(2, 2);
const SWEEP_CONTACT = frame(2, 3);
const STANDING_GUARD = frame(1, 0);
const CROUCH_GUARD = frame(1, 1);
const LEG_CHAMBER = frame(1, 2);
const LEAD_LEG_CONTACT = frame(3, 0);
const REAR_LEG_CONTACT = frame(3, 1);
const UPPERCUT_CONTACT = frame(3, 2);

/**
 * Full nine-beat cycles: approach, contact, and recovery are button-specific.
 *
 * The two hand cycles share no drawing, and neither do the two leg cycles —
 * only `IDLE` at either end is common. That is deliberate and it is the point
 * of the table. The lead-hand and rear-hand *contact* cells in the atlas are
 * near-identical silhouettes, so when J and K also wound up and recovered
 * through the same two drawings, the entire nine-frame cycle was the same
 * picture twice and no amount of body motion could separate them.
 *
 * The knee-up chamber belongs to the rear leg, which has the whole width of
 * the stance to cross before it arrives. The lead leg loads by sinking into
 * the crouched guard instead, which is also what its motion curve does.
 */
const ATTACK_SEQUENCES = {
  jab: [
    IDLE, HAND_WINDUP, HAND_WINDUP,
    LEAD_HAND_CONTACT, LEAD_HAND_CONTACT, LEAD_HAND_CONTACT,
    HAND_WINDUP, HAND_WINDUP, IDLE,
  ],
  heavy: [
    IDLE, STANDING_GUARD, STANDING_GUARD,
    REAR_HAND_CONTACT, REAR_HAND_CONTACT, REAR_HAND_CONTACT,
    STANDING_GUARD, IDLE_SETTLE, IDLE,
  ],
  kick: [
    IDLE, IDLE_SETTLE, CROUCH_GUARD,
    LEAD_LEG_CONTACT, LEAD_LEG_CONTACT, LEAD_LEG_CONTACT,
    CROUCH_GUARD, IDLE_SETTLE, IDLE,
  ],
  highKick: [
    IDLE, STANDING_GUARD, LEG_CHAMBER,
    REAR_LEG_CONTACT, REAR_LEG_CONTACT, REAR_LEG_CONTACT,
    LEG_CHAMBER, STANDING_GUARD, IDLE,
  ],
  sweep: [
    IDLE, IDLE_SETTLE, CROUCH_GUARD,
    SWEEP_CONTACT, SWEEP_CONTACT, SWEEP_CONTACT,
    CROUCH_GUARD, IDLE_SETTLE, IDLE,
  ],
  uppercut: [
    IDLE, CROUCH_GUARD, UPPERCUT_CONTACT, UPPERCUT_CONTACT, UPPERCUT_CONTACT,
    UPPERCUT_CONTACT, STANDING_GUARD, STANDING_GUARD, IDLE,
  ],
} as const;

export function photoAttackSequence(moveId: string): readonly number[] {
  return ATTACK_SEQUENCES[photoAttackKind(moveId)];
}
