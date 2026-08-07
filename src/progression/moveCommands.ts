import type { CharacterId } from '../data/characterRoster.js';
import {
  DEFAULT_BINDINGS,
  bindingFor,
  type Button,
  type KeyBindings,
} from '../input/bindings.js';
import { commandsFor } from '../input/characterProfile.js';
import type { CommandRow } from '../input/command.js';
import type { MotionId } from '../input/motion.js';

export interface ProgressionCommandStep {
  readonly keys: readonly string[];
  readonly hold?: boolean;
}

export interface ProgressionMoveCommand {
  readonly moveId: string;
  readonly name: string;
  readonly steps: readonly ProgressionCommandStep[];
  readonly notation: string;
}

type RelativeDirection = 'up' | 'down' | 'forward' | 'back';

const MOTION_STEPS: Readonly<Record<MotionId, readonly (readonly RelativeDirection[])[]>> = {
  none: [],
  qcf: [['down'], ['down', 'forward'], ['forward']],
  qcb: [['down'], ['down', 'back'], ['back']],
  qcf2: [['down'], ['down', 'forward'], ['forward'], ['down'], ['down', 'forward'], ['forward']],
  qcb2: [['down'], ['down', 'back'], ['back'], ['down'], ['down', 'back'], ['back']],
  hcf: [['back'], ['down', 'back'], ['down'], ['down', 'forward'], ['forward']],
  hcb: [['forward'], ['down', 'forward'], ['down'], ['down', 'back'], ['back']],
  dp: [['forward'], ['down'], ['down', 'forward']],
  rdp: [['back'], ['down'], ['down', 'back']],
  dd: [['down'], ['down']],
  ff: [['forward'], ['forward']],
  bb: [['back'], ['back']],
  chargeBackForward: [['back'], ['forward']],
  chargeDownUp: [['down'], ['up']],
};

/** Builds Hub hints from the exact command rows used by combat. */
export function progressionMoveCommands(
  fighterId: CharacterId,
  moveIds: readonly string[],
  bindings: KeyBindings = DEFAULT_BINDINGS,
): readonly ProgressionMoveCommand[] {
  const rows = commandsFor(fighterId);
  return moveIds.flatMap((moveId) => {
    const row = rows.find((candidate) => candidate.moveId === moveId);
    if (row === undefined) return [];
    const steps = commandSteps(row, bindings);
    return [{
      moveId,
      name: humanizeMoveId(moveId),
      steps,
      notation: steps.map(stepNotation).join(' → '),
    }];
  });
}

function commandSteps(
  row: CommandRow,
  bindings: KeyBindings,
): readonly ProgressionCommandStep[] {
  const isCharge = row.motion === 'chargeBackForward'
    || row.motion === 'chargeDownUp';
  const motion = MOTION_STEPS[row.motion].map((directions, index) => ({
    keys: directions.map((direction) => directionKey(direction, bindings)),
    ...(isCharge && index === 0 ? { hold: true } : {}),
  }));
  const finalKeys = commandButtons(row)
    .map((button) => keyLabel(bindingFor(bindings, button)));
  const heldDirection = row.holdDirection
    ?? (row.motion === 'none' && row.stance === 'crouching' ? 'down' : undefined);
  if (heldDirection !== undefined && heldDirection !== 'neutral') {
    finalKeys.unshift(directionKey(heldDirection, bindings));
  }
  return [...motion, { keys: finalKeys }];
}

function commandButtons(row: CommandRow): readonly Button[] {
  const buttons: Button[] = row.exactChord === undefined
    ? [row.button, ...(row.alsoPressed ?? [])]
    : [...row.exactChord];
  if (row.requiresModifier === true && !buttons.includes('super')) {
    buttons.push('super');
  }
  return [...new Set(buttons)];
}

function directionKey(
  direction: RelativeDirection,
  bindings: KeyBindings,
): string {
  const control = direction === 'forward'
    ? 'right'
    : direction === 'back'
      ? 'left'
      : direction;
  return keyLabel(bindingFor(bindings, control));
}

function keyLabel(code: string): string {
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Numpad')) return `NUM ${code.slice(6).toUpperCase()}`;
  if (code === 'ShiftLeft' || code === 'ShiftRight') return 'SHIFT';
  if (code === 'ControlLeft' || code === 'ControlRight') return 'CTRL';
  if (code.startsWith('Arrow')) return code.slice(5).toUpperCase();
  return code.replace(/Left$|Right$/, '').toUpperCase();
}

function stepNotation(step: ProgressionCommandStep): string {
  const chord = step.keys.join('+');
  return step.hold === true ? `HOLD ${chord}` : chord;
}

function humanizeMoveId(moveId: string): string {
  const fragments = moveId.split('.');
  const fragment = fragments[fragments.length - 1] ?? moveId;
  return fragment
    .split(/[-_]/u)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
