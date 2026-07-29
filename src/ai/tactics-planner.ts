import type { MoveFrameData } from '../sim/frame-data.js';
import type { FighterSnapshot } from '../sim/state.js';
import {
  approachInput,
  distanceBetween,
  isRecovering,
} from './perception.js';
import type { AttackPlan, TacticalPlan } from './planning.js';
import type { DeterministicRandom } from './rng.js';
import { chooseMove } from './selection.js';
import type {
  AiDifficultyProfile,
  AiLoadout,
  AiMoveOption,
} from './types.js';

export class TacticsPlanner {
  private decisionCooldown = 0;
  private punishSerial: number | null = null;

  public planPunish(
    self: FighterSnapshot,
    observedSelf: FighterSnapshot,
    opponent: FighterSnapshot,
    moves: ReadonlyMap<string, MoveFrameData>,
    loadout: AiLoadout,
    profile: AiDifficultyProfile,
    random: DeterministicRandom,
  ): AttackPlan | null {
    const serial = opponent.action?.serial ?? null;
    if (serial === null || !isRecovering(opponent, moves)) {
      if (serial === null) {
        this.punishSerial = null;
      }
      return null;
    }
    if (serial === this.punishSerial) {
      return null;
    }
    this.punishSerial = serial;
    if (random.percent() >= profile.whiffPunishPercent) {
      return null;
    }
    const option = chooseMove(
      loadout.whiffPunishes,
      distanceBetween(observedSelf, opponent),
      moves,
      random,
    );
    return option === null
      ? null
      : attackPlan(option, 'whiffPunish', profile.punishTelegraphFrames, self);
  }

  public planNeutral(
    self: FighterSnapshot,
    opponent: FighterSnapshot,
    moves: ReadonlyMap<string, MoveFrameData>,
    loadout: AiLoadout,
    profile: AiDifficultyProfile,
    random: DeterministicRandom,
  ): TacticalPlan {
    const distance = distanceBetween(self, opponent);
    const approach = approachInput(self, opponent);
    if (distance > profile.preferredMaximumDistance) {
      return { kind: 'input', input: { movement: approach }, intent: 'approach' };
    }
    if (distance < profile.preferredMinimumDistance) {
      return {
        kind: 'input',
        input: { movement: approach === 1 ? -1 : 1 },
        intent: 'retreat',
      };
    }
    if (this.decisionCooldown > 0) {
      this.decisionCooldown -= 1;
      return { kind: 'input', input: {}, intent: 'idle' };
    }
    this.decisionCooldown = profile.decisionInterval;
    if (
      random.percent() < profile.errorPercent
      || random.percent() >= profile.neutralAttackPercent
    ) {
      return { kind: 'input', input: {}, intent: 'idle' };
    }
    const option = chooseMove(loadout.neutral, distance, moves, random);
    return option === null
      ? { kind: 'input', input: {}, intent: 'idle' }
      : attackPlan(option, 'attack', profile.telegraphFrames, self);
  }

  public reset(): void {
    this.decisionCooldown = 0;
    this.punishSerial = null;
  }
}

function attackPlan(
  option: AiMoveOption,
  intent: 'attack' | 'whiffPunish',
  durationFrames: number,
  self: FighterSnapshot,
): AttackPlan {
  return {
    kind: 'attack',
    request: {
      moveId: option.moveId,
      intent,
      cue: option.cue,
      durationFrames,
      consumeCombo: false,
      sourceActionSerial: self.action?.serial ?? null,
    },
  };
}
