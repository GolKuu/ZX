import type { FighterSnapshot } from '../core/types';

export class EnergyComponent {
  gain(fighter: FighterSnapshot, amount: number) {
    fighter.energy = Math.min(fighter.maxEnergy, fighter.energy + Math.max(0, amount));
  }

  canSpend(fighter: FighterSnapshot, amount: number) {
    return fighter.energy >= amount;
  }

  spend(fighter: FighterSnapshot, amount: number) {
    if (!this.canSpend(fighter, amount)) return false;
    fighter.energy -= amount;
    return true;
  }

  reset(fighter: FighterSnapshot) {
    fighter.energy = 0;
  }
}
