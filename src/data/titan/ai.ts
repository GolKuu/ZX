import type { AiLoadout } from '../../ai/types.js';
import { fixed } from '../../sim/math.js';
import { TITAN_MOVE_IDS as ID } from './ids.js';

const option = (
  moveId: string,
  minimum: number,
  maximum: number,
  weight: number,
  cue: string,
) => ({
  moveId,
  minimumDistance: fixed(minimum),
  maximumDistance: fixed(maximum),
  weight,
  cue,
});

export const TITAN_AI_LOADOUT: AiLoadout = {
  neutral: [
    option(ID.pistonHammer, 0.25, 0.95, 24, 'piston-check'),
    option(ID.bulkheadBackfist, 0.55, 1.35, 21, 'bulkhead-space'),
    option(ID.commandGrab, 0.12, 0.72, 18, 'command-grab'),
    option(ID.armourCharge, 0.8, 2.2, 10, 'armour-approach'),
  ],
  whiffPunishes: [
    option(ID.siegeRam, 0.55, 1.45, 28, 'siege-punish'),
    option(ID.commandGrab, 0.1, 0.75, 31, 'throw-punish'),
    option(ID.reactorBreaker, 0.3, 0.96, 17, 'reactor-break'),
  ],
  combos: [
    { moves: [ID.pistonHammer, ID.bulkheadBackfist, ID.siegeRam] },
    { moves: [ID.crouchLight, ID.crouchMedium, ID.groundSlam] },
    { moves: [ID.bulkheadBackfist, ID.commandGrab, ID.groundSlam] },
  ],
};

export const TITAN_AI_BEHAVIOUR = {
  easy: { commandGrabPercent: 12, approachFrames: 40, errorPercent: 25 },
  normal: { commandGrabPercent: 28, approachFrames: 22, errorPercent: 10 },
  hard: { commandGrabPercent: 42, approachFrames: 12, errorPercent: 3 },
  story: { commandGrabPercent: 35, approachFrames: 16, errorPercent: 6 },
} as const;
