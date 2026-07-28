import { balanceConfig } from '../config/balanceConfig';
import { CollisionSystem } from './CollisionSystem';
import { FighterStateMachine } from './FighterStateMachine';
import type { FighterSnapshot, PlayerInputFrame } from './types';

export class MovementSystem {
  private readonly collisions = new CollisionSystem();
  private readonly fighterStates = new FighterStateMachine();

  update(
    fighter: FighterSnapshot,
    input: PlayerInputFrame,
    stepSeconds: number,
    tick: number,
  ) {
    this.fighterStates.tick(fighter);
    fighter.attackCooldownTicks = Math.max(0, fighter.attackCooldownTicks - 1);
    this.detectDash(fighter, input, tick);

    const locked = fighter.mode === 'hitstun' || fighter.mode === 'knockout';
    const direction =
      Number(input.held.includes('MOVE_RIGHT')) - Number(input.held.includes('MOVE_LEFT'));
    const crouching = input.held.includes('CROUCH') && fighter.grounded && !locked;

    if (fighter.dashTicksRemaining > 0 && !locked) {
      fighter.velocityX = fighter.dashDirection * balanceConfig.dashSpeed;
      fighter.dashTicksRemaining -= 1;
      fighter.mode = 'dashing';
    } else {
      const speed = crouching ? balanceConfig.crouchSpeed : balanceConfig.walkSpeed;
      fighter.velocityX = (locked ? 0 : direction) * speed;
    }

    if (!locked && input.pressed.includes('JUMP') && fighter.grounded) {
      fighter.velocityY = -balanceConfig.jumpSpeed;
      fighter.grounded = false;
      fighter.mode = 'jumping';
    } else if (
      !locked &&
      fighter.grounded &&
      fighter.mode !== 'attacking' &&
      fighter.mode !== 'dashing'
    ) {
      fighter.mode = crouching ? 'crouching' : direction === 0 ? 'idle' : 'walking';
    }

    if (!fighter.grounded) fighter.velocityY += balanceConfig.gravity * stepSeconds;
    fighter.x += fighter.velocityX * stepSeconds;
    fighter.y += fighter.velocityY * stepSeconds;
    this.collisions.resolveArena(fighter);
  }

  private detectDash(fighter: FighterSnapshot, input: PlayerInputFrame, tick: number) {
    const action = input.pressed.find(
      (item): item is 'MOVE_LEFT' | 'MOVE_RIGHT' =>
        item === 'MOVE_LEFT' || item === 'MOVE_RIGHT',
    );
    if (!action) return;
    const isDoubleTap =
      fighter.lastMoveTapAction === action &&
      tick - fighter.lastMoveTapTick <= balanceConfig.doubleTapWindowTicks;
    fighter.lastMoveTapAction = action;
    fighter.lastMoveTapTick = tick;
    if (isDoubleTap) {
      fighter.dashDirection = action === 'MOVE_LEFT' ? -1 : 1;
      fighter.dashTicksRemaining = balanceConfig.dashDurationTicks;
    }
  }
}
