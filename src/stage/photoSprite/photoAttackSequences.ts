import { photoAttackKind } from './photoKickAnimation.js';

const COLUMNS = 4;
const frame = (row: number, column: number): number => row * COLUMNS + column;

const IDLE = frame(0, 0);
const HAND_WINDUP = frame(2, 0);
const LEAD_HAND_CONTACT = frame(2, 1);
const REAR_HAND_CONTACT = frame(2, 2);
const STANDING_GUARD = frame(1, 0);
const CROUCH_GUARD = frame(1, 1);
const LEG_CHAMBER = frame(1, 2);
const LEAD_LEG_CONTACT = frame(3, 0);
const REAR_LEG_CONTACT = frame(3, 1);

/** Full nine-beat cycles: approach, contact, and recovery are button-specific. */
const ATTACK_SEQUENCES = {
  jab: [IDLE, HAND_WINDUP, HAND_WINDUP, LEAD_HAND_CONTACT, LEAD_HAND_CONTACT, LEAD_HAND_CONTACT, HAND_WINDUP, HAND_WINDUP, IDLE],
  heavy: [IDLE, STANDING_GUARD, HAND_WINDUP, REAR_HAND_CONTACT, REAR_HAND_CONTACT, REAR_HAND_CONTACT, HAND_WINDUP, STANDING_GUARD, IDLE],
  kick: [IDLE, CROUCH_GUARD, LEG_CHAMBER, LEAD_LEG_CONTACT, LEAD_LEG_CONTACT, LEAD_LEG_CONTACT, LEG_CHAMBER, CROUCH_GUARD, IDLE],
  highKick: [IDLE, STANDING_GUARD, LEG_CHAMBER, REAR_LEG_CONTACT, REAR_LEG_CONTACT, REAR_LEG_CONTACT, LEG_CHAMBER, STANDING_GUARD, IDLE],
  sweep: [IDLE, CROUCH_GUARD, frame(2, 3), frame(2, 3), frame(2, 3), frame(2, 3), CROUCH_GUARD, CROUCH_GUARD, IDLE],
  uppercut: [IDLE, CROUCH_GUARD, frame(3, 2), frame(3, 2), frame(3, 2), frame(3, 2), STANDING_GUARD, STANDING_GUARD, IDLE],
} as const;

export function photoAttackSequence(moveId: string): readonly number[] {
  return ATTACK_SEQUENCES[photoAttackKind(moveId)];
}
