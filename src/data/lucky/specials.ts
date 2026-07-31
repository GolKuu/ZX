import type { MoveFrameData } from '../../sim/frame-data.js';
import { luckyMove } from './moveBuilder.js';

export const LUCKY_SPECIAL_IDS = {
  luckyStep: 'lucky.special.step',
  loadedStrike: 'lucky.special.loaded-strike',
  probabilityShift: 'lucky.special.probability-shift',
  riskyCounter: 'lucky.special.risky-counter',
  fortuneBreak: 'lucky.special.fortune-break',
  jackpotRush: 'lucky.special.jackpot-rush',
  enhancedStep: 'lucky.enhanced.step',
  enhancedStrike: 'lucky.enhanced.loaded-strike',
  enhancedShift: 'lucky.enhanced.probability-shift',
  enhancedCounter: 'lucky.enhanced.risky-counter',
  enhancedBreak: 'lucky.enhanced.fortune-break',
  enhancedRush: 'lucky.enhanced.jackpot-rush',
} as const;

const I = LUCKY_SPECIAL_IDS;

export const LUCKY_SPECIAL_MOVES: readonly MoveFrameData[] = [
  spec(I.luckyStep, 8, 3, 13, 34, 1.08),
  spec(I.loadedStrike, 14, 5, 21, 76, 1.18),
  spec(I.probabilityShift, 18, 6, 18, 58, 1.52),
  counter(I.riskyCounter, 11, 3, 24, 66),
  spec(I.fortuneBreak, 19, 6, 26, 92, 1.22, true),
  spec(I.jackpotRush, 16, 9, 28, 110, 1.48, true),
  spec(I.enhancedStep, 6, 4, 9, 46, 1.25),
  spec(I.enhancedStrike, 11, 6, 16, 94, 1.36, true),
  spec(I.enhancedShift, 14, 8, 14, 78, 1.8, true),
  counter(I.enhancedCounter, 8, 4, 18, 90),
  spec(I.enhancedBreak, 15, 7, 20, 124, 1.46, true),
  spec(I.enhancedRush, 12, 12, 22, 158, 1.72, true),
];

function spec(
  id: string,
  startup: number,
  active: number,
  recovery: number,
  damage: number,
  reach: number,
  launch = false,
): MoveFrameData {
  return luckyMove({ id, startup, active, recovery, damage, level: 'mid', reach, height: 1.02, launch });
}

function counter(
  id: string,
  startup: number,
  active: number,
  recovery: number,
  damage: number,
): MoveFrameData {
  return {
    ...spec(id, startup, active, recovery, damage, 0.86, true),
    counter: {
      frames: { from: 2, toExclusive: startup },
      into: id,
      attackerHitstop: 12,
    },
  };
}
