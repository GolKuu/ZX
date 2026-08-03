import type { MoveFrameData } from '../../sim/frame-data.js';
import { LUCKY_LOW_PROFILE } from './character.js';
import { LUCKY_MOVE_IDS as ID } from './ids.js';
import { luckyMove } from './moveBuilder.js';

/**
 * Grounded normals: four standing, four forward, four back, four crouching.
 *
 * The J/K rows only ever describe fists, palms, elbows and shoulders and the
 * I/L rows only ever describe knees, shins, heels and feet. That is not a
 * comment — `LUCKY_LIMBS` in `limbs.ts` states it as data and the input test
 * fails the build if a row here drifts from it.
 */
export const LUCKY_STANDING_NORMALS: readonly MoveFrameData[] = [
  // J — Quick Draw. Lead hand from the waist. Brief frames: 5 / 3 / 9.
  luckyMove({
    id: ID.quickDraw,
    startup: 5, active: 3, recovery: 9, damage: 28,
    level: 'high', reach: 0.7, height: 1.55,
    cancels: [ID.loadedShoulder, ID.slidingBet, ID.doubleTap],
  }),
  // K — Loaded Shoulder. Steps in behind a raised forearm. 10 / 4 / 14.
  luckyMove({
    id: ID.loadedShoulder,
    startup: 10, active: 4, recovery: 14, damage: 56,
    level: 'mid', reach: 0.88, height: 1.18, lunge: 0.32,
    cancels: [ID.fortuneHeel],
  }),
  // I — Sliding Bet. Lead leg along the floor, torso back. 12 / 5 / 16.
  luckyMove({
    id: ID.slidingBet,
    startup: 12, active: 5, recovery: 16, damage: 48,
    level: 'low', reach: 1.12, height: 0.28,
    lowProfile: LUCKY_LOW_PROFILE,
  }),
  // L — Fortune Heel. Hips rotate, rear heel travels up. 15 / 5 / 17.
  luckyMove({
    id: ID.fortuneHeel,
    startup: 15, active: 5, recovery: 17, damage: 72,
    level: 'mid', reach: 0.78, height: 1.62, launch: true,
  }),
];

export const LUCKY_FORWARD_NORMALS: readonly MoveFrameData[] = [
  // Forward + J — Double Tap. Shorter than K, faster than K.
  luckyMove({
    id: ID.doubleTap,
    startup: 7, active: 4, recovery: 11, damage: 34,
    level: 'high', reach: 0.76, height: 1.48, lunge: 0.18, hits: 2,
    cancels: [ID.loadedHook],
  }),
  // Forward + K — Loaded Hook. Heavy advancing hand, high pushback.
  luckyMove({
    id: ID.loadedHook,
    startup: 13, active: 4, recovery: 20, damage: 68,
    level: 'mid', reach: 0.96, height: 1.34, lunge: 0.34,
  }),
  // Forward + I — Running Low Kick. Travels further, worse on block.
  luckyMove({
    id: ID.runningLowKick,
    startup: 14, active: 5, recovery: 19, damage: 44,
    level: 'low', reach: 1.24, height: 0.26, lunge: 0.46,
    lowProfile: LUCKY_LOW_PROFILE,
  }),
  // Forward + L — Fortune Breaker. Wall splat, long recovery.
  luckyMove({
    id: ID.fortuneBreaker,
    startup: 18, active: 5, recovery: 26, damage: 82,
    level: 'mid', reach: 1.02, height: 1.1, lunge: 0.4, wallBounce: true,
  }),
];

export const LUCKY_BACK_NORMALS: readonly MoveFrameData[] = [
  // Back + J — Check Hand. Retreating poke, low damage, strong spacing.
  luckyMove({
    id: ID.checkHand,
    startup: 6, active: 3, recovery: 12, damage: 20,
    level: 'high', reach: 0.82, height: 1.5, lunge: -0.16,
  }),
  // Back + K — Probability Counter. A real hurtbox that punishes strikes and
  // loses to throws, which is what makes it a read rather than a free option.
  luckyMove({
    id: ID.probabilityCounter,
    startup: 9, active: 3, recovery: 22, damage: 54,
    level: 'mid', reach: 0.8, height: 1.24,
    counter: {
      frames: { from: 3, toExclusive: 9 },
      into: ID.probabilityCounter,
      attackerHitstop: 12,
      strikeOnly: true,
    },
  }),
  // Back + I — Retreating Heel. Spacing tool, punishable on whiff.
  luckyMove({
    id: ID.retreatingHeel,
    startup: 11, active: 4, recovery: 18, damage: 40,
    level: 'mid', reach: 0.94, height: 0.86, lunge: -0.22,
  }),
  // Back + L — Reversal Kick. Moves away under close attacks; the low profile
  // ends before recovery does, so lows and delays still beat it.
  luckyMove({
    id: ID.reversalKick,
    startup: 13, active: 4, recovery: 21, damage: 60,
    level: 'mid', reach: 0.88, height: 1.06, lunge: -0.34,
    lowProfile: LUCKY_LOW_PROFILE,
  }),
];

/**
 * Crouching normals.
 *
 * The brief lists these twice — once as "Down + J … Down + L" and once as
 * "when S is held, S + J … S + L". Down is S, so those are one input each and
 * one move each; authoring both would have put two moves on one command. Each
 * of the four is a distinct action, not a reused standing pose.
 */
export const LUCKY_CROUCHING_NORMALS: readonly MoveFrameData[] = [
  // Down + J — Low Palm. Crouching hand, low-profile interruption.
  luckyMove({
    id: ID.lowPalm,
    startup: 6, active: 3, recovery: 10, damage: 24,
    level: 'mid', reach: 0.62, height: 0.62,
    lowProfile: LUCKY_LOW_PROFILE,
    cancels: [ID.crouchingShinKick, ID.sweepTheTable],
  }),
  // Down + K — Rising Hand. Crouching anti-air with the arm and shoulder.
  // Explicitly not a kick: the brief reserves anti-air kicks for L.
  luckyMove({
    id: ID.risingHand,
    startup: 9, active: 4, recovery: 17, damage: 50,
    level: 'mid', reach: 0.58, height: 1.5, launch: true,
  }),
  // Down + I — Crouching Shin Kick. Fast, short, a combo starter.
  luckyMove({
    id: ID.crouchingShinKick,
    startup: 7, active: 3, recovery: 12, damage: 26,
    level: 'low', reach: 0.72, height: 0.24,
    lowProfile: LUCKY_LOW_PROFILE,
    cancels: [ID.sweepTheTable],
  }),
  // Down + L — Sweep the Table. Knockdown, punishable on block.
  luckyMove({
    id: ID.sweepTheTable,
    startup: 13, active: 4, recovery: 24, damage: 66,
    level: 'low', reach: 1.06, height: 0.22,
    lowProfile: LUCKY_LOW_PROFILE, knockdown: true,
  }),
];
