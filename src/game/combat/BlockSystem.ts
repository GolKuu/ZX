import { balanceConfig } from '../config/balanceConfig';
import { FighterStateMachine } from '../core/FighterStateMachine';
import type { FighterSnapshot, PlayerInputFrame } from '../core/types';
import type { AttackDefinition } from './AttackDefinition';

export class BlockSystem {
  private readonly states = new FighterStateMachine();

  update(defender: FighterSnapshot, input: PlayerInputFrame) {
    const holdingBlock = input.held.includes('BLOCK');
    const canGuard = !this.states.isControlLocked(defender) && defender.mode !== 'knockout';
    if (holdingBlock && canGuard && defender.blockMeter > 0) {
      defender.guard = input.held.includes('CROUCH') ? 'crouching' : 'standing';
      defender.mode = 'blocking';
      defender.velocityX = 0;
      return;
    }

    defender.guard = null;
    if (defender.mode === 'blocking') defender.mode = defender.grounded ? 'idle' : 'jumping';
    if (defender.mode !== 'blockstun') {
      defender.blockMeter = Math.min(
        defender.maxBlockMeter,
        defender.blockMeter + balanceConfig.blockRecoveryPerTick,
      );
    }
  }

  tryBlock(
    defender: FighterSnapshot,
    input: PlayerInputFrame,
    attack: AttackDefinition,
  ) {
    if (!input.held.includes('BLOCK') || attack.hitLevel === 'throw') return false;
    const correctGuard =
      attack.hitLevel === 'low'
        ? defender.guard === 'crouching'
        : attack.hitLevel === 'overhead' || attack.hitLevel === 'air'
          ? defender.guard === 'standing'
          : defender.guard !== null;
    if (!correctGuard) return false;

    const perfect = input.held.includes('PERFECT_BLOCK');
    defender.blockMeter = Math.max(
      0,
      defender.blockMeter - (perfect ? 0 : attack.blockDamage),
    );
    if (defender.blockMeter > 0) return true;
    defender.guard = null;
    return false;
  }
}
