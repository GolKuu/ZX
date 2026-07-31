import type { AiLoadout } from '../../ai/types.js';
import { fixed } from '../../sim/math.js';
import { LUCKY_MOVE_IDS } from './moves.js';
import { LUCKY_SPECIAL_IDS } from './specials.js';

export const LUCKY_AI_LOADOUT: AiLoadout = {
  neutral: [
    option(LUCKY_MOVE_IDS.quickDraw, 0, 1.05, 30, 'quick-draw'),
    option(LUCKY_MOVE_IDS.slidingBet, 0.5, 1.5, 22, 'sliding-bet'),
    option(LUCKY_MOVE_IDS.loadedShoulder, 0.4, 1.3, 24, 'loaded-shoulder'),
    option(LUCKY_SPECIAL_IDS.probabilityShift, 1.1, 2.4, 10, 'probability-shift'),
  ],
  whiffPunishes: [
    option(LUCKY_MOVE_IDS.fortuneHeel, 0.45, 1.25, 28, 'fortune-heel'),
    option(LUCKY_SPECIAL_IDS.loadedStrike, 0.5, 1.55, 34, 'loaded-punish'),
  ],
  combos: [
    { moves: [LUCKY_MOVE_IDS.quickDraw, LUCKY_MOVE_IDS.loadedShoulder, LUCKY_MOVE_IDS.fortuneHeel] },
    { moves: [LUCKY_MOVE_IDS.slidingBet, LUCKY_SPECIAL_IDS.loadedStrike] },
    { moves: [LUCKY_MOVE_IDS.quickDraw, LUCKY_SPECIAL_IDS.jackpotRush] },
  ],
};

function option(
  moveId: string,
  minimum: number,
  maximum: number,
  weight: number,
  cue: string,
) {
  return {
    moveId,
    minimumDistance: fixed(minimum),
    maximumDistance: fixed(maximum),
    weight,
    cue,
  };
}
