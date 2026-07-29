import { getCharacterAttacks } from '../data/attacks/temporaryCharacterAttacks';
import type { FighterSnapshot, PlayerInputFrame } from '../core/types';
import type { AttackDefinition, CharacterAttackSet } from './AttackDefinition';

export class AttackSelector {
  select(fighter: FighterSnapshot, input: PlayerInputFrame) {
    const set = getCharacterAttacks(fighter.characterId);
    if (input.pressed.includes('SUPER_ATTACK')) return set.superAttack;
    if (input.pressed.includes('SPECIAL_ATTACK')) return set.special;
    if (input.pressed.includes('GRAB')) return this.selectThrow(set, fighter, input);
    if (input.pressed.includes('HEAVY_ATTACK')) {
      return this.isHeldToward(fighter, input) ? set.heavy[1] : set.heavy[0];
    }
    if (!input.pressed.includes('LIGHT_ATTACK')) return null;
    if (!fighter.grounded) return set.air;
    if (input.held.includes('CROUCH')) return set.low;
    const currentIndex = set.lightChain.findIndex(
      (attack) => attack.id === fighter.attack?.id,
    );
    return set.lightChain[Math.min(currentIndex + 1, 2)];
  }

  find(fighter: FighterSnapshot): AttackDefinition | null {
    if (!fighter.attack) return null;
    return this.all(getCharacterAttacks(fighter.characterId)).find(
      (attack) => attack.id === fighter.attack?.id,
    ) ?? null;
  }

  private selectThrow(
    set: CharacterAttackSet,
    fighter: FighterSnapshot,
    input: PlayerInputFrame,
  ) {
    if (this.isHeldToward(fighter, input)) return set.forwardThrow;
    if (this.isHeldAway(fighter, input)) return set.backThrow;
    return set.grab;
  }

  private isHeldToward(fighter: FighterSnapshot, input: PlayerInputFrame) {
    return input.held.includes(fighter.facing === 1 ? 'MOVE_RIGHT' : 'MOVE_LEFT');
  }

  private isHeldAway(fighter: FighterSnapshot, input: PlayerInputFrame) {
    return input.held.includes(fighter.facing === 1 ? 'MOVE_LEFT' : 'MOVE_RIGHT');
  }

  private all(set: CharacterAttackSet) {
    return [
      ...set.lightChain, ...set.heavy, set.low, set.air, set.special,
      set.grab, set.forwardThrow, set.backThrow, set.superAttack,
    ];
  }
}
