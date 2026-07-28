import { balanceConfig } from '../config/balanceConfig';
import { FighterStateMachine } from '../core/FighterStateMachine';
import type { FighterSnapshot, PlayerInputFrame } from '../core/types';
import type { AttackDefinition } from './AttackDefinition';
import { setDefenseEffect, setDefenseFeedback } from './DefenseState';

export type BlockKind = 'none' | 'normal' | 'precise' | 'perfect';
export type BlockResult = { kind: BlockKind; blocked: boolean };

const NO_BLOCK: BlockResult = { kind: 'none', blocked: false };

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
  ): BlockResult {
    if (attack.hitLevel === 'throw') return NO_BLOCK;
    if (!input.held.includes('BLOCK')) {
      setDefenseFeedback(defender, 'too-late');
      return NO_BLOCK;
    }
    const correctGuard =
      attack.hitLevel === 'low'
        ? defender.guard === 'crouching'
        : attack.hitLevel === 'overhead' || attack.hitLevel === 'air'
          ? defender.guard === 'standing'
          : defender.guard !== null;
    if (!correctGuard) {
      setDefenseFeedback(defender, 'too-late');
      return NO_BLOCK;
    }

    const kind = this.blockKind(input);
    const gaugeMultiplier =
      kind === 'perfect'
        ? 0
        : kind === 'precise'
          ? balanceConfig.preciseBlockGaugeMultiplier
          : 1;
    defender.blockMeter = Math.max(
      0,
      defender.blockMeter - attack.blockDamage * gaugeMultiplier,
    );
    if (defender.blockMeter > 0 || kind === 'perfect') {
      this.recordSuccess(defender, kind);
      return { kind, blocked: true };
    }
    defender.guard = null;
    setDefenseFeedback(defender, 'too-late');
    return NO_BLOCK;
  }

  private blockKind(input: PlayerInputFrame): BlockKind {
    if (input.held.includes('PERFECT_BLOCK')) return 'perfect';
    if (input.held.includes('PRECISE_BLOCK')) return 'precise';
    return 'normal';
  }

  private recordSuccess(defender: FighterSnapshot, kind: BlockKind) {
    setDefenseFeedback(defender, kind === 'normal' ? 'too-early' : 'success');
    if (kind === 'precise') setDefenseEffect(defender, 'precise-block');
    if (kind === 'perfect') setDefenseEffect(defender, 'perfect-block');
  }
}
