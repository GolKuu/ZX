import type { PlayerId, PlayerInputFrame, SimulationSnapshot } from '../core/types';
import type { AttackContact } from './AttackSystem';
import { BlockSystem } from './BlockSystem';
import { DamageSystem } from './DamageSystem';
import { matchupBonuses } from '../data/forceMatchups';
import { CombatRhythmSystem } from './CombatRhythmSystem';

export class CombatContactResolver {
  private readonly damage = new DamageSystem();
  private readonly rhythm = new CombatRhythmSystem();

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
    const bonuses = matchupBonuses(attacker.characterId, defender.characterId);
    const block = blocks.tryBlock(
      defender,
      defenderInput,
      contact.definition,
      bonuses.blockDamageMultiplier,
    );
    const result = this.damage.apply(
      attacker,
      defender,
      contact.definition,
      state.combos[attackerId],
      block,
    );
    if (block.blocked) this.rhythm.rewardDefense(defender, block.kind);
    if (result.damage > 0) this.rhythm.rewardHit(attacker);
    if (result.damage > 0 || block.blocked) {
      state.hitStopTicks = Math.max(state.hitStopTicks, contact.definition.hitStopFrames);
    }
  }
}
