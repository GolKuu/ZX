import type { AiLoadout } from '../ai/types.js';
import { fixed } from '../sim/math.js';
import { ECHO_MOVE_IDS } from './echo-combat-moves.js';

export const ECHO_AI_LOADOUT: AiLoadout = {
  neutral: [
    option(ECHO_MOVE_IDS.lp, 0, 1.18, 36, 'data-jab'),
    option(ECHO_MOVE_IDS.lk, 0.55, 1.42, 28, 'sweep'),
    option(ECHO_MOVE_IDS.hk, 0.8, 1.72, 22, 'forward-kick'),
    option(ECHO_MOVE_IDS.hp, 0.72, 1.68, 14, 'prediction'),
  ],
  whiffPunishes: [
    option(ECHO_MOVE_IDS.hp, 0.55, 1.7, 58, 'prediction-counter'),
    option(ECHO_MOVE_IDS.hk, 0.78, 1.76, 42, 'kick-counter'),
  ],
  combos: [
    {
      moves: [ECHO_MOVE_IDS.lp, ECHO_MOVE_IDS.lk, ECHO_MOVE_IDS.hk],
    },
    {
      moves: [ECHO_MOVE_IDS.lp, ECHO_MOVE_IDS.hp],
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
