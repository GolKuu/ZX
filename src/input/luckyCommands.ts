import { LUCK_ENHANCED_COST } from '../data/lucky/luck.js';
import { LUCKY_MOVE_IDS } from '../data/lucky/moves.js';
import { LUCKY_SPECIAL_IDS } from '../data/lucky/specials.js';
import { LUCKY_SUPER_IDS } from '../data/lucky/supers.js';
import type { CommandRow } from './command.js';
import { TAUNT_COMMAND } from './sharedCommands.js';

const hasLuck = (cost: number) => ({ gauge }: { readonly gauge: number }) => (
  gauge >= cost
);

export const LUCKY_COMMANDS: readonly CommandRow[] = [
  {
    moveId: LUCKY_SUPER_IDS.impossibleOutcome,
    motion: 'none',
    button: 'ultimate',
    stance: 'any',
    available: ({ ultimateReady, gauge, superMeter }) => (
      superMeter >= 100 && (ultimateReady === true || gauge >= 75)
    ),
  },
  {
    moveId: LUCKY_SUPER_IDS.houseAdvantage,
    motion: 'none',
    button: 'super',
    stance: 'any',
    available: ({ superMeter }) => superMeter >= 100,
  },
  {
    moveId: LUCKY_SUPER_IDS.winningStreak,
    motion: 'none',
    button: 'super',
    stance: 'any',
    available: ({ superMeter }) => superMeter >= 34,
  },
  TAUNT_COMMAND,
  enhanced(LUCKY_SPECIAL_IDS.enhancedCounter, 'dp', 'lp', 25),
  enhanced(LUCKY_SPECIAL_IDS.enhancedRush, 'qcf', 'hk', 75),
  enhanced(LUCKY_SPECIAL_IDS.enhancedBreak, 'qcb', 'hk', 50),
  enhanced(LUCKY_SPECIAL_IDS.enhancedShift, 'qcb', 'hp', 25),
  enhanced(LUCKY_SPECIAL_IDS.enhancedStrike, 'qcf', 'hp', 25),
  enhanced(LUCKY_SPECIAL_IDS.enhancedStep, 'qcf', 'lp', 25),
  command(LUCKY_SPECIAL_IDS.riskyCounter, 'dp', 'lp'),
  command(LUCKY_SPECIAL_IDS.jackpotRush, 'qcf', 'hk'),
  command(LUCKY_SPECIAL_IDS.fortuneBreak, 'qcb', 'hk'),
  command(LUCKY_SPECIAL_IDS.probabilityShift, 'qcb', 'hp'),
  command(LUCKY_SPECIAL_IDS.loadedStrike, 'qcf', 'hp'),
  command(LUCKY_SPECIAL_IDS.luckyStep, 'qcf', 'lp'),
  normal(LUCKY_MOVE_IDS.crouchLight, 'lp', 'crouching'),
  normal(LUCKY_MOVE_IDS.crouchMedium, 'lk', 'crouching'),
  normal(LUCKY_MOVE_IDS.crouchHeavy, 'hp', 'crouching'),
  normal(LUCKY_MOVE_IDS.sweep, 'hk', 'crouching'),
  normal(LUCKY_MOVE_IDS.quickDraw, 'lp', 'standing'),
  normal(LUCKY_MOVE_IDS.loadedShoulder, 'lk', 'standing'),
  normal(LUCKY_MOVE_IDS.slidingBet, 'hp', 'standing'),
  normal(LUCKY_MOVE_IDS.fortuneHeel, 'hk', 'standing'),
];

function normal(
  moveId: string,
  button: CommandRow['button'],
  stance: 'standing' | 'crouching',
): CommandRow {
  return {
    moveId,
    motion: 'none',
    button,
    stance,
    forbiddenPressed: ['super'],
  };
}

function command(
  moveId: string,
  motion: CommandRow['motion'],
  button: CommandRow['button'],
): CommandRow {
  return { moveId, motion, button, stance: 'any', forbiddenPressed: ['super'] };
}

function enhanced(
  moveId: string,
  motion: CommandRow['motion'],
  button: CommandRow['button'],
  cost = LUCK_ENHANCED_COST,
): CommandRow {
  return {
    moveId,
    motion,
    button,
    stance: 'any',
    requiresModifier: true,
    available: hasLuck(cost),
  };
}
