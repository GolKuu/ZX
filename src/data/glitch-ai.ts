import type { AiDifficulty, AiLoadout } from '../ai/types.js';
import { fixed } from '../sim/math.js';
import {
  GLITCH_AIR_IDS as A,
  GLITCH_NORMAL_IDS as N,
  GLITCH_SPECIAL_IDS as S,
  GLITCH_UTILITY_IDS as U,
} from './glitch/ids.js';

export const GLITCH_AI_LOADOUT: AiLoadout = {
  neutral: [
    option(N.phaseJab, 0, 1.05, 31, 'phase-check'),
    option(N.riftElbow, 0.38, 1.25, 26, 'rift-step'),
    option(N.lowVectorSweep, 0.48, 1.4, 19, 'low-vector'),
    option(N.breakpointAxe, 0.52, 1.28, 12, 'breakpoint'),
    option(S.spatialDash, 1.1, 2.4, 13, 'spatial-dash'),
    option(S.shiftForward, 1.45, 2.9, 7, 'teleport-signal'),
    option(S.realitySlice, 1.25, 2.75, 9, 'reality-slice'),
  ],
  whiffPunishes: [
    option(N.riftElbow, 0.4, 1.35, 36, 'elbow-punish'),
    option(S.teleportStrike, 0.85, 2.1, 24, 'shift-punish'),
    option(S.riftUppercut, 0.35, 1.25, 22, 'uppercut-punish'),
    option(U.sweep, 0.5, 1.35, 18, 'sweep-punish'),
  ],
  combos: [
    { moves: [N.phaseJab, N.riftElbow, U.launcher] },
    { moves: [N.phaseJab, N.lowVectorSweep, S.spatialDash] },
    { moves: [N.riftElbow, U.dualVector, S.realitySlice] },
    { moves: [U.launcher, A.light, A.medium, A.finisher] },
    { moves: [U.antiAir, A.light, S.airShift, A.heavy] },
    { moves: [N.phaseJab, S.teleportStrike, N.riftElbow] },
  ],
};

export const GLITCH_AI_BEHAVIOR = {
  easy: {
    maximumComboLength: 2,
    teleportChancePercent: 8,
    airRouteErrorPercent: 32,
    reactionFrames: 18,
  },
  normal: {
    maximumComboLength: 4,
    teleportChancePercent: 18,
    airRouteErrorPercent: 10,
    reactionFrames: 12,
  },
  hard: {
    maximumComboLength: 5,
    teleportChancePercent: 26,
    airRouteErrorPercent: 2,
    reactionFrames: 7,
    inputReading: false,
  },
  story: {
    maximumComboLength: 4,
    teleportChancePercent: 30,
    airRouteErrorPercent: 7,
    reactionFrames: 10,
    allowedStoryTechniques: [S.airShift, S.teleportStrike, S.realitySlice],
  },
} as const;

export function glitchAiLoadout(difficulty: AiDifficulty): AiLoadout {
  const profile = difficulty === 'impossible'
    ? GLITCH_AI_BEHAVIOR.hard
    : GLITCH_AI_BEHAVIOR[difficulty];
  return {
    neutral: GLITCH_AI_LOADOUT.neutral.map((entry) => (
      entry.moveId.includes('shift') || entry.moveId.includes('teleport')
        ? {
            ...entry,
            weight: Math.max(
              1,
              Math.round((entry.weight * profile.teleportChancePercent) / 18),
            ),
          }
        : entry
    )),
    whiffPunishes: GLITCH_AI_LOADOUT.whiffPunishes,
    combos: GLITCH_AI_LOADOUT.combos.map((route) => ({
      moves: route.moves.slice(0, profile.maximumComboLength),
    })),
  };
}

export const GLITCH_STORY_AI_LOADOUT: AiLoadout = {
  neutral: GLITCH_AI_LOADOUT.neutral.filter((entry) =>
    GLITCH_AI_BEHAVIOR.story.allowedStoryTechniques.includes(
      entry.moveId as (typeof GLITCH_AI_BEHAVIOR.story.allowedStoryTechniques)[number],
    )
    || entry.moveId === N.phaseJab
    || entry.moveId === N.riftElbow,
  ),
  whiffPunishes: GLITCH_AI_LOADOUT.whiffPunishes,
  combos: GLITCH_AI_LOADOUT.combos.map((route) => ({
    moves: route.moves.slice(0, GLITCH_AI_BEHAVIOR.story.maximumComboLength),
  })),
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
