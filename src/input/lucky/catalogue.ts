/**
 * Lucky's complete command catalogue — one row per reachable action.
 *
 * This file is the single source of truth for three things that must never
 * disagree: what the command table matches, what the in-game move list prints,
 * and what the tests assert. Deriving all three from one array is the only way
 * the brief's "the input list disagrees with runtime behaviour" failure mode
 * becomes structurally impossible rather than a review duty.
 *
 * ORDER IS PRIORITY. Rows are matched top to bottom, so the ultimate sits above
 * the supers, the supers above the enhanced specials, and the bare normals sit
 * last. `exactChord` makes rows with different button sets mutually exclusive,
 * so only rows sharing a chord actually compete, and those are ordered
 * motion-first.
 */

import type { MotionId } from '../motion.js';
import {
  LUCKY_LUCK_IDS as LUCK,
  LUCKY_MOVE_IDS as ID,
  LUCKY_SPECIAL_IDS as SP,
} from '../../data/lucky/ids.js';
import {
  LUCKY_JACKPOT_STREAK_ID,
  LUCKY_SUPER_IDS as SUPER,
} from '../../data/lucky/supers.js';
import {
  LUCKY_BUTTON_LIMB,
  type LuckyButton,
  type LuckyLimb,
} from './buttons.js';

export type LuckyCategory =
  | 'movement'
  | 'normal'
  | 'directional'
  | 'crouching'
  | 'aerial'
  | 'throw'
  | 'dual'
  | 'mechanic'
  | 'charge'
  | 'special'
  | 'enhanced'
  | 'super'
  | 'ultimate';

/** Facing-relative direction that must be held when the chord commits. */
export type LuckyDirection = 'forward' | 'back' | 'down' | 'up';

export interface LuckyCommandSpec {
  readonly moveId: string;
  readonly name: string;
  /**
   * The chord, role button first.
   *
   * `buttons[0]` decides the move's identity and therefore its limb: in
   * `L+K` the heel belongs to L and K only pays the Luck. Everything after the
   * first entry is a modifier, never a limb selector.
   */
  readonly buttons: readonly LuckyButton[];
  readonly motion: MotionId;
  readonly direction?: LuckyDirection;
  readonly stance: 'standing' | 'crouching' | 'air' | 'any';
  /** Which part of the body strikes. `none` for the Luck verbs. */
  readonly limb: LuckyLimb | 'none';
  readonly category: LuckyCategory;
  /** Luck spent, matching the move's own `resourceCost`. */
  readonly luckCost?: number;
  /** Minimum Luck required without being spent. */
  readonly luckRequired?: number;
  readonly meterCost?: number;
  readonly requiresUltimate?: boolean;
  readonly description: string;
}

const J: LuckyButton = 'J';
const K: LuckyButton = 'K';
const I: LuckyButton = 'I';
const L: LuckyButton = 'L';

