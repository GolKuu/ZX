/**
 * Stable public facade for Glitch. The implementation is split by move family
 * in `src/data/glitch/`; legacy aliases keep renderer and saved bindings valid.
 */
import {
  GLITCH_MOVE_IDS as COMPLETE_IDS,
  GLITCH_NORMAL_IDS,
  GLITCH_SPECIAL_IDS,
} from './glitch/ids.js';

export {
  GLITCH_ANIMATION_SPEED,
  GLITCH_MOVES,
  GLITCH_MOVE_DEFINITIONS,
} from './glitch/index.js';
export {
  GLITCH_AIR_RULES,
  GLITCH_DEFENSE_STATES,
  GLITCH_DEFENSE_RULES,
  GLITCH_HURTBOXES,
  GLITCH_MAX_HEALTH,
  GLITCH_MOVEMENT,
  GLITCH_STATS,
} from './glitch/character.js';

export const GLITCH_MOVE_IDS = {
  ...COMPLETE_IDS,
  lp: GLITCH_NORMAL_IDS.phaseJab,
  hp: GLITCH_NORMAL_IDS.breakpointAxe,
  lk: GLITCH_NORMAL_IDS.riftElbow,
  hk: GLITCH_NORMAL_IDS.lowVectorSweep,
  packetLoss: GLITCH_SPECIAL_IDS.realitySlice,
  corruptedZone: GLITCH_SPECIAL_IDS.phaseBreak,
  desyncJump: GLITCH_SPECIAL_IDS.riftUppercut,
} as const;
