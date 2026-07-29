import type { MoveFrameData } from '../sim/frame-data.js';
import type { FighterSnapshot } from '../sim/state.js';
import { oppositeDirection } from './decision.js';
import {
  approachInput,
  distanceBetween,
  isRecovering,
  isThreatening,
} from './perception.js';
import type { ImmediatePlan, PlannedAction } from './planning.js';
import type { DeterministicRandom } from './rng.js';
import { chooseMove } from './selection.js';
import type {
  AiDifficultyProfile,
  AiLoadout,
} from './types.js';

type DefenseChoice = 'guard' | 'retreat' | 'none';

export class DefensePlanner {
  private defenseSerial: number | null = null;
  private defenseChoice: DefenseChoice = 'none';
  private punishSerial: number | null = null;

  public defend(
    self: FighterSnapshot,
    observedSelf: FighterSnapshot,
    opponent: FighterSnapshot,
    profile: AiDifficultyProfile,
    moves: ReadonlyMap<string, MoveFrameData>,
    random: DeterministicRandom,
  ): ImmediatePlan | null {
    const serial = opponent.action?.serial ?? null;
    const threatening = isThreatening(
      opponent,
      distanceBetween(observedSelf, opponent),
      moves,
      profile.threatMargin,
    );
    if (!threatening) {
      if (serial === null) this.clearDefense();
      return null;
    }
    if (serial !== this.defenseSerial) {
      this.defenseSerial = serial;
      this.defenseChoice = chooseDefense(profile, random);
    }
    if (this.defenseChoice === 'guard') {
      return { kind: 'input', input: { guard: true }, intent: 'guard' };
    }
    if (this.defenseChoice === 'retreat') {
      return {
        kind: 'input',
        input: {
          movement: oppositeDirection(approachInput(self, opponent)),
        },
        intent: 'retreat',
      };
    }
    return null;
  }

  public punish(
    observedSelf: FighterSnapshot,
    opponent: FighterSnapshot,
    profile: AiDifficultyProfile,
    loadout: AiLoadout,
    moves: ReadonlyMap<string, MoveFrameData>,
    random: DeterministicRandom,
  ): PlannedAction | null {
    const serial = opponent.action?.serial ?? null;
    if (serial === null || !isRecovering(opponent, moves)) {
      if (serial === null) this.punishSerial = null;
      return null;
    }
    if (serial === this.punishSerial) return null;
    this.punishSerial = serial;
    if (random.percent() >= profile.whiffPunishPercent) return null;

    const option = chooseMove(
      loadout.whiffPunishes,
      distanceBetween(observedSelf, opponent),
      moves,
      random,
    );
    return option === null
      ? null
      : {
          kind: 'telegraph',
          request: {
            moveId: option.moveId,
            intent: 'whiffPunish',
            cue: option.cue,
            durationFrames: profile.punishTelegraphFrames,
            consumeCombo: false,
            sourceActionSerial: null,
          },
        };
  }

  public reset(): void {
    this.clearDefense();
    this.punishSerial = null;
  }

  private clearDefense(): void {
    this.defenseSerial = null;
    this.defenseChoice = 'none';
  }
}

function chooseDefense(
  profile: AiDifficultyProfile,
  random: DeterministicRandom,
): DefenseChoice {
  if (random.percent() >= profile.defensePercent) return 'none';
  return random.percent() < profile.guardPercent ? 'guard' : 'retreat';
}
