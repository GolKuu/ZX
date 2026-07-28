import { balanceConfig } from '../config/balanceConfig';
import type {
  ComboSnapshot,
  FighterSnapshot,
  PlayerInputFrame,
} from '../core/types';
import { ComboSystem } from './ComboSystem';
import { EnergyComponent } from './EnergyComponent';

export class DefensiveActionSystem {
  private readonly combos = new ComboSystem();
  private readonly energy = new EnergyComponent();

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
      return this.comboEscape(fighter, incomingCombo);
    }
    return false;
  }

  private comboBreak(
    fighter: FighterSnapshot,
    opponent: FighterSnapshot,
    combo: ComboSnapshot,
  ) {
    if (fighter.mode !== 'hitstun' || combo.hits === 0 ||
      fighter.blockMeter < balanceConfig.comboBreakCost) return false;
    fighter.blockMeter -= balanceConfig.comboBreakCost;
    this.release(fighter);
    opponent.attack = null;
    opponent.velocityX = fighter.facing * -360;
    this.combos.reset(combo);
    return true;
  }

  private comboEscape(fighter: FighterSnapshot, combo: ComboSnapshot) {
    if (fighter.mode !== 'hitstun' || combo.hits === 0 ||
      !this.energy.spend(fighter, balanceConfig.comboEscapeCost)) return false;
    this.release(fighter);
    fighter.velocityX = fighter.facing * -420;
    this.combos.reset(combo);
    return true;
  }

  private release(fighter: FighterSnapshot) {
    fighter.attack = null;
    fighter.modeTicksRemaining = 0;
    fighter.mode = fighter.grounded ? 'idle' : 'jumping';
  }
}
