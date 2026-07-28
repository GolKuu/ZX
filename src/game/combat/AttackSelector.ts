import { getCharacterAttacks } from '../data/attacks/characterAttacks';
import type { FighterSnapshot, PlayerInputFrame } from '../core/types';
import type { AttackDefinition, CharacterAttackSet } from './AttackDefinition';

export class AttackSelector {
  select(fighter: FighterSnapshot, input: PlayerInputFrame) {
    const set = getCharacterAttacks(fighter.characterId);
    if (input.pressed.includes('SUPER_ATTACK')) return set.superAttack;
    if (input.pressed.includes('PERFECT_REVERSAL')) return set.reversal;
    if (input.pressed.includes('ENHANCED_SPECIAL')) {
      const hasResource = fighter.characterId === 'shira'
        ? fighter.passiveValue >= fighter.maxPassiveValue
        : fighter.energy >= set.enhancedSpecial.energyCost;
      return hasResource ? set.enhancedSpecial : set.special;
    }
    if (input.pressed.includes('MOMENTUM_REVERSAL')) return set.reversal;
    if (input.pressed.includes('AIR_SPECIAL')) return set.airSpecial;
    if (input.pressed.includes('DIRECTIONAL_SPECIAL')) return set.forwardSpecial;
    if (input.pressed.includes('RETREAT_SPECIAL')) return set.retreatSpecial;
    if (input.pressed.includes('SPECIAL_ATTACK')) {
      return set.special;
    }
    if (input.pressed.includes('GRAB')) return this.selectThrow(set, fighter, input);
    if (input.pressed.includes('DASH_HEAVY')) return set.dashHeavy;
    if (input.pressed.includes('AIR_HEAVY')) return set.airHeavy;
    if (input.pressed.includes('DIRECTIONAL_HEAVY')) return set.forwardHeavy;
    if (input.pressed.includes('RETREAT_HEAVY')) return set.retreatHeavy;
    if (input.pressed.includes('HEAVY_ATTACK')) {
      if (fighter.grounded && input.held.includes('CROUCH')) return set.lowHeavy;
      return this.nextInChain(set.heavy, fighter);
    }
    if (input.pressed.includes('DASH_LIGHT')) return set.dashLight;
    if (input.pressed.includes('AIR_LIGHT')) return set.air;
    if (input.pressed.includes('DIRECTIONAL_LIGHT')) return set.forwardLight;
    if (input.pressed.includes('RETREAT_LIGHT')) return set.retreatLight;
    if (!input.pressed.includes('LIGHT_ATTACK')) return null;
    if (!fighter.grounded) return set.air;
    if (input.held.includes('CROUCH')) return set.low;
    return this.nextInChain(set.lightChain, fighter);
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
      ...set.lightChain, ...set.heavy, set.low, set.lowHeavy, set.air, set.airHeavy,
      set.forwardLight, set.retreatLight, set.dashLight,
      set.forwardHeavy, set.retreatHeavy, set.dashHeavy,
      set.special, set.forwardSpecial, set.retreatSpecial, set.airSpecial, set.enhancedSpecial,
      set.grab, set.forwardThrow, set.backThrow, set.reversal, set.superAttack,
    ];
  }

  private nextInChain(chain: readonly AttackDefinition[], fighter: FighterSnapshot) {
    const currentIndex = chain.findIndex((attack) => attack.id === fighter.attack?.id);
    return chain[Math.min(currentIndex + 1, chain.length - 1)];
  }
}
