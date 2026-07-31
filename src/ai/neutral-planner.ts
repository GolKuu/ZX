import type { MoveFrameData } from '../sim/frame-data.js';
import type { FighterInput, FighterSnapshot } from '../sim/state.js';
import {
  approachInput,
  distanceBetween,
} from './perception.js';
import { oppositeDirection } from './decision.js';
import type { PlannedAction } from './planning.js';
import type { DeterministicRandom } from './rng.js';
import { chooseMove } from './selection.js';
import type {
  AiDifficultyProfile,
  AiLoadout,
} from './types.js';

export class NeutralPlanner {
  private cooldown = 0;

  public plan(
    self: FighterSnapshot,
    opponent: FighterSnapshot,
    profile: AiDifficultyProfile,
    loadout: AiLoadout,
    moves: ReadonlyMap<string, MoveFrameData>,
    random: DeterministicRandom,
  ): PlannedAction {
    const distance = distanceBetween(self, opponent);
    if (distance > profile.preferredMaximumDistance) {
      return inputPlan({ movement: approachInput(self, opponent) }, 'approach');
    }
    if (distance < profile.preferredMinimumDistance) {
      return inputPlan(
        { movement: oppositeDirection(approachInput(self, opponent)) },
        'retreat',
      );
    }
    if (this.cooldown > 0) {
      this.cooldown -= 1;
      return inputPlan({}, 'idle');
    }

    this.cooldown = profile.decisionInterval;
    if (
      random.percent() < profile.errorPercent
      || random.percent() >= profile.neutralAttackPercent
    ) {
      return inputPlan({}, 'idle');
    }
    const option = chooseMove(
      loadout.neutral,
      distance,
      moves,
      random,
      self.resource,
    );
    return option === null
      ? inputPlan({}, 'idle')
      : {
          kind: 'telegraph',
          request: {
            moveId: option.moveId,
            intent: 'attack',
            cue: option.cue,
            durationFrames: profile.telegraphFrames,
            consumeCombo: false,
            sourceActionSerial: null,
          },
        };
  }

  public reset(): void {
    this.cooldown = 0;
  }
}

function inputPlan(
  input: FighterInput,
  intent: 'approach' | 'retreat' | 'idle',
): PlannedAction {
  return { kind: 'input', input, intent };
}
