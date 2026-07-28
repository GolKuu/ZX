import type { PlayerId, PlayerInputFrame, SimulationSnapshot } from '../core/types';
import type { AttackContact } from './AttackSystem';
import { BlockSystem } from './BlockSystem';
import { DamageSystem } from './DamageSystem';

export class CombatContactResolver {
  private readonly damage = new DamageSystem();

  resolve(
    state: SimulationSnapshot,
    blocks: BlockSystem,
    attackerId: PlayerId,
    defenderId: PlayerId,
    contact: AttackContact,
    defenderInput: PlayerInputFrame,
  ) {
    const attacker = state.fighters[attackerId];
    const defender = state.fighters[defenderId];
    const block = blocks.tryBlock(defender, defenderInput, contact.definition);
    const result = this.damage.apply(
      attacker,
      defender,
      contact.definition,
      state.combos[attackerId],
      block,
    );
    if (result.damage > 0 || block.blocked) {
      state.hitStopTicks = Math.max(state.hitStopTicks, contact.definition.hitStopFrames);
    }
  }
}
