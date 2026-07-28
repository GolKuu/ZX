import { balanceConfig } from '../config/balanceConfig';
import type {
  ComboSnapshot,
  FighterSnapshot,
  PlayerInputFrame,
} from '../core/types';
import { ComboSystem } from './ComboSystem';
import { setDefenseEffect, setDefenseFeedback } from './DefenseState';

export class DefensiveActionSystem {
  private readonly combos = new ComboSystem();

  apply(
    fighter: FighterSnapshot,
    opponent: FighterSnapshot,
    input: PlayerInputFrame,
    incomingCombo: ComboSnapshot,
  ) {
    if (input.pressed.includes('COMBO_BREAK')) {
      return this.comboBreak(fighter, opponent, incomingCombo);
    }
    if (input.pressed.includes('COMBO_ESCAPE')) {
      return this.comboEscape(fighter, opponent, incomingCombo);
    }
    return false;
  }

  private comboBreak(
    fighter: FighterSnapshot,
    opponent: FighterSnapshot,
    combo: ComboSnapshot,
  ) {
    const defense = fighter.defense;
    if (
      fighter.mode !== 'hitstun' ||
      combo.hits === 0 ||
      !combo.breakAllowed ||
      combo.breakWindowTicksRemaining === 0 ||
      defense.segments < balanceConfig.comboBreakSegmentCost
    ) return false;
    defense.segments -= balanceConfig.comboBreakSegmentCost;
    this.release(fighter);
    this.release(opponent);
    const fighterDirection = fighter.x <= opponent.x ? -1 : 1;
    fighter.velocityX = fighterDirection * balanceConfig.comboBreakKnockbackSpeed;
    opponent.velocityX = -fighterDirection * balanceConfig.comboBreakKnockbackSpeed;
    opponent.attack = null;
    setDefenseFeedback(fighter, 'success');
    setDefenseEffect(fighter, 'combo-break');
    this.combos.reset(combo);
    return true;
  }

  private comboEscape(
    fighter: FighterSnapshot,
    opponent: FighterSnapshot,
    combo: ComboSnapshot,
  ) {
    if (fighter.mode !== 'hitstun' || combo.hits === 0) return false;
    if (fighter.defense.comboEscapeCooldownTicks > 0) return false;
    if (combo.escapeWindowTicksRemaining === 0) {
      fighter.defense.comboEscapeCooldownTicks =
        balanceConfig.comboEscapeFailureCooldownFrames;
      setDefenseFeedback(
        fighter,
        combo.escapeWindowStartsInTicks !== null ? 'too-early' : 'too-late',
      );
      return false;
    }
    this.release(fighter);
    this.release(opponent);
    this.resetToNeutral(fighter, opponent);
    setDefenseFeedback(fighter, 'success');
    setDefenseEffect(fighter, 'combo-escape');
    this.combos.reset(combo);
    return true;
  }

  private release(fighter: FighterSnapshot) {
    fighter.attack = null;
    fighter.modeTicksRemaining = 0;
    fighter.mode = fighter.grounded ? 'idle' : 'jumping';
    fighter.guard = null;
  }

  private resetToNeutral(fighter: FighterSnapshot, opponent: FighterSnapshot) {
    const halfGap = balanceConfig.comboEscapeNeutralDistance / 2;
    const minimumCenter = balanceConfig.fighterRadius + halfGap;
    const maximumCenter = balanceConfig.arenaWidth - balanceConfig.fighterRadius - halfGap;
    const center = Math.min(
      maximumCenter,
      Math.max(minimumCenter, (fighter.x + opponent.x) / 2),
    );
    const fighterSide = fighter.x <= opponent.x ? -1 : 1;
    fighter.x = center + fighterSide * halfGap;
    opponent.x = center - fighterSide * halfGap;
    fighter.velocityX = 0;
    opponent.velocityX = 0;
    fighter.facing = fighterSide === -1 ? 1 : -1;
    opponent.facing = fighter.facing === 1 ? -1 : 1;
  }
}
