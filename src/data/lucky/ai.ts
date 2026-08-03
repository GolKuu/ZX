import type { AiLoadout, AiMoveOption } from '../../ai/types.js';
import { fixed } from '../../sim/math.js';
import { LUCKY_MOVE_IDS, LUCKY_SPECIAL_IDS } from './ids.js';

/**
 * Lucky's AI loadout.
 *
 * Every id here also appears in `LUCKY_CATALOGUE`, which
 * `tests/lucky-input.test.mjs` asserts. The AI is not allowed a private
 * vocabulary: if the CPU can do it, the player has a key sequence for it.
 *
 * The AI still names moves by id rather than synthesising key presses — that is
 * the existing architecture — so the reachability test is what keeps the two
 * sets equal, not the calling convention.
 */

const ID = LUCKY_MOVE_IDS;
const SP = LUCKY_SPECIAL_IDS;

export const LUCKY_AI_LOADOUT: AiLoadout = {
  neutral: [
    option(ID.quickDraw, 0, 1.05, 30, 'quick-draw'),
    option(ID.crouchingShinKick, 0, 0.95, 22, 'shin-kick'),
    option(ID.slidingBet, 0.5, 1.5, 22, 'sliding-bet'),
    option(ID.loadedShoulder, 0.4, 1.3, 24, 'loaded-shoulder'),
    option(ID.doubleTap, 0.5, 1.4, 18, 'double-tap'),
    option(ID.throw, 0, 0.6, 14, 'throw'),
    option(SP.probabilityShift, 1.1, 2.4, 10, 'probability-shift'),
    option(SP.slidingFortune, 0.9, 2.0, 12, 'sliding-fortune'),
  ],
  whiffPunishes: [
    option(ID.fortuneHeel, 0.45, 1.25, 28, 'fortune-heel'),
    option(ID.sweepTheTable, 0.4, 1.2, 20, 'sweep'),
    option(SP.loadedStrike, 0.5, 1.55, 34, 'loaded-punish'),
    // Gated on the Luck it actually costs, so the AI cannot spend what it has
    // not earned any more than the player can.
    {
      ...option(SP.jackpotRush, 0.5, 1.6, 26, 'jackpot-rush'),
      minimumResource: 25,
    },
  ],
  // Every route is a chain the authored cancel windows actually allow;
  // `tests/roster-ai-loadouts.test.mjs` rejects any that are not.
  combos: [
    { moves: [ID.quickDraw, ID.loadedShoulder, ID.fortuneHeel] },
    { moves: [ID.lowPalm, ID.crouchingShinKick, ID.sweepTheTable] },
    { moves: [ID.quickDraw, ID.doubleTap, SP.loadedStrike] },
    { moves: [ID.loadedShoulder, SP.loadedStrike] },
  ],
};

function option(
  moveId: string,
  minimum: number,
  maximum: number,
  weight: number,
  cue: string,
): AiMoveOption {
  return {
    moveId,
    minimumDistance: fixed(minimum),
    maximumDistance: fixed(maximum),
    weight,
    cue,
  };
}
