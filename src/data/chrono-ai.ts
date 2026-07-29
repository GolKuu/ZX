import type { AiLoadout } from '../ai/types.js';
import { fixed } from '../sim/math.js';
import { CHRONO_MOVE_IDS } from './chrono-combat-moves.js';

export const CHRONO_AI_LOADOUT: AiLoadout = {
  neutral: [
    option(CHRONO_MOVE_IDS.lp, 0, 1.18, 38, 'time-jab'),
    option(CHRONO_MOVE_IDS.lk, 0.45, 1.4, 28, 'time-sweep'),
    option(CHRONO_MOVE_IDS.hp, 0.72, 1.78, 20, 'temporal-strike'),
    option(CHRONO_MOVE_IDS.hk, 0.78, 1.72, 14, 'chrono-roundhouse'),
  ],
  whiffPunishes: [
    option(CHRONO_MOVE_IDS.hp, 0.64, 1.78, 48, 'temporal-counter'),
    option(CHRONO_MOVE_IDS.hk, 0.7, 1.72, 52, 'roundhouse-counter'),
  ],
  combos: [
    {
      moves: [
        CHRONO_MOVE_IDS.lp,
        CHRONO_MOVE_IDS.lk,
        CHRONO_MOVE_IDS.hp,
        CHRONO_MOVE_IDS.hk,
      ],
    },
    {
      moves: [
        CHRONO_MOVE_IDS.lk,
        CHRONO_MOVE_IDS.hp,
        CHRONO_MOVE_IDS.hk,
      ],
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