export const LUCKY_CATALOGUE: readonly LuckyCommandSpec[] = [
  // ---------------------------------------------------------------- ultimate
  {
    moveId: SUPER.impossibleOutcome,
    name: 'Impossible Outcome',
    buttons: [J, K, I, L],
    motion: 'none',
    stance: 'any',
    limb: 'upper',
    category: 'ultimate',
    meterCost: 100,
    requiresUltimate: true,
    description:
      'All four buttons. Needs a full bar and either high Luck or critical '
      + 'health; the cinematic only plays once the starter has physically hit.',
  },
  {
    // Fallback for keyboards that cannot register four simultaneous keys.
    moveId: SUPER.impossibleOutcome,
    name: 'Impossible Outcome (motion)',
    buttons: [J, K],
    motion: 'qcf2',
    stance: 'any',
    limb: 'upper',
    category: 'ultimate',
    meterCost: 100,
    requiresUltimate: true,
    description:
      'Double quarter-circle forward plus J+K. Identical to the four-button '
      + 'command, for keyboards that ghost on four keys.',
  },

  // ------------------------------------------------------------------ supers
  {
    moveId: LUCKY_JACKPOT_STREAK_ID,
    name: 'Winning Streak — Jackpot',
    buttons: [J, K, I],
    motion: 'none',
    stance: 'any',
    limb: 'upper',
    category: 'super',
    meterCost: 34,
    luckRequired: 75,
    description:
      'The Jackpot form of Super 1, available while Luck is at 75 or above. '
      + 'Same command; the upgrade is visible on the Luck meter before it is '
      + 'spent.',
  },
  {
    moveId: SUPER.winningStreak,
    name: 'Winning Streak',
    buttons: [J, K, I],
    motion: 'none',
    stance: 'any',
    limb: 'upper',
    category: 'super',
    meterCost: 34,
    description:
      'Super 1. An accelerating confirmed sequence — the properties scale '
      + 'inside fixed Luck bands, never into an unblockable.',
  },
  {
    moveId: SUPER.houseAdvantage,
    name: 'House Advantage',
    buttons: [K, I, L],
    motion: 'none',
    stance: 'any',
    limb: 'upper',
    category: 'super',
    meterCost: 100,
    description:
      'Super 2. Temporarily raises Luck generation and opens extra cancel '
      + 'routes for a visible, timed duration.',
  },
  {
    moveId: LUCKY_JACKPOT_STREAK_ID,
    name: 'Winning Streak — Jackpot (motion)',
    buttons: [J, K],
    motion: 'qcf',
    stance: 'any',
    limb: 'upper',
    category: 'super',
    meterCost: 34,
    luckRequired: 75,
    description: 'Motion form of the Jackpot Super 1.',
  },
  {
    moveId: SUPER.winningStreak,
    name: 'Winning Streak (motion)',
    buttons: [J, K],
    motion: 'qcf',
    stance: 'any',
    limb: 'upper',
    category: 'super',
    meterCost: 34,
    description:
      'Motion form of Super 1. Shares its command with Enhanced Lucky Step '
      + 'and wins while the energy bar can pay for it.',
  },
  {
    moveId: SUPER.houseAdvantage,
    name: 'House Advantage (motion)',
    buttons: [K, L],
    motion: 'qcb',
    stance: 'any',
    limb: 'upper',
    category: 'super',
    meterCost: 100,
    description: 'Motion form of Super 2.',
  },

  // ------------------------------------------------------------------ charge
  {
    moveId: ID.chargeShoulder,
    name: 'Probability Shoulder',
    buttons: [K],
    motion: 'chargeBackForward',
    stance: 'standing',
    limb: 'upper',
    category: 'charge',
    description:
      'Hold Back for 40 frames, then Forward + K. A charged shoulder with a '
      + 'wall bounce; the charge cue is visible before it is released.',
  },
  {
    moveId: ID.chargeRisingHeel,
    name: 'Charged Rising Heel',
    buttons: [L],
    motion: 'chargeDownUp',
    stance: 'standing',
    limb: 'leg',
    category: 'charge',
    description:
      'Hold Down for 40 frames, then Up + L. Anti-air with a short '
      + 'invulnerable window and long recovery.',
  },

  // -------------------------------------------------------- enhanced special
  enhanced(SP.enhancedStep, 'Enhanced Lucky Step', [J, K], 'qcf', 25,
    'Faster, further, and briefly invulnerable. Loses the command to Winning '
    + 'Streak whenever the energy bar is full enough to pay for it.'),
  enhanced(SP.enhancedStrike, 'Enhanced Loaded Strike', [K, I], 'qcf', 25,
    'Launching version of the shoulder. Still an upper-body strike.'),
  enhanced(SP.enhancedSliding, 'Enhanced Sliding Fortune', [I, L], 'qcf', 25,
    'Longer low slide with a bigger low-profile window.'),
  enhanced(SP.enhancedBreak, 'Enhanced Fortune Break', [L, K], 'qcf', 50,
    'Heaviest single leg attack; wall bounce, and the recovery to match.'),
  enhanced(SP.enhancedShift, 'Enhanced Probability Shift', [J, I], 'qcb', 25,
    'Longer reposition with a wider — but still closing — invulnerable window.'),
  enhanced(SP.enhancedCounter, 'Enhanced Risky Counter', [J, K], 'qcb', 25,
    'Faster counter window. Beaten by throws exactly like the base version.'),
  enhanced(SP.enhancedRush, 'Enhanced Jackpot Rush', [J, K], 'dp', 75,
    'Four-hit hand sequence. Has a cooldown, so it cannot become a loop.'),
  enhanced(SP.enhancedRising, 'Enhanced Fortune Rising', [I, L], 'dp', 50,
    'Longer invulnerable rise. Punishable for a very long time on block.'),

  // ----------------------------------------------------------------- special
  special(SP.luckyStep, 'Lucky Step', J, 'qcf',
    'Fast advance with a brief window that passes through high attacks.'),
  special(SP.loadedStrike, 'Loaded Strike', K, 'qcf',
    'Advancing shoulder. Strong pushback and guard pressure; no leg involved.'),
  special(SP.slidingFortune, 'Sliding Fortune', I, 'qcf',
    'Advancing low slide. Punishable on block.'),
  special(SP.fortuneBreak, 'Fortune Break', L, 'qcf',
    'Heavy leg special with a wall bounce and long recovery.'),
  special(SP.probabilityShift, 'Probability Shift', J, 'qcb',
    'Evasive reposition. The invulnerable window closes before the move does.'),
  special(SP.riskyCounter, 'Risky Counter', K, 'qcb',
    'Upper-body counter. Gains Luck on a read, loses to throws, long recovery '
    + 'when nothing arrives.'),
  {
    moveId: SP.jackpotRush,
    name: 'Jackpot Rush',
    buttons: [J],
    motion: 'dp',
    stance: 'standing',
    limb: 'upper',
    category: 'special',
    luckCost: 25,
    description:
      'Fast advancing hand sequence. Costs Luck and has a cooldown, so it is '
      + 'never permanently safe.',
  },
  special(SP.fortuneRising, 'Fortune Rising', L, 'dp',
    'Invulnerable rising heel. Anti-air, and hugely punishable when blocked.'),

  // ------------------------------------------------------------------ throws
  {
    moveId: ID.airThrow,
    name: 'Air Throw',
    buttons: [J, I],
    motion: 'none',
    stance: 'air',
    limb: 'upper',
    category: 'throw',
    description: 'J+I while airborne. Only catches airborne opponents.',
  },
  {
    moveId: ID.forwardThrow,
    name: 'Forward Throw',
    buttons: [J, I],
    motion: 'none',
    direction: 'forward',
    stance: 'standing',
    limb: 'upper',
    category: 'throw',
    description: 'Forward + J+I. Leaves the opponent in front.',
  },
  {
    moveId: ID.backThrow,
    name: 'Back Throw',
    buttons: [J, I],
    motion: 'none',
    direction: 'back',
    stance: 'standing',
    limb: 'upper',
    category: 'throw',
    description: 'Back + J+I. Switches sides — the corner escape.',
  },
  {
    moveId: ID.throw,
    name: 'Throw',
    buttons: [J, I],
    motion: 'none',
    stance: 'standing',
    limb: 'upper',
    category: 'throw',
    description:
      'J+I. Also the throw-escape command during the escape window.',
  },

  // ---------------------------------------------------------------- mechanic
  {
    moveId: LUCK.prepareOffense,
    name: 'Arm Offensive Modifier',
    buttons: [K, L],
    motion: 'none',
    direction: 'forward',
    stance: 'standing',
    limb: 'none',
    category: 'mechanic',
    description: 'Forward + K+L. Prepares the offensive Luck modifier.',
  },
  {
    moveId: LUCK.guard,
    name: 'Lucky Guard',
    buttons: [K, L],
    motion: 'none',
    direction: 'back',
    stance: 'standing',
    limb: 'none',
    category: 'mechanic',
    description:
      'Back + K+L just before impact. A read, not a shield: it beats strikes, '
      + 'loses to throws, rewards a little Luck, and leaves a long vulnerable '
      + 'pose when it is thrown out early.',
  },
  {
    moveId: LUCK.cancel,
    name: 'Cancel Modifier',
    buttons: [K, L],
    motion: 'none',
    direction: 'down',
    stance: 'crouching',
    limb: 'none',
    category: 'mechanic',
    description: 'Down + K+L. Drops the prepared modifier and refunds nothing.',
  },
  {
    moveId: LUCK.inspect,
    name: 'Read Probability',
    buttons: [K, L],
    motion: 'none',
    direction: 'up',
    stance: 'any',
    limb: 'none',
    category: 'mechanic',
    description: 'Up + K+L. Shows the current probability state.',
  },
  {
    moveId: LUCK.prepare,
    name: 'Prepare Modifier',
    buttons: [K, L],
    motion: 'none',
    stance: 'standing',
    limb: 'none',
    category: 'mechanic',
    description:
      'K+L. Commits the currently selected Luck modifier. Holding it cycles '
      + 'the available modifiers on the meter.',
  },

  // ------------------------------------------------------------------- duals
  {
    moveId: ID.loadedHands,
    name: 'Loaded Hands',
    buttons: [J, K],
    motion: 'none',
    stance: 'standing',
    limb: 'upper',
    category: 'dual',
    description:
      'J+K. Palm into elbow — both hits upper body. Punishable if the whole '
      + 'technique is blocked.',
  },
  {
    moveId: ID.fortuneLegs,
    name: 'Fortune Legs',
    buttons: [I, L],
    motion: 'none',
    stance: 'standing',
    limb: 'leg',
    category: 'dual',
    description:
      'I+L. Low shin kick into a launching heel. Only the second hit '
      + 'launches, so it cannot loop into itself.',
  },

  // ----------------------------------------------------------------- aerials
  aerial(ID.airPalm, 'Air Palm', J, 'upper', 'forward',
    'Forward + J in the air. Advancing palm.'),
  aerial(ID.airShoulder, 'Air Shoulder', K, 'upper', 'forward',
    'Forward + K in the air. Air-to-air shoulder.'),
  aerial(ID.airDownKick, 'Air Down Kick', I, 'leg', 'down',
    'Down + I in the air. Steep downward kick.'),
  aerial(ID.airDescendingHeel, 'Descending Heel', L, 'leg', 'down',
    'Down + L in the air. Heavy descending heel, knocks down.'),
  aerial(ID.airJab, 'Air Jab', J, 'upper', undefined,
    'J in the air. Fastest air option.'),
  aerial(ID.airHammer, 'Air Hammer', K, 'upper', undefined,
    'K in the air. Downward arm strike — an arm, not a leg.'),
  aerial(ID.airQuickKick, 'Air Quick Kick', I, 'leg', undefined,
    'I in the air. Fast air kick.'),
  aerial(ID.airHeavyHeel, 'Air Heavy Heel', L, 'leg', undefined,
    'L in the air. Heavy heel; the air-to-ground conversion.'),

  // --------------------------------------------------------------- crouching
  // Down + button and S + button are the same physical input, so these four
  // rows serve both of the brief's lists.
  crouching(ID.lowPalm, 'Low Palm', J, 'upper',
    'Down + J. Crouching palm; low-profile interruption.'),
  crouching(ID.risingHand, 'Rising Hand', K, 'upper',
    'Down + K. Crouching anti-air with the arm and shoulder — never a kick.'),
  crouching(ID.crouchingShinKick, 'Crouching Shin Kick', I, 'leg',
    'Down + I. Fast crouching low and a combo starter.'),
  crouching(ID.sweepTheTable, 'Sweep the Table', L, 'leg',
    'Down + L. Heavy sweep, knocks down, punishable on block.'),

  // ------------------------------------------------------------- directional
  directional(ID.doubleTap, 'Double Tap', J, 'upper', 'forward',
    'Forward + J. Advancing two-hit hand poke; shorter than K, faster than K.'),
  directional(ID.loadedHook, 'Loaded Hook', K, 'upper', 'forward',
    'Forward + K. Heavy advancing hand strike with high pushback.'),
  directional(ID.runningLowKick, 'Running Low Kick', I, 'leg', 'forward',
    'Forward + I. Advancing low; travels further, worse on block.'),
  directional(ID.fortuneBreaker, 'Fortune Breaker', L, 'leg', 'forward',
    'Forward + L. Heavy advancing leg; wall splat on counter hit.'),
  directional(ID.checkHand, 'Check Hand', J, 'upper', 'back',
    'Back + J. Retreating poke. Low damage, strong spacing.'),
  directional(ID.probabilityCounter, 'Probability Counter', K, 'upper', 'back',
    'Back + K. Upper-body counter stance. Loses to throws; short window.'),
  directional(ID.retreatingHeel, 'Retreating Heel', I, 'leg', 'back',
    'Back + I. Retreating leg attack; punishable on whiff.'),
  directional(ID.reversalKick, 'Reversal Kick', L, 'leg', 'back',
    'Back + L. Moves away under close attacks; lows and delays beat it.'),

  // ------------------------------------------------------- standing normals
  standing(ID.quickDraw, 'Quick Draw', J, 'upper',
    'J. 5/3/9. Fast hand poke and combo starter; a little Luck on hit.'),
  standing(ID.loadedShoulder, 'Loaded Shoulder', K, 'upper',
    'K. 10/4/14. Advancing mid shoulder with strong pushback.'),
  standing(ID.slidingBet, 'Sliding Bet', I, 'leg',
    'I. 12/5/16. Low-profile advancing low kick.'),
  standing(ID.fortuneHeel, 'Fortune Heel', L, 'leg',
    'L. 15/5/17. Anti-air launcher heel.'),
];

