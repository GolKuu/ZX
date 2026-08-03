import type { MoveFrameData } from '../../sim/frame-data.js';
import { LUCKY_LOW_PROFILE } from './character.js';
import { LUCKY_SPECIAL_IDS } from './ids.js';
import { luckyMove, type LuckyMoveSpec } from './moveBuilder.js';

export { LUCKY_SPECIAL_IDS } from './ids.js';

const ID = LUCKY_SPECIAL_IDS;

/**
 * Specials and their enhanced upgrades.
 *
 * Each special keeps the limb its button promises: the J and K specials strike
 * with hands, arms and shoulders, the I and L specials with shins and heels.
 * The enhanced version of a special is always the same limb as its base — the
 * second button in an enhanced chord pays the Luck, it does not choose a body
 * part.
 */
export const LUCKY_SPECIAL_MOVES: readonly MoveFrameData[] = [
  // QCF + J — Lucky Step. Fast advance, real recovery, a short window of
  // projectile avoidance rather than a safe teleport.
  luckyMove({
    id: ID.luckyStep,
    startup: 8, active: 3, recovery: 13, damage: 34,
    level: 'mid', reach: 1.08, height: 1.02, lunge: 0.72,
    invulnerable: [4, 8],
  }),
  // QCF + K — Loaded Strike. Advancing upper body, guard pressure, no leg.
  luckyMove({
    id: ID.loadedStrike,
    startup: 14, active: 5, recovery: 21, damage: 76,
    level: 'mid', reach: 1.18, height: 1.14, lunge: 0.38,
  }),
  // QCF + I — Sliding Fortune. Advancing low, punishable on block.
  luckyMove({
    id: ID.slidingFortune,
    startup: 13, active: 6, recovery: 24, damage: 52,
    level: 'low', reach: 1.34, height: 0.26, lunge: 0.62,
    lowProfile: LUCKY_LOW_PROFILE,
  }),
  // QCF + L — Fortune Break. Heavy leg, wall bounce, long recovery.
  luckyMove({
    id: ID.fortuneBreak,
    startup: 19, active: 6, recovery: 26, damage: 92,
    level: 'mid', reach: 1.22, height: 1.02, wallBounce: true,
  }),
  // QCB + J — Probability Shift. Repositioning, not a safety net: the
  // invulnerable window closes well before the move does.
  luckyMove({
    id: ID.probabilityShift,
    startup: 18, active: 6, recovery: 18, damage: 58,
    level: 'mid', reach: 1.52, height: 1.02,
    invulnerable: [2, 10],
    status: {
      id: 'lucky.probability-shift',
      durationFrames: 100,
      recoveryPercent: 85,
    },
  }),
  // QCB + K — Risky Counter. Upper body, gains Luck on success, loses to
  // throws, and has a long recovery when nothing arrives.
  luckyMove({
    id: ID.riskyCounter,
    startup: 11, active: 3, recovery: 24, damage: 66,
    level: 'mid', reach: 0.86, height: 1.2, launch: true,
    resourceGainOnHit: 12,
    counter: {
      frames: { from: 2, toExclusive: 11 },
      into: ID.riskyCounter,
      attackerHitstop: 12,
      strikeOnly: true,
    },
  }),
  // DP + J — Jackpot Rush. Fast advancing hand sequence, costs Luck, and a
  // cooldown so it cannot become a permanently safe pressure loop.
  luckyMove({
    id: ID.jackpotRush,
    startup: 16, active: 9, recovery: 28, damage: 110,
    level: 'mid', reach: 1.48, height: 1.06, hits: 3, launch: true,
    resourceCost: 25, cooldownFrames: 40,
  }),
  // DP + L — Fortune Rising. Invulnerable start, anti-air, hugely punishable.
  luckyMove({
    id: ID.fortuneRising,
    startup: 7, active: 6, recovery: 34, damage: 84,
    level: 'mid', reach: 0.72, height: 1.72, launch: true,
    invulnerable: [0, 7],
  }),

  // ---- Enhanced. Motion + two-button chord + a visible Luck price. ----
  enhanced(ID.enhancedStep, {
    startup: 6, active: 4, recovery: 9, damage: 46,
    reach: 1.25, lunge: 0.92, cost: 25, invulnerable: [2, 6],
  }),
  enhanced(ID.enhancedStrike, {
    startup: 11, active: 6, recovery: 16, damage: 94,
    reach: 1.36, lunge: 0.52, cost: 25, launch: true,
  }),
  enhanced(ID.enhancedSliding, {
    startup: 10, active: 7, recovery: 20, damage: 74,
    reach: 1.48, lunge: 0.78, cost: 25, level: 'low', height: 0.26,
    lowProfile: true,
  }),
  enhanced(ID.enhancedBreak, {
    startup: 15, active: 7, recovery: 20, damage: 124,
    reach: 1.46, lunge: 0.24, cost: 50, wallBounce: true,
  }),
  enhanced(ID.enhancedShift, {
    startup: 14, active: 8, recovery: 14, damage: 78,
    reach: 1.8, cost: 25, invulnerable: [1, 12],
    status: {
      id: 'lucky.probability-shift',
      durationFrames: 240,
      recoveryPercent: 85,
    },
  }),
  enhanced(ID.enhancedCounter, {
    startup: 8, active: 4, recovery: 18, damage: 90,
    reach: 0.9, cost: 25, launch: true,
    counter: {
      frames: { from: 1, toExclusive: 8 },
      into: ID.enhancedCounter,
      attackerHitstop: 14,
      strikeOnly: true,
    },
  }),
  enhanced(ID.enhancedRush, {
    startup: 12, active: 12, recovery: 22, damage: 158,
    reach: 1.72, lunge: 0.8, cost: 75, hits: 4, launch: true,
    cooldownFrames: 60,
  }),
  enhanced(ID.enhancedRising, {
    startup: 6, active: 7, recovery: 30, damage: 106,
    reach: 0.78, cost: 50, height: 1.76, launch: true,
    invulnerable: [0, 10],
  }),
];

interface EnhancedSpec {
  readonly startup: number;
  readonly active: number;
  readonly recovery: number;
  readonly damage: number;
  readonly reach: number;
  readonly cost: number;
  readonly height?: number;
  readonly level?: 'mid' | 'low';
  readonly lunge?: number;
  readonly launch?: boolean;
  readonly hits?: number;
  readonly wallBounce?: boolean;
  readonly lowProfile?: boolean;
  readonly invulnerable?: readonly [number, number];
  readonly counter?: LuckyMoveSpec['counter'];
  readonly status?: LuckyMoveSpec['status'];
  readonly cooldownFrames?: number;
}

/**
 * `resourceCost` is what the engine deducts and `minimumResource` is what it
 * checks. Both come from one number, so an enhanced move can never be entered
 * without paying and never be charged twice for one entry.
 */
function enhanced(id: string, spec: EnhancedSpec): MoveFrameData {
  return luckyMove({
    id,
    startup: spec.startup,
    active: spec.active,
    recovery: spec.recovery,
    damage: spec.damage,
    level: spec.level ?? 'mid',
    reach: spec.reach,
    height: spec.height ?? 1.02,
    lunge: spec.lunge,
    launch: spec.launch,
    hits: spec.hits,
    wallBounce: spec.wallBounce,
    lowProfile: spec.lowProfile === true ? LUCKY_LOW_PROFILE : undefined,
    invulnerable: spec.invulnerable,
    counter: spec.counter,
    status: spec.status,
    cooldownFrames: spec.cooldownFrames,
    resourceCost: spec.cost,
  });
}
