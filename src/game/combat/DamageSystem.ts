import { ComboSystem } from './ComboSystem';
import { EnergyComponent } from './EnergyComponent';
import { HealthComponent } from './HealthComponent';
import { FighterStateMachine } from '../core/FighterStateMachine';
import type { AttackDefinition } from './AttackDefinition';
import type { ComboSnapshot, FighterSnapshot } from '../core/types';

export type DamageResult = { damage: number; blocked: boolean };

export class DamageSystem {
  private readonly combos = new ComboSystem();
  private readonly energy = new EnergyComponent();
  private readonly health = new HealthComponent();
  private readonly states = new FighterStateMachine();

  apply(
    attacker: FighterSnapshot,
    defender: FighterSnapshot,
    definition: AttackDefinition,
    combo: ComboSnapshot,
    blocked: boolean,
  ): DamageResult {
    if (definition.sideSwitch && !blocked) this.switchSides(attacker, defender);
    const direction = attacker.x <= defender.x ? 1 : -1;
    const rawDamage = blocked
      ? definition.chipDamage
      : this.combos.scaledDamage(combo, definition);
    const damage = this.health.damage(defender, rawDamage);

    this.energy.gain(attacker, definition.energyGain);
    this.energy.gain(defender, Math.max(1, Math.round(damage * 0.35)));
    defender.velocityX = definition.knockbackX * direction * (blocked ? 0.28 : 1);
    defender.velocityY = -definition.knockbackY * (blocked ? 0.2 : 1);
    if (defender.velocityY < 0) defender.grounded = false;

    if (this.health.isDepleted(defender)) {
      defender.attack = null;
      defender.mode = 'knockout';
      defender.modeTicksRemaining = 0;
    } else if (blocked) {
      this.states.enterBlockstun(defender, definition.blockStun);
    } else {
      this.combos.register(combo, defender.id, damage);
      if (definition.knockdown) this.states.enterKnockdown(defender);
      else this.states.enterHitstun(defender, definition.hitStun);
    }
    return { damage, blocked };
  }

  private switchSides(attacker: FighterSnapshot, defender: FighterSnapshot) {
    const attackerX = attacker.x;
    attacker.x = defender.x;
    defender.x = attackerX;
  }
}
