import { balanceConfig } from '../config/balanceConfig';
import type {
  CombatAction,
  ComboSnapshot,
  FighterSnapshot,
  PlayerInputFrame,
} from '../core/types';
import { highestPriority, type RecognizedCommand } from './CommandPriority';
import type { RecognizedInput } from './CommandRecognizer';
import { actionForCommand, findContextCommands } from './contextCommandRules';

export type ActionContext = {
  fighter: FighterSnapshot;
  opponent: FighterSnapshot;
  incomingCombo: ComboSnapshot;
};

export class ContextActionResolver {
  resolve(input: RecognizedInput, context: ActionContext): PlayerInputFrame {
    const held = this.baseHeld(input);
    const pressed = this.basePressed(input);
    const commands = findContextCommands(input, context);
    const command = highestPriority(commands);

    if (input.frame.held.includes('DEFENSE')) held.push('BLOCK');
    this.appendBlockTiming(input, held);
    this.applyCommand(command, input, context, held, pressed);
    this.appendClassicActions(input.frame, held, pressed);
    return { held: unique(held), pressed: unique(pressed), released: [] };
  }

  private appendBlockTiming(input: RecognizedInput, held: CombatAction[]) {
    const pressAge = input.framesSincePressed('DEFENSE');
    if (pressAge === null) return;
    if (pressAge < balanceConfig.perfectBlockWindowFrames) {
      held.push('PERFECT_BLOCK');
    } else if (pressAge < balanceConfig.preciseBlockWindowFrames) {
      held.push('PRECISE_BLOCK');
    }
  }

  private applyCommand(
    command: RecognizedCommand | null,
    input: RecognizedInput,
    context: ActionContext,
    held: CombatAction[],
    pressed: CombatAction[],
  ) {
    if (!command) return;
    const action = actionForCommand(command, input, context);
    if (action) pressed.push(action);
    if (command === 'GRAB' || command === 'MOMENTUM_REVERSAL' ||
      command === 'COMBO_BREAK' || command === 'SUPER_ATTACK') {
      remove(held, 'BLOCK');
    }
    if (command === 'COMBO_ESCAPE') pressed.push('COMBO_ESCAPE');
    if (command === 'BLOCK' && input.frame.held.includes('LIGHT_ATTACK')) {
      held.push('CROUCH');
    }
  }

  private baseHeld(input: RecognizedInput): CombatAction[] {
    const held: CombatAction[] = [];
    const left = input.frame.held.includes('MOVE_LEFT');
    const right = input.frame.held.includes('MOVE_RIGHT');
    if (left !== right) held.push(left ? 'MOVE_LEFT' : 'MOVE_RIGHT');
    if (input.frame.held.includes('JUMP')) held.push('JUMP');
    return held;
  }

  private basePressed(input: RecognizedInput): CombatAction[] {
    const pressed: CombatAction[] = [];
    if (input.frame.pressed.includes('JUMP')) pressed.push('JUMP');
    if (input.doubleTapped) {
      pressed.push(input.doubleTapped === 'MOVE_LEFT' ? 'DASH_LEFT' : 'DASH_RIGHT');
    }
    return pressed;
  }

  private appendClassicActions(
    frame: PlayerInputFrame,
    held: CombatAction[],
    pressed: CombatAction[],
  ) {
    const publicActions = new Set<string>([
      'MOVE_LEFT', 'MOVE_RIGHT', 'JUMP', 'LIGHT_ATTACK',
      'HEAVY_ATTACK', 'SPECIAL_ATTACK', 'DEFENSE', 'PAUSE',
    ]);
    frame.held.forEach((action) => {
      if (!publicActions.has(action)) held.push(action);
    });
    frame.pressed.forEach((action) => {
      if (!publicActions.has(action)) pressed.push(action);
    });
  }
}

function unique(actions: CombatAction[]) {
  return [...new Set(actions)];
}

function remove(actions: CombatAction[], action: CombatAction) {
  const index = actions.indexOf(action);
  if (index >= 0) actions.splice(index, 1);
}
