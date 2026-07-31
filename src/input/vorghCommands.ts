import {
  VORGH_NORMAL_IDS as N,
  VORGH_SPECIAL_IDS as S,
  VORGH_SUPER_IDS as U,
  VORGH_TECHNIQUE_IDS as T,
} from '../data/vorgh/index.js';
import type { CommandRow } from './command.js';
import { TAUNT_COMMAND } from './sharedCommands.js';

const rage = (minimum: number) => ({ gauge }: { readonly gauge: number }) =>
  gauge >= minimum;

export const VORGH_COMMANDS: readonly CommandRow[] = [
  {
    moveId: U.lastBeast, motion: 'none', button: 'ultimate', stance: 'any',
    available: ({ gauge, superMeter, ultimateReady }) =>
      ultimateReady === true && gauge >= 80 && superMeter >= 66,
  },
  {
    moveId: U.unchained, motion: 'none', button: 'super',
    holdDirection: 'back', stance: 'any',
    available: ({ gauge, superMeter }) => gauge >= 50 && superMeter >= 34,
  },
  {
    moveId: U.savageDominionHigh, motion: 'none', button: 'super', stance: 'any',
    available: ({ gauge, superMeter }) => gauge >= 75 && superMeter >= 34,
  },
  {
    moveId: U.savageDominionMedium, motion: 'none', button: 'super', stance: 'any',
    available: ({ gauge, superMeter }) => gauge >= 50 && superMeter >= 34,
  },
  {
    moveId: U.savageDominion, motion: 'none', button: 'super', stance: 'any',
    available: ({ superMeter }) => superMeter >= 34,
  },
  TAUNT_COMMAND,
  technique(T.dualFang, 'lp', 'lk'),
  technique(T.dualRend, 'lk', 'hk'),
  technique(T.dualBreak, 'hp', 'hk'),
  special(S.armourBreakerEx, 'hcf', 'hp', 75),
  special(S.bloodRoarEx, 'qcb', 'hk', 75),
  special(S.predatorLeapEx, 'dp', 'lk', 50),
  special(S.berserkDashEx, 'qcf', 'lk', 50),
  special(S.rageSlashEx, 'qcf', 'lp', 50),
  special(S.painCounter, 'qcb', 'lp', 0),
  special(S.armourBreaker, 'hcf', 'hp', 0),
  special(S.bloodRoar, 'qcb', 'hk', 0),
  special(S.predatorLeap, 'dp', 'lk', 0),
  special(S.berserkDash, 'qcf', 'lk', 0),
  special(S.rageSlash, 'qcf', 'lp', 0),
  { moveId: T.throw, motion: 'hcb', button: 'lp', stance: 'any' },
  { moveId: T.airThrow, motion: 'hcb', button: 'lp', stance: 'any',
    available: ({ grounded }) => !grounded },
  air(N.airLight, 'lp'),
  air(N.airMedium, 'lk'),
  air(N.airHeavy, 'hp'),
  { moveId: N.crouchLight, motion: 'none', button: 'lp', stance: 'crouching' },
  { moveId: N.crouchMedium, motion: 'none', button: 'lk', stance: 'crouching' },
  { moveId: N.crouchHeavy, motion: 'none', button: 'hp', stance: 'crouching' },
  { moveId: N.predatorRake, motion: 'none', button: 'lp', stance: 'standing' },
  { moveId: N.skullRam, motion: 'none', button: 'lk', stance: 'standing' },
  { moveId: N.huntingSweep, motion: 'none', button: 'hp', stance: 'standing' },
  { moveId: N.risingMaul, motion: 'none', button: 'hk', stance: 'any' },
];

function technique(moveId: string, button: 'lp' | 'lk' | 'hp', chord: 'lk' | 'hk') {
  return {
    moveId, motion: 'none' as const, button, alsoPressed: [chord],
    stance: 'any' as const,
  };
}

function special(
  moveId: string, motion: 'qcf' | 'qcb' | 'hcf' | 'dp',
  button: 'lp' | 'lk' | 'hp' | 'hk', minimum: number,
) {
  return {
    moveId, motion, button, stance: 'any' as const,
    ...(minimum === 0 ? {} : { available: rage(minimum) }),
  };
}

function air(moveId: string, button: 'lp' | 'lk' | 'hp') {
  return {
    moveId, motion: 'none' as const, button, stance: 'any' as const,
    available: ({ grounded }: { readonly grounded: boolean }) => !grounded,
  };
}
