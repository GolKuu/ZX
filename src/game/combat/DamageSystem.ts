import { ComboSystem } from './ComboSystem';
import { EnergyComponent } from './EnergyComponent';
import { HealthComponent } from './HealthComponent';
import { FighterStateMachine } from '../core/FighterStateMachine';
import type { AttackDefinition } from './AttackDefinition';
import type { ComboSnapshot, FighterSnapshot } from '../core/types';
import { balanceConfig } from '../config/balanceConfig';
import type { BlockResult } from './BlockSystem';

export type DamageResult = { damage: number; block: BlockResult };

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
    block: BlockResult,
  ): DamageResult {
    const blocked = block.blocked;
    if (definition.sideSwitch && !blocked) this.switchSides(attacker, defender);
    const direction = attacker.x <= defender.x ? 1 : -1;
    const rawDamage =
      block.kind === 'perfect'
        ? 0
        : blocked
          ? definition.chipDamage
          : this.combos.scaledDamage(combo, definition);
    const damage = this.health.damage(defender, rawDamage);

    this.energy.gain(attacker, definition.energyGain);
    if (damage > 0) this.energy.gain(defender, Math.max(1, Math.round(damage * 0.35)));
    const pushScale = block.kind === 'perfect' ? 0 : block.kind === 'precise' ? 0.14 :
      blocked ? 0.28 : 1;
    defender.velocityX = definition.knockbackX * direction * pushScale;
    defender.velocityY = -definition.knockbackY * pushScale;
    if (defender.velocityY < 0) defender.grounded = false;

    if (this.health.isDepleted(defender)) {
      defender.attack = null;
      defender.mode = 'knockout';
      defender.modeTicksRemaining = 0;
    } else if (block.kind === 'perfect') {
      if (attacker.attack) {
        attacker.attack.frame = Math.max(
          0,
          attacker.attack.frame - balanceConfig.perfectBlockAdvantageFrames,
        );
      }
    } else if (block.kind === 'precise') {
      this.states.enterBlockstun(
        defender,
        Math.max(1, Math.round(definition.blockStun * balanceConfig.preciseBlockStunMultiplier)),
      );
    } else if (blocked) {
      this.states.enterBlockstun(defender, definition.blockStun);
    } else {
      this.combos.register(combo, defender.id, damage, definition);
      if (definition.knockdown) this.states.enterKnockdown(defender);
      else this.states.enterHitstun(defender, definition.hitStun);
    }
    return { damage, block };
  }

  private switchSides(attacker: FighterSnapshot, defender: FighterSnapshot) {
    const attackerX = attacker.x;
    attacker.x = defender.x;
    defender.x = attackerX;
  }
}
