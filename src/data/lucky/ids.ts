/**
 * Every move id Lucky owns, in one place.
 *
 * Ids are the contract between the move tables, the command table, the AI
 * loadout, the move list and the tests. Keeping them here means a rename is one
 * edit rather than a grep, and a move that exists in the data but is missing
 * from the command table shows up as an unreachable id in
 * `tests/lucky-input.test.mjs` instead of as a silent dead animation.
 */

export const LUCKY_MOVE_IDS = {
  // Standing normals — J K I L.
  quickDraw: 'lucky.quick-draw',
  loadedShoulder: 'lucky.loaded-shoulder',
  slidingBet: 'lucky.sliding-bet',
  fortuneHeel: 'lucky.fortune-heel',

  // Forward normals.
  doubleTap: 'lucky.double-tap',
  loadedHook: 'lucky.loaded-hook',
  runningLowKick: 'lucky.running-low-kick',
  fortuneBreaker: 'lucky.fortune-breaker',

  // Back normals.
  checkHand: 'lucky.check-hand',
  probabilityCounter: 'lucky.probability-counter',
  retreatingHeel: 'lucky.retreating-heel',
  reversalKick: 'lucky.reversal-kick',

  // Crouching normals. These are also the Down-plus-button normals: Down is S,
  // so "Down + J" and "S + J" are the same physical input and must be one move.
  lowPalm: 'lucky.low-palm',
  risingHand: 'lucky.rising-hand',
  crouchingShinKick: 'lucky.crouching-shin-kick',
  sweepTheTable: 'lucky.sweep-the-table',

  // Aerial normals.
  airJab: 'lucky.air-jab',
  airHammer: 'lucky.air-hammer',
  airQuickKick: 'lucky.air-quick-kick',
  airHeavyHeel: 'lucky.air-heavy-heel',
  airPalm: 'lucky.air-palm',
  airShoulder: 'lucky.air-shoulder',
  airDownKick: 'lucky.air-down-kick',
  airDescendingHeel: 'lucky.air-descending-heel',

  // Throws.
  throw: 'lucky.throw',
  forwardThrow: 'lucky.forward-throw',
  backThrow: 'lucky.back-throw',
  airThrow: 'lucky.air-throw',

  // Dual techniques.
  loadedHands: 'lucky.dual.loaded-hands',
  fortuneLegs: 'lucky.dual.fortune-legs',

  // Charge moves.
  chargeShoulder: 'lucky.charge.probability-shoulder',
  chargeRisingHeel: 'lucky.charge.rising-heel',
} as const;

/** The Luck meter verbs. K+L and its four directions. */
export const LUCKY_LUCK_IDS = {
  prepare: 'lucky.luck.prepare',
  prepareOffense: 'lucky.luck.prepare-offense',
  guard: 'lucky.luck.guard',
  guardFailed: 'lucky.luck.guard-failed',
  cancel: 'lucky.luck.cancel',
  inspect: 'lucky.luck.inspect',
} as const;

export const LUCKY_SPECIAL_IDS = {
  luckyStep: 'lucky.special.step',
  loadedStrike: 'lucky.special.loaded-strike',
  slidingFortune: 'lucky.special.sliding-fortune',
  fortuneBreak: 'lucky.special.fortune-break',
  probabilityShift: 'lucky.special.probability-shift',
  riskyCounter: 'lucky.special.risky-counter',
  jackpotRush: 'lucky.special.jackpot-rush',
  fortuneRising: 'lucky.special.fortune-rising',

  enhancedStep: 'lucky.enhanced.step',
  enhancedStrike: 'lucky.enhanced.loaded-strike',
  enhancedSliding: 'lucky.enhanced.sliding-fortune',
  enhancedBreak: 'lucky.enhanced.fortune-break',
  enhancedShift: 'lucky.enhanced.probability-shift',
  enhancedCounter: 'lucky.enhanced.risky-counter',
  enhancedRush: 'lucky.enhanced.jackpot-rush',
  enhancedRising: 'lucky.enhanced.fortune-rising',
} as const;

/** Base move each enhanced id upgrades, for the move list and the tests. */
export const LUCKY_ENHANCED_BASE: Readonly<Record<string, string>> = {
  [LUCKY_SPECIAL_IDS.enhancedStep]: LUCKY_SPECIAL_IDS.luckyStep,
  [LUCKY_SPECIAL_IDS.enhancedStrike]: LUCKY_SPECIAL_IDS.loadedStrike,
  [LUCKY_SPECIAL_IDS.enhancedSliding]: LUCKY_SPECIAL_IDS.slidingFortune,
  [LUCKY_SPECIAL_IDS.enhancedBreak]: LUCKY_SPECIAL_IDS.fortuneBreak,
  [LUCKY_SPECIAL_IDS.enhancedShift]: LUCKY_SPECIAL_IDS.probabilityShift,
  [LUCKY_SPECIAL_IDS.enhancedCounter]: LUCKY_SPECIAL_IDS.riskyCounter,
  [LUCKY_SPECIAL_IDS.enhancedRush]: LUCKY_SPECIAL_IDS.jackpotRush,
  [LUCKY_SPECIAL_IDS.enhancedRising]: LUCKY_SPECIAL_IDS.fortuneRising,
};
