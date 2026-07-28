import type { FighterSnapshot } from '../core/types';

export class HealthComponent {
  damage(fighter: FighterSnapshot, amount: number) {
    const applied = Math.min(fighter.health, Math.max(0, Math.round(amount)));
    fighter.health -= applied;
    return applied;
  }

  reset(fighter: FighterSnapshot) {
    fighter.health = fighter.maxHealth;
  }

  isDepleted(fighter: FighterSnapshot) {
    return fighter.health <= 0;
  }
}