function enhanced(
  moveId: string,
  name: string,
  buttons: readonly [LuckyButton, LuckyButton],
  motion: MotionId,
  luckCost: number,
  description: string,
): LuckyCommandSpec {
  return {
    moveId,
    name,
    buttons,
    motion,
    stance: 'standing',
    limb: LUCKY_BUTTON_LIMB[buttons[0]],
    category: 'enhanced',
    luckCost,
    description,
  };
}

function special(
  moveId: string,
  name: string,
  button: LuckyButton,
  motion: MotionId,
  description: string,
): LuckyCommandSpec {
  return {
    moveId,
    name,
    buttons: [button],
    motion,
    stance: 'standing',
    limb: LUCKY_BUTTON_LIMB[button],
    category: 'special',
    description,
  };
}

function aerial(
  moveId: string,
  name: string,
  button: LuckyButton,
  limb: LuckyLimb,
  direction: LuckyDirection | undefined,
  description: string,
): LuckyCommandSpec {
  return {
    moveId,
    name,
    buttons: [button],
    motion: 'none',
    ...(direction === undefined ? {} : { direction }),
    stance: 'air',
    limb,
    category: 'aerial',
    description,
  };
}

function crouching(
  moveId: string,
  name: string,
  button: LuckyButton,
  limb: LuckyLimb,
  description: string,
): LuckyCommandSpec {
  return {
    moveId,
    name,
    buttons: [button],
    motion: 'none',
    stance: 'crouching',
    limb,
    category: 'crouching',
    description,
  };
}

function directional(
  moveId: string,
  name: string,
  button: LuckyButton,
  limb: LuckyLimb,
  direction: LuckyDirection,
  description: string,
): LuckyCommandSpec {
  return {
    moveId,
    name,
    buttons: [button],
    motion: 'none',
    direction,
    stance: 'standing',
    limb,
    category: 'directional',
    description,
  };
}

function standing(
  moveId: string,
  name: string,
  button: LuckyButton,
  limb: LuckyLimb,
  description: string,
): LuckyCommandSpec {
  return {
    moveId,
    name,
    buttons: [button],
    motion: 'none',
    stance: 'standing',
    limb,
    category: 'normal',
    description,
  };
}
