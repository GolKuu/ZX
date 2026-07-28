import type { AttackDefinition } from './AttackDefinition';
import type { ComboSnapshot, PlayerId } from '../core/types';
import { balanceConfig } from '../config/balanceConfig';

export class ComboSystem {
  tick(combo: ComboSnapshot) {
    if (combo.remainingTicks > 0) combo.remainingTicks -= 1;
    if (combo.remainingTicks === 0) {
      this.reset(combo);
      return;
    }
    if (combo.breakWindowTicksRemaining > 0) combo.breakWindowTicksRemaining -= 1;
    this.tickEscapeWindow(combo);
  }

  scaledDamage(combo: ComboSnapshot, attack: AttackDefinition) {
    const scale = Math.max(0.35, attack.comboScaling ** combo.hits);
    return Math.max(1, Math.round(attack.damage * scale));
  }

  register(
    combo: ComboSnapshot,
    targetId: PlayerId,
    damage: number,
    attack: AttackDefinition,
  ) {
    if (combo.targetId !== targetId || combo.remainingTicks === 0) this.reset(combo);
    combo.hits += 1;
    combo.damage += damage;
    combo.targetId = targetId;
    combo.remainingTicks = balanceConfig.comboTimeoutTicks;
    combo.escapeWindowStartsInTicks = balanceConfig.comboEscapeDelayFrames;
    combo.escapeWindowTicksRemaining = 0;
    combo.breakWindowTicksRemaining = balanceConfig.comboBreakWindowFrames;
    combo.breakAllowed =
      attack.category !== 'throw' &&
      attack.category !== 'super' &&
      !attack.isFinisher;
  }

  reset(combo: ComboSnapshot) {
    combo.hits = 0;
    combo.damage = 0;
    combo.targetId = null;
    combo.remainingTicks = 0;
    combo.escapeWindowStartsInTicks = null;
    combo.escapeWindowTicksRemaining = 0;
    combo.breakWindowTicksRemaining = 0;
    combo.breakAllowed = false;
  }

  private tickEscapeWindow(combo: ComboSnapshot) {
    if (combo.escapeWindowStartsInTicks !== null) {
      combo.escapeWindowStartsInTicks -= 1;
      if (combo.escapeWindowStartsInTicks <= 0) {
        combo.escapeWindowStartsInTicks = null;
        combo.escapeWindowTicksRemaining = balanceConfig.comboEscapeWindowFrames;
      }
      return;
    }
    if (combo.escapeWindowTicksRemaining > 0) combo.escapeWindowTicksRemaining -= 1;
  }
}
