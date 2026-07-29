import type { AiLoadout } from '../ai/types.js';
import { fixed } from '../sim/math.js';
import { IDOL_MOVE_IDS } from './idol-combat-moves.js';

export const IDOL_AI_LOADOUT: AiLoadout = {
  neutral: [
    option(IDOL_MOVE_IDS.lp, 0, 1.18, 35, 'microphone-jab'),
    option(IDOL_MOVE_IDS.lk, 0.55, 1.35, 30, 'low-slide'),
    option(IDOL_MOVE_IDS.hp, 0.8, 1.58, 20, 'star-swing'),
    option(IDOL_MOVE_IDS.hk, 0.82, 1.7, 15, 'performance-spin'),
  ],
  whiffPunishes: [
    option(IDOL_MOVE_IDS.hp, 0.6, 1.58, 45, 'star-counter'),
    option(IDOL_MOVE_IDS.hk, 0.72, 1.7, 55, 'spin-counter'),
  ],
  combos: [
    {
      moves: [
        IDOL_MOVE_IDS.lp,
        IDOL_MOVE_IDS.lk,
        IDOL_MOVE_IDS.hp,
        IDOL_MOVE_IDS.hk,
      ],
    },
    {
      moves: [IDOL_MOVE_IDS.lk, IDOL_MOVE_IDS.hp, IDOL_MOVE_IDS.hk],
    },
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
