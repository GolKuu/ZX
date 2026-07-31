import type { AiDifficulty, AiLoadout } from '../../ai/types.js';
import { fixed } from '../../sim/math.js';
import { VORGH_NORMAL_IDS as N, VORGH_SPECIAL_IDS as S } from './ids.js';

const base: AiLoadout = {
  neutral: [
    option(N.predatorRake, 0, 1.16, 30, 'rake-high'),
    option(N.skullRam, 0, 1.12, 25, 'ram-mid'),
    option(N.huntingSweep, 0.55, 1.56, 18, 'sweep-low'),
    option(S.rageSlash, 0.65, 1.75, 20, 'rage-slash'),
    option(S.armourBreaker, 0.4, 1.3, 7, 'armour-breaker'),
  ],
  whiffPunishes: [
    option(N.skullRam, 0, 1.18, 34, 'ram-punish'),
    option(S.rageSlash, 0.45, 1.8, 42, 'slash-punish'),
    option(S.armourBreaker, 0.3, 1.32, 24, 'breaker-punish'),
  ],
  combos: [
    { moves: [N.predatorRake, N.skullRam, S.rageSlash] },
    { moves: [N.crouchLight, N.crouchMedium, S.berserkDash] },
  ],
};

const hard: AiLoadout = {
  neutral: [
    ...base.neutral,
    option(S.rageSlashEx, 0.55, 1.9, 22, 'enhanced-slash', 50),
    option(S.berserkDashEx, 0.9, 2.15, 14, 'enhanced-dash', 50),
    option(S.painCounter, 0.2, 1.32, 9, 'pain-read'),
  ],
  whiffPunishes: [
    ...base.whiffPunishes,
    option(S.armourBreakerEx, 0.3, 1.4, 25, 'sundering-punish', 75),
  ],
  combos: [
    ...base.combos,
    { moves: [N.predatorRake, N.skullRam, S.rageSlashEx, S.berserkDashEx] },
  ],
  painGuardThreshold: 58,
};

export const VORGH_AI_LOADOUTS: Readonly<Record<AiDifficulty, AiLoadout>> = {
  easy: {
    neutral: [option(N.risingMaul, 0.3, 1.4, 45, 'risky-maul'), ...base.neutral],
    whiffPunishes: base.whiffPunishes,
    combos: [{ moves: [N.predatorRake, N.skullRam] }],
  },
  normal: base,
  hard,
  impossible: hard,
  story: {
    ...hard,
    neutral: [...hard.neutral, option(S.bloodRoarEx, 0.4, 1.85, 20, 'story-roar', 75)],
  },
};

function option(
  moveId: string, min: number, max: number, weight: number,
  cue: string, minimumResource = 0,
) {
  return {
    moveId, minimumDistance: fixed(min), maximumDistance: fixed(max),
    weight, cue, minimumResource,
  };
}
