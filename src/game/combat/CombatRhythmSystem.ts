import type {
  AttackIntentKind,
  CombatAction,
  FighterSnapshot,
  PlayerInputFrame,
} from '../core/types';
import type { BlockKind } from './BlockSystem';

const ATTACK_INTENTS: Partial<Record<CombatAction, AttackIntentKind>> = {
  LIGHT_ATTACK: 'light',
  DIRECTIONAL_LIGHT: 'light',
  RETREAT_LIGHT: 'light',
  AIR_LIGHT: 'light',
  DASH_LIGHT: 'light',
  HEAVY_ATTACK: 'heavy',
  DIRECTIONAL_HEAVY: 'heavy',
  RETREAT_HEAVY: 'heavy',
  AIR_HEAVY: 'heavy',
  DASH_HEAVY: 'heavy',
  SPECIAL_ATTACK: 'special',
  DIRECTIONAL_SPECIAL: 'special',
  RETREAT_SPECIAL: 'special',
  AIR_SPECIAL: 'special',
  ENHANCED_SPECIAL: 'special',
  SUPER_ATTACK: 'special',
  MOMENTUM_REVERSAL: 'special',
  PERFECT_REVERSAL: 'special',
  GRAB: 'throw',
};

export class CombatRhythmSystem {
  update(
    fighter: FighterSnapshot,
    input: PlayerInputFrame,
    tick: number,
  ): PlayerInputFrame {
    this.coolDown(fighter);
    const attackAction = input.pressed.find((action) => ATTACK_INTENTS[action]);
    if (fighter.rhythmLockTicks > 0) {
      fighter.rhythmLockTicks -= 1;
      return removeAttackIntents(input);
    }
    if (!attackAction) return input;

    const intent = ATTACK_INTENTS[attackAction]!;
    const gap = tick - fighter.lastAttackIntentTick;
    const repeated = fighter.lastAttackIntent === intent;
    fighter.lastAttackIntent = intent;
    fighter.lastAttackIntentTick = tick;
    fighter.rhythmPressure = Math.min(
      fighter.maxRhythmPressure,
      fighter.rhythmPressure + pressureFor(gap, repeated),
    );
    if (fighter.rhythmPressure < fighter.maxRhythmPressure) return input;

    fighter.rhythmLockTicks = 36;
    fighter.vulnerableTicksRemaining = Math.max(fighter.vulnerableTicksRemaining, 36);
    return removeAttackIntents(input);
  }

  rewardDefense(fighter: FighterSnapshot, kind: BlockKind) {
    const reward = kind === 'perfect' ? 34 : kind === 'precise' ? 20 : 4;
    fighter.rhythmPressure = Math.max(0, fighter.rhythmPressure - reward);
    if (kind === 'perfect') fighter.rhythmLockTicks = 0;
  }

  rewardHit(fighter: FighterSnapshot) {
    fighter.rhythmPressure = Math.max(0, fighter.rhythmPressure - 10);
  }

  private coolDown(fighter: FighterSnapshot) {
    const recovery = fighter.mode === 'blocking' ? 2.2 : fighter.attack ? .3 : 1.15;
    fighter.rhythmPressure = Math.max(0, fighter.rhythmPressure - recovery);
  }
}

function pressureFor(gap: number, repeated: boolean) {
  const speedCost = gap <= 6 ? 42 : gap <= 12 ? 27 : gap <= 20 ? 12 : 5;
  return speedCost + (repeated ? 7 : 0);
}

function removeAttackIntents(input: PlayerInputFrame): PlayerInputFrame {
  return {
    held: input.held.filter((action) => !ATTACK_INTENTS[action]),
    pressed: input.pressed.filter((action) => !ATTACK_INTENTS[action]),
    released: input.released,
  };
}
