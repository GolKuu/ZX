import { TITAN_MOVE_IDS as ID } from '../data/titan/ids.js';
import type { CommandRow } from './command.js';
import { TAUNT_COMMAND } from './sharedCommands.js';

export const TITAN_COMMANDS: readonly CommandRow[] = [
  {
    moveId: ID.worldAnchor, motion: 'none', button: 'ultimate', stance: 'any',
    available: ({ ultimateReady }) => ultimateReady === true,
  },
  {
    moveId: ID.continentalSlam, motion: 'qcf', button: 'super', stance: 'any',
    available: ({ superMeter }) => superMeter >= 100,
  },
  {
    moveId: ID.siegeEngine, motion: 'qcb', button: 'super', stance: 'any',
    available: ({ superMeter }) => superMeter >= 100,
  },
  TAUNT_COMMAND,
  enhanced(ID.enhancedGrab, 'hcf', 'lp'),
  enhanced(ID.enhancedCharge, 'qcf', 'hk'),
  enhanced(ID.enhancedSlam, 'qcb', 'hp'),
  command(ID.armouredGrab, 'hcf', 'hp'),
  command(ID.antiAirGrab, 'dp', 'hp'),
  command(ID.wallThrow, 'qcb', 'lk'),
  command(ID.commandGrab, 'hcf', 'lp'),
  command(ID.groundSlam, 'qcb', 'hp'),
  command(ID.armourCharge, 'qcf', 'hk'),
  command(ID.reactorBreaker, 'dp', 'hk'),
  {
    moveId: ID.dualTechnique, motion: 'none', button: 'lp',
    alsoPressed: ['lk'], stance: 'any',
  },
  {
    moveId: ID.normalThrow, motion: 'none', button: 'lp',
    alsoPressed: ['hp'], stance: 'any',
  },
  { moveId: ID.crouchLight, motion: 'none', button: 'lp', stance: 'crouching' },
  { moveId: ID.crouchMedium, motion: 'none', button: 'lk', stance: 'crouching' },
  { moveId: ID.crouchHeavy, motion: 'none', button: 'hp', stance: 'crouching' },
  { moveId: ID.sweep, motion: 'none', button: 'hk', stance: 'crouching' },
  { moveId: ID.antiAir, motion: 'none', button: 'hp', holdDirection: 'up', stance: 'any' },
  { moveId: ID.pistonHammer, motion: 'none', button: 'lp', stance: 'standing' },
  { moveId: ID.bulkheadBackfist, motion: 'none', button: 'lk', stance: 'standing' },
  { moveId: ID.seismicStomp, motion: 'none', button: 'hp', stance: 'standing' },
  { moveId: ID.siegeRam, motion: 'none', button: 'hk', stance: 'standing' },
];

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
): CommandRow {
  return {
    moveId, motion, button, stance: 'any', requiresModifier: true,
    available: ({ superMeter }) => superMeter >= 25,
  };
}
