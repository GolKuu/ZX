import type { AttackDefinition } from './AttackDefinition';
import type { FighterSnapshot } from '../core/types';

export class CharacterPassiveSystem {
  tick(fighter: FighterSnapshot) {
    fighter.vulnerableTicksRemaining = decrement(fighter.vulnerableTicksRemaining);
    fighter.landedTicksRemaining = decrement(fighter.landedTicksRemaining);
    if (fighter.characterId === 'granite') {
      fighter.passiveValue = fighter.maxArmorPlates === 0
        ? 0
        : (fighter.armorPlates / fighter.maxArmorPlates) * fighter.maxPassiveValue;
    }
  }

  incomingDamage(
    defender: FighterSnapshot,
    definition: AttackDefinition,
    damage: number,
  ) {
    const exposed = defender.characterId === 'shira' && defender.vulnerableTicksRemaining > 0;
    if (exposed) return Math.ceil(damage * 1.25);
    if (!this.canUseArmor(defender, definition)) return damage;
    defender.armorPlates -= 1;
    defender.passiveValue =
      (defender.armorPlates / defender.maxArmorPlates) * defender.maxPassiveValue;
    return Math.ceil(damage * 0.68);
  }

  absorbsReaction(defender: FighterSnapshot, definition: AttackDefinition) {
    return defender.characterId === 'granite' &&
      defender.armorPlates > 0 &&
      definition.category === 'light';
  }

  recordHit(attacker: FighterSnapshot, definition: AttackDefinition) {
    if (attacker.characterId !== 'shira') return;
    const gain = definition.category === 'light' ? 13 : definition.category === 'heavy' ? 19 : 10;
    attacker.passiveValue = Math.min(attacker.maxPassiveValue, attacker.passiveValue + gain);
    attacker.vulnerableTicksRemaining = 0;
  }

  recordTrapCut(fighter: FighterSnapshot) {
    if (fighter.characterId !== 'shira') return;
    fighter.passiveValue = Math.min(fighter.maxPassiveValue, fighter.passiveValue + 24);
  }

  spendEnhanced(fighter: FighterSnapshot, definition: AttackDefinition) {
    if (
      fighter.characterId !== 'shira' ||
      !definition.id.endsWith('enhanced-special')
    ) return;
    fighter.passiveValue = 0;
  }

  private canUseArmor(defender: FighterSnapshot, definition: AttackDefinition) {
    return defender.characterId === 'granite' &&
      defender.armorPlates > 0 &&
      definition.category !== 'throw' &&
      definition.category !== 'super';
  }
}

function decrement(value: number) {
  return Math.max(0, value - 1);
}
