import type { FighterMode, FighterSnapshot } from './types';

export class FighterStateMachine {
  transition(fighter: FighterSnapshot, mode: FighterMode, durationTicks = 0) {
    if (fighter.mode === 'knockout') return;
    fighter.mode = mode;
    fighter.modeTicksRemaining = Math.max(0, durationTicks);
  }

  tick(fighter: FighterSnapshot) {
    if (fighter.modeTicksRemaining > 0) fighter.modeTicksRemaining -= 1;
    if (fighter.modeTicksRemaining > 0 || fighter.mode === 'knockout') return;
    if (fighter.mode === 'attacking' || fighter.mode === 'hitstun') fighter.mode = 'idle';
  }
}
