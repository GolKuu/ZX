import type { MoveFrameData } from '../sim/frame-data.js';
import type { FighterSnapshot } from '../sim/state.js';
import {
  approachInput,
  distanceBetween,
  isThreatening,
} from './perception.js';
import type { InputPlan } from './planning.js';
import type { DeterministicRandom } from './rng.js';
import type { AiDifficultyProfile } from './types.js';

type DefenseChoice = 'guard' | 'retreat' | 'none';

export class DefensePlanner {
  private threatSerial: number | null = null;
  private choice: DefenseChoice = 'none';

  public plan(
    self: FighterSnapshot,
    observedSelf: FighterSnapshot,
    opponent: FighterSnapshot,
    moves: ReadonlyMap<string, MoveFrameData>,
    profile: AiDifficultyProfile,
    random: DeterministicRandom,
  ): InputPlan | null {
    const serial = opponent.action?.serial ?? null;
    const threatening = isThreatening(
      opponent,
      distanceBetween(observedSelf, opponent),
      moves,
      profile.threatMargin,
    );
    if (!threatening) {
      if (serial === null) {
        this.reset();
      }
      return null;
    }
    if (serial !== this.threatSerial) {
      this.threatSerial = serial;
      this.choice =
        random.percent() < profile.defensePercent
          ? random.percent() < profile.guardPercent
            ? 'guard'
            : 'retreat'
          : 'none';
    }
    if (this.choice === 'guard') {
      return { kind: 'input', input: { guard: true }, intent: 'guard' };
    }
    if (this.choice === 'retreat') {
      const approach = approachInput(self, opponent);
      return {
        kind: 'input',
        input: { movement: approach === 1 ? -1 : 1 },
        intent: 'retreat',
      };
    }
    return null;
  }

  public reset(): void {
    this.threatSerial = null;
    this.choice = 'none';
  }
}
