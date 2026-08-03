import {
  advanceDash,
  advanceLunge,
  endDash,
  endLunge,
  requestDash,
  startLunge,
} from './dash.js';
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
    if (
      input?.dash !== undefined
      && input.dash !== -1
      && input.dash !== 0
      && input.dash !== 1
    ) {
      throw new Error(`Invalid dash input for fighter "${fighter.id}"`);
    }
  }
}

export function applyNeutralInput(
  fighter: MutableFighterState,
  input: FighterInput | undefined,
): void {
  if (fighter.health === 0 || fighter.hitstun > 0) {
    fighter.guarding = false;
    endDash(fighter);
    endLunge(fighter);
    return;
  }
  if (fighter.action !== null) {
    fighter.guarding = false;
    endDash(fighter);
    // Zero for an ordinary attack; a dash attack keeps sliding for a few frames.
    if (fighter.grounded) fighter.velocity.x = advanceLunge(fighter);
    return;
  }
  fighter.guarding = input?.guard ?? false;
  fighter.crouching = fighter.grounded && (input?.crouching ?? false);
  fighter.guardMode = fighter.guarding ? (input?.guardMode ?? 'normal') : 'normal';
  if (!fighter.grounded) {
    endDash(fighter);
    return;
  }
  const walkingGuard = fighter.guarding && input?.guardWhileWalking === true;
  const movement = fighter.guarding && !walkingGuard
    ? 0
    : (input?.movement ?? 0);
  const jumping = input?.jump === true && !fighter.guarding;
  if ((fighter.guarding && !walkingGuard) || jumping) {
    endDash(fighter);
  } else {
    requestDash(fighter, input);
  }
  if (jumping) {
    fighter.velocity.y = fighter.movement.jumpPerFrame;
    fighter.grounded = false;
  }
  // A dash owns the horizontal velocity for its whole length, so the walk speed
  // below never overwrites it.
  if (advanceDash(fighter)) {
    return;
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
    || (fighter.moveCooldowns[input.move] ?? 0) > 0
    || (moves.get(input.move)?.minimumResource ?? 0) > fighter.resource
    || (fighter.action !== null && !canCancelInto(fighter, input.move, moves))
  ) {
    return null;
  }
  fighter.action = {
    moveId: input.move,
    frame: 0,
    serial: actionSerial,
    hitLedger: [],
    armourHitsUsed: 0,
  };
  fighter.resource = Math.max(
    0,
    fighter.resource - (moves.get(input.move)?.resourceCost ?? 0),
  );
  const cooldown = moves.get(input.move)?.cooldownFrames ?? 0;
  if (cooldown > 0) fighter.moveCooldowns[input.move] = cooldown;
  const status = moves.get(input.move)?.status;
  if (status !== undefined) {
    fighter.statusId = status.id;
    fighter.statusFrames = status.durationFrames;
    fighter.recoveryPercent = status.recoveryPercent;
    fighter.statusResourceDrainCounter = 0;
    fighter.statusArmourHitsUsed = 0;
    fighter.statusArmourHitsMaximum = status.armourHits ?? 0;
    fighter.statusArmourDamagePercent = status.armourDamagePercent ?? 100;
  }
  startLunge(fighter);
  endDash(fighter);
  if (fighter.grounded && fighter.lungeFrames === 0) fighter.velocity.x = 0;
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
  const activeStatus = [...moves.values()].find(
    (move) => move.status?.id === fighter.statusId,
  )?.status;
  const sourceMove = moves.get(action.moveId);
  const inDynamicWindow = sourceMove !== undefined
    && action.frame >= sourceMove.startup
    && action.frame < sourceMove.startup + sourceMove.active + 4;
  if (
    inDynamicWindow
    && action.moveId !== targetMove
    && activeStatus?.cancelFrom?.includes(action.moveId) === true
    && activeStatus.cancelInto?.includes(targetMove) === true
  ) return true;
  if (
    inDynamicWindow
    && action.moveId !== targetMove
    && fighter.resource >= (fighter.resourceRules?.pressureThreshold ?? 101)
    && fighter.resourceRules?.tierCancelFrom?.includes(action.moveId) === true
    && fighter.resourceRules?.tierCancelInto?.includes(targetMove) === true
  ) return true;
  return (
    moves.get(action.moveId)?.cancels?.some(
      (cancel) =>
        action.frame >= cancel.frames.from
        && action.frame < cancel.frames.toExclusive
        && cancel.into.includes(targetMove),
    ) ?? false
  );
}
