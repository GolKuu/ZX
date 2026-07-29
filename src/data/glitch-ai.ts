import type { AiLoadout } from '../ai/types.js';
import { fixed } from '../sim/math.js';
import { GLITCH_MOVE_IDS } from './glitch-combat-moves.js';

export const GLITCH_AI_LOADOUT: AiLoadout = {
  neutral: [
    option(GLITCH_MOVE_IDS.lp, 0, 1.15, 30, 'pixel-poke'),
    option(GLITCH_MOVE_IDS.lk, 0.45, 1.35, 24, 'bug-sweep'),
    option(GLITCH_MOVE_IDS.hp, 0.72, 1.55, 16, 'artifact-smash'),
    option(GLITCH_MOVE_IDS.hk, 0.76, 1.68, 14, 'data-burst'),
    option(GLITCH_MOVE_IDS.packetLoss, 1.35, 3.25, 10, 'packet-loss'),
    option(GLITCH_MOVE_IDS.corruptedZone, 0.9, 2.35, 6, 'corrupted-zone'),
  ],
  whiffPunishes: [
    option(GLITCH_MOVE_IDS.hp, 0.52, 1.58, 30, 'artifact-counter'),
    option(GLITCH_MOVE_IDS.hk, 0.68, 1.72, 34, 'burst-counter'),
    option(GLITCH_MOVE_IDS.desyncJump, 0.7, 1.7, 36, 'desync-counter'),
  ],
  combos: [
    {
      moves: [
        GLITCH_MOVE_IDS.lp,
        GLITCH_MOVE_IDS.lk,
        GLITCH_MOVE_IDS.hp,
        GLITCH_MOVE_IDS.hk,
      ],
    },
    { moves: [GLITCH_MOVE_IDS.lp, GLITCH_MOVE_IDS.packetLoss] },
    {
      moves: [
        GLITCH_MOVE_IDS.lk,
        GLITCH_MOVE_IDS.hp,
        GLITCH_MOVE_IDS.corruptedZone,
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
