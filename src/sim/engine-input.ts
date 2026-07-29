import type { MoveStartedEvent } from './events.js';
import type { MoveFrameData } from './frame-data.js';
import type {
  CombatInputs,
  FighterInput,
  MutableFighterState,
} from './state.js';

export function validateCombatInputs(
  fighters: readonly MutableFighterState[],
  moves: ReadonlyMap<string, MoveFrameData>,
  inputs: CombatInputs,
): void {
  for (const fighter of fighters) {
    const input = inputs[fighter.id];
    if (input?.move !== undefined && !moves.has(input.move)) {
      throw new Error(`Unknown move "${input.move}" for fighter "${fighter.id}"`);
    }
    if (
      input?.movement !== undefined
      && input.movement !== -1
      && input.movement !== 0
      && input.movement !== 1
    ) {
      throw new Error(`Invalid movement for fighter "${fighter.id}"`);
    }
    if (input?.jump !== undefined && typeof input.jump !== 'boolean') {
      throw new Error(`Invalid jump input for fighter "${fighter.id}"`);
    }
  }
}

export function applyNeutralInput(
  fighter: MutableFighterState,
  input: FighterInput | undefined,
): void {
  if (fighter.health === 0 || fighter.hitstun > 0 || fighter.action !== null) {
    fighter.guarding = false;
    return;
  }
  fighter.guarding = input?.guard ?? false;
  if (!fighter.grounded) {
    return;
  }
  const movement = fighter.guarding ? 0 : (input?.movement ?? 0);
  if (input?.jump === true && !fighter.guarding) {
    fighter.velocity.y = fighter.movement.jumpPerFrame;
    fighter.grounded = false;
  }
  const speed =
    movement >= 0
      ? fighter.movement.forwardPerFrame
      : fighter.movement.backwardPerFrame;
  fighter.velocity.x = movement * fighter.facing * speed;
}

export function tryStartMove(
  fighter: MutableFighterState,
  input: FighterInput | undefined,
  moves: ReadonlyMap<string, MoveFrameData>,
  actionSerial: number,
  frame: number,
): MoveStartedEvent | null {
  if (
    input?.move === undefined
    || fighter.health === 0
    || fighter.hitstun > 0
    || fighter.guarding
    || (fighter.action !== null && !canCancelInto(fighter, input.move, moves))
  ) {
    return null;
  }
  fighter.action = {
    moveId: input.move,
    frame: 0,
    serial: actionSerial,
    hitLedger: [],
  };
  return {
    type: 'moveStarted',
    frame,
    fighterId: fighter.id,
    moveId: input.move,
  };
}

function canCancelInto(
  fighter: MutableFighterState,
  targetMove: string,
  moves: ReadonlyMap<string, MoveFrameData>,
): boolean {
  const action = fighter.action;
  if (action === null || action.hitLedger.length === 0) {
    return false;
  }
  return (
    moves.get(action.moveId)?.cancels?.some(
      (cancel) =>
        action.frame >= cancel.frames.from
        && action.frame < cancel.frames.toExclusive
        && cancel.into.includes(targetMove),
    ) ?? false
  );
}
