import { balanceConfig } from '../config/balanceConfig';
import type { AttackHit, FighterSnapshot, GameAction } from '../core/types';

export class AttackSystem {
  tryLightAttack(
    attacker: FighterSnapshot,
    defender: FighterSnapshot,
    actions: readonly GameAction[],
  ): AttackHit | null {
    if (!actions.includes('lightAttack') || attacker.attackCooldownTicks > 0) return null;
    if (attacker.mode === 'hitstun' || attacker.mode === 'knockout') return null;

    attacker.attackCooldownTicks = balanceConfig.attackCooldownTicks;
    attacker.mode = 'attacking';
    attacker.modeTicksRemaining = 10;

    const distance = Math.abs(attacker.x - defender.x);
    const heightDifference = Math.abs(attacker.y - defender.y);
    if (distance > balanceConfig.attackRange || heightDifference > balanceConfig.fighterRadius) {
      return null;
    }

    return {
      attackerId: attacker.id,
      defenderId: defender.id,
      damage: balanceConfig.lightDamage,
      hitstunTicks: balanceConfig.hitstunTicks,
    };
  }
}
