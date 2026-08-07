import {
  GLITCH_AIR_IDS as A,
  GLITCH_NORMAL_IDS as N,
  GLITCH_SPECIAL_IDS as S,
  GLITCH_SUPER_IDS as X,
  GLITCH_UTILITY_IDS as U,
} from '../data/glitch/ids.js';
import {
  GLITCH_LEVEL_ONE_COST,
  GLITCH_LEVEL_THREE_COST,
} from '../data/glitch/supers.js';
import type { CommandContext, CommandRow } from './command.js';
import { TAUNT_COMMAND } from './sharedCommands.js';
import { withSequenceCommands } from './sequenceCommands.js';

const grounded = ({ grounded: value }: { readonly grounded: boolean }) => value;
const airborne = ({ grounded: value }: { readonly grounded: boolean }) => !value;
const meter25 = ({ superMeter }: { readonly superMeter: number }) => superMeter >= 25;
const always = () => true;
const ready = (
  moveId: string,
  condition: (context: CommandContext) => boolean,
) => (context: CommandContext) => (
  condition(context)
  && (
    context.unlockedMoves === undefined
    || context.unlockedMoves.has(moveId)
  )
);

const GLITCH_BASE_COMMANDS: readonly CommandRow[] = [
  {
    moveId: X.fourthGod, motion: 'none', button: 'ultimate', stance: 'any',
    available: ({ ultimateReady }) => ultimateReady === true,
  },
  {
    moveId: X.realityCollapse, motion: 'none', button: 'super', stance: 'any',
    alsoPressed: ['hk'],
    available: ({ superMeter }) => superMeter >= GLITCH_LEVEL_ONE_COST,
  },
  {
    moveId: X.riftSequence, motion: 'none', button: 'super', stance: 'any',
    available: ({ superMeter }) => superMeter >= GLITCH_LEVEL_ONE_COST,
  },
  TAUNT_COMMAND,

  // Enhanced specials: same motion, Super held, 25 meter.
  { moveId: S.exRiftUppercut, motion: 'dp', button: 'lp', stance: 'any',
    requiresModifier: true, available: ready(S.exRiftUppercut, meter25) },
  { moveId: S.exPhaseBreak, motion: 'qcb', button: 'hp', stance: 'any',
    requiresModifier: true, available: ready(S.exPhaseBreak, meter25) },
  { moveId: S.exRealitySlice, motion: 'qcf', button: 'hp', stance: 'any',
    requiresModifier: true, available: ready(S.exRealitySlice, meter25) },
  { moveId: S.exTeleportStrike, motion: 'qcf', button: 'lk', stance: 'any',
    requiresModifier: true, available: ready(S.exTeleportStrike, meter25) },

  // Air movement and attacks resolve before grounded rows.
  { moveId: S.doubleJump, motion: 'none', button: 'dash', stance: 'any',
    holdDirection: 'up', available: airborne },
  { moveId: S.airShift, motion: 'none', button: 'dash', stance: 'any',
    holdDirection: 'forward', available: ready(S.airShift, airborne) },
  { moveId: A.throw, motion: 'none', button: 'lp', alsoPressed: ['lk'],
    stance: 'any', available: airborne },
  { moveId: A.launcher, motion: 'none', button: 'hp', alsoPressed: ['lk'],
    stance: 'any', available: airborne },
  { moveId: A.light, motion: 'none', button: 'lp', stance: 'any', available: airborne },
  { moveId: A.medium, motion: 'none', button: 'lk', stance: 'any', available: airborne },
  { moveId: A.heavy, motion: 'none', button: 'hp', stance: 'any', available: airborne },
  { moveId: A.finisher, motion: 'none', button: 'hk', stance: 'any', available: airborne },

  // Ground movement, duals and utility.
  { moveId: U.throwEscape, motion: 'none', button: 'lp', alsoPressed: ['lk'],
    holdDirection: 'back', stance: 'standing', available: grounded },
  { moveId: S.shiftForward, motion: 'none', button: 'dash', stance: 'any',
    holdDirection: 'forward', available: ready(S.shiftForward, grounded) },
  { moveId: S.shiftBackward, motion: 'none', button: 'dash', stance: 'any',
    holdDirection: 'back', available: ready(S.shiftBackward, grounded) },
  { moveId: S.spatialDash, motion: 'none', button: 'dash', stance: 'any',
    available: ready(S.spatialDash, grounded) },
  { moveId: U.throw, motion: 'none', button: 'lp', alsoPressed: ['lk'],
    stance: 'standing', available: grounded },
  // J + I. Sits above the plain LP and HP rows so the chord wins over either
  // button on its own — rows match in array order.
  { moveId: S.fiveFortyKick, motion: 'none', button: 'lp', alsoPressed: ['hp'],
    stance: 'standing', available: ready(S.fiveFortyKick, grounded) },
  { moveId: U.dualVector, motion: 'none', button: 'lk', alsoPressed: ['hk'],
    stance: 'standing', available: grounded },
  { moveId: U.launcher, motion: 'none', button: 'lp', alsoPressed: ['hp'],
    holdDirection: 'down', stance: 'crouching', available: grounded },
  { moveId: U.antiAir, motion: 'dp', button: 'lp', stance: 'any', available: grounded },
  { moveId: U.sweep, motion: 'qcb', button: 'lk', stance: 'any', available: grounded },
  { moveId: S.teleportStrike, motion: 'qcf', button: 'lk', stance: 'any',
    available: ready(S.teleportStrike, always) },
  { moveId: S.riftUppercut, motion: 'dp', button: 'hp', stance: 'any' },
  { moveId: S.phaseBreak, motion: 'qcb', button: 'hp', stance: 'any' },
  { moveId: S.realitySlice, motion: 'qcf', button: 'hp', stance: 'any',
    available: ready(S.realitySlice, always) },

  // Crouching buttons.
  { moveId: N.crouchLight, motion: 'none', button: 'lp', stance: 'crouching' },
  { moveId: N.crouchMedium, motion: 'none', button: 'lk', stance: 'crouching' },
  { moveId: N.crouchHeavy, motion: 'none', button: 'hp', stance: 'crouching' },
  { moveId: U.sweep, motion: 'none', button: 'hk', stance: 'crouching' },

  // J / K / I / L: silhouettes and frame data are deliberately distinct.
  { moveId: N.phaseJab, motion: 'none', button: 'lp', stance: 'standing' },
  { moveId: N.riftElbow, motion: 'none', button: 'lk', stance: 'standing' },
  { moveId: N.lowVectorSweep, motion: 'none', button: 'hp', stance: 'standing' },
  { moveId: N.breakpointAxe, motion: 'none', button: 'hk', stance: 'standing' },
];

export const GLITCH_COMMANDS = withSequenceCommands('glitch', GLITCH_BASE_COMMANDS);

export { GLITCH_LEVEL_ONE_COST, GLITCH_LEVEL_THREE_COST };
