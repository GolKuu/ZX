export const LUCKY_DEFENSE_STATES = [
  'stand-block-start',
  'stand-block-hold',
  'stand-block-light-impact',
  'stand-block-heavy-impact',
  'stand-block-release',
  'crouch-block-start',
  'crouch-block-hold',
  'crouch-block-light-impact',
  'crouch-block-heavy-impact',
  'crouch-block-release',
  'air-block',
  'cross-up-block-turn',
  'chip-reaction',
  'guard-crush',
  'guard-break',
  'throw-escape',
  'block-stun-recovery',
  'lucky-guard',
  'failed-lucky-guard',
] as const;

export type LuckyDefenseState = (typeof LUCKY_DEFENSE_STATES)[number];

export const LUCKY_GUARD_TIMING = {
  perfectWindowFrames: 3,
  luckReward: 4,
  failedBlockstunPenalty: 5,
} as const;
