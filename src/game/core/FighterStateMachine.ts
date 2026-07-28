import type { FighterMode, FighterSnapshot } from './types';
import { balanceConfig } from '../config/balanceConfig';
import { tickDefenseState } from '../combat/DefenseState';
import { CharacterPassiveSystem } from '../combat/CharacterPassiveSystem';

export class FighterStateMachine {
  private readonly passive = new CharacterPassiveSystem();
  transition(fighter: FighterSnapshot, mode: FighterMode, durationTicks = 0) {
    if (fighter.mode === 'knockout') return;
    fighter.mode = mode;
    fighter.modeTicksRemaining = Math.max(0, durationTicks);
  }

  tick(fighter: FighterSnapshot) {
    tickDefenseState(fighter);
    this.passive.tick(fighter);
    if (fighter.modeTicksRemaining > 0) fighter.modeTicksRemaining -= 1;
    if (fighter.modeTicksRemaining > 0 || fighter.mode === 'knockout') return;
    if (fighter.mode === 'knockdown') {
      this.transition(fighter, 'wakeup', balanceConfig.wakeupTicks);
      return;
    }
    if (fighter.mode === 'hitstun' || fighter.mode === 'blockstun' || fighter.mode === 'wakeup') {
      fighter.mode = fighter.grounded ? 'idle' : 'jumping';
    }
  }

  canStartAttack(fighter: FighterSnapshot) {
    return !this.isControlLocked(fighter) && fighter.mode !== 'knockout';
  }

  isControlLocked(fighter: FighterSnapshot) {
    return [
      'attackStartup',
      'attackActive',
      'attackRecovery',
      'hitstun',
      'blockstun',
      'knockdown',
      'wakeup',
    ].includes(fighter.mode);
  }

  enterHitstun(fighter: FighterSnapshot, frames: number) {
    fighter.attack = null;
    this.transition(fighter, 'hitstun', frames);
  }

  enterBlockstun(fighter: FighterSnapshot, frames: number) {
    fighter.attack = null;
    this.transition(fighter, 'blockstun', frames);
  }

  enterKnockdown(fighter: FighterSnapshot) {
    fighter.attack = null;
    this.transition(fighter, 'knockdown', balanceConfig.knockdownTicks);
  }
}
