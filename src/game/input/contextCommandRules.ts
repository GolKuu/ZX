import { balanceConfig } from '../config/balanceConfig';
import type { CombatAction } from '../core/types';
import type { RecognizedCommand } from './CommandPriority';
import type { RecognizedInput } from './CommandRecognizer';
import type { ActionContext } from './ContextActionResolver';

export function findContextCommands(input: RecognizedInput, context: ActionContext) {
  const commands = new Set<RecognizedCommand>();
  const { fighter, opponent, incomingCombo } = context;
  const distance = Math.abs(fighter.x - opponent.x);

  if (input.defenseCombo('SPECIAL_ATTACK')) {
    if (
      fighter.mode === 'hitstun' &&
      incomingCombo.hits > 0 &&
      fighter.blockMeter >= balanceConfig.comboBreakCost
    ) commands.add('COMBO_BREAK');
    else if (fighter.energy >= fighter.maxEnergy) commands.add('SUPER_ATTACK');
  }
  if (
    input.defenseCombo('HEAVY_ATTACK', balanceConfig.reversalWindow) &&
    fighter.energy >= balanceConfig.reversalCost
  ) commands.add('MOMENTUM_REVERSAL');
  if (
    input.frame.held.includes('DEFENSE') &&
    input.away &&
    fighter.mode === 'hitstun' &&
    incomingCombo.hits > 0 &&
    fighter.modeTicksRemaining <= balanceConfig.escapeWindow
  ) commands.add('COMBO_ESCAPE');
  if (
    input.defenseCombo('LIGHT_ATTACK') &&
    fighter.grounded &&
    distance <= balanceConfig.grabRange &&
    canGrab(fighter) &&
    canBeGrabbed(opponent)
  ) commands.add('GRAB');

  addAttackCommands(commands, input, context);
  if (input.frame.held.includes('DEFENSE')) commands.add('BLOCK');
  if (input.frame.held.includes('MOVE_LEFT') || input.frame.held.includes('MOVE_RIGHT')) {
    commands.add('MOVE');
  }
  return commands;
}

function canGrab(fighter: ActionContext['fighter']) {
  return !['hitstun', 'blockstun', 'knockdown', 'wakeup', 'knockout']
    .includes(fighter.mode);
}

function canBeGrabbed(fighter: ActionContext['fighter']) {
  return !['hitstun', 'knockdown', 'wakeup', 'knockout'].includes(fighter.mode);
}

export function actionForCommand(
  command: RecognizedCommand,
  input: RecognizedInput,
  context: ActionContext,
): CombatAction | null {
  switch (command) {
    case 'SUPER_ATTACK': return 'SUPER_ATTACK';
    case 'COMBO_BREAK': return 'COMBO_BREAK';
    case 'MOMENTUM_REVERSAL': return 'MOMENTUM_REVERSAL';
    case 'GRAB': return 'GRAB';
    case 'AIR_SPECIAL': return 'AIR_SPECIAL';
    case 'SPECIAL_ATTACK': return 'SPECIAL_ATTACK';
    case 'DIRECTIONAL_SPECIAL':
      return input.away ? 'RETREAT_SPECIAL' : 'DIRECTIONAL_SPECIAL';
    case 'AIR_HEAVY': return 'AIR_HEAVY';
    case 'AIR_LIGHT': return 'AIR_LIGHT';
    case 'DIRECTIONAL_HEAVY':
      return input.away ? 'RETREAT_HEAVY' : 'DIRECTIONAL_HEAVY';
    case 'DIRECTIONAL_LIGHT':
      return input.away ? 'RETREAT_LIGHT' : 'DIRECTIONAL_LIGHT';
    case 'DASH_ATTACK':
      return input.frame.pressed.includes('HEAVY_ATTACK') ? 'DASH_HEAVY' : 'DASH_LIGHT';
    case 'HEAVY_ATTACK': return 'HEAVY_ATTACK';
    case 'LIGHT_ATTACK': return 'LIGHT_ATTACK';
    case 'COMBO_ESCAPE':
      return context.incomingCombo.remainingTicks > 0 ? 'COMBO_ESCAPE' : null;
    default: return null;
  }
}

function addAttackCommands(
  commands: Set<RecognizedCommand>,
  input: RecognizedInput,
  context: ActionContext,
) {
  const { fighter } = context;
  if (input.frame.held.includes('DEFENSE')) return;
  if (input.frame.pressed.includes('SPECIAL_ATTACK')) {
    commands.add(!fighter.grounded ? 'AIR_SPECIAL' :
      input.toward || input.away ? 'DIRECTIONAL_SPECIAL' : 'SPECIAL_ATTACK');
  }
  if (input.frame.pressed.includes('HEAVY_ATTACK')) {
    commands.add(fighter.mode === 'dashing' ? 'DASH_ATTACK' :
      !fighter.grounded ? 'AIR_HEAVY' :
        input.toward || input.away ? 'DIRECTIONAL_HEAVY' : 'HEAVY_ATTACK');
  }
  if (input.frame.pressed.includes('LIGHT_ATTACK')) {
    commands.add(fighter.mode === 'dashing' ? 'DASH_ATTACK' :
      !fighter.grounded ? 'AIR_LIGHT' :
        input.toward || input.away ? 'DIRECTIONAL_LIGHT' : 'LIGHT_ATTACK');
  }
}
