import type { MoveFrameData } from '../sim/frame-data.js';
import type { FighterSnapshot } from '../sim/state.js';
import type { TelegraphRequest } from './telegraph.js';
import type {
  AiDifficultyProfile,
  AiLoadout,
} from './types.js';

export class ComboPlanner {
  private queue: string[] = [];

  public constructor(
    private readonly moves: ReadonlyMap<string, MoveFrameData>,
    private readonly loadout: AiLoadout,
    private readonly profile: AiDifficultyProfile,
  ) {}

  public queueFromHit(moveId: string): void {
    if (this.queue.length > 0) {
      return;
    }
    const route = this.loadout.combos.find(
      (candidate) => candidate.moves[0] === moveId,
    );
    if (route !== undefined) {
      this.queue = route.moves.slice(1, this.profile.comboDepth + 1);
    }
  }

  public plan(
    self: FighterSnapshot,
    opponent: FighterSnapshot,
  ): TelegraphRequest | null {
    const moveId = this.queue[0];
    if (moveId === undefined) {
      return null;
    }
    if (opponent.hitstun === 0) {
      this.clear();
      return null;
    }
    const duration = this.telegraphDuration(self, moveId);
    const move = this.moves.get(moveId);
    if (
      duration === null
      || (
        self.action === null
        && move !== undefined
        && opponent.hitstun <= duration + move.startup
      )
    ) {
      this.clear();
      return null;
    }
    return {
      moveId,
      intent: 'combo',
      cue: this.cueFor(moveId),
      durationFrames: duration,
      consumeCombo: true,
      sourceActionSerial: self.action?.serial ?? null,
    };
  }

  public consume(): void {
    this.queue.shift();
  }

  public clear(): void {
    this.queue = [];
  }

  private telegraphDuration(
    self: FighterSnapshot,
    targetMoveId: string,
  ): number | null {
    const base = this.profile.comboTelegraphFrames;
    if (self.action === null) {
      return base;
    }
    const source = this.moves.get(self.action.moveId);
    const window = source?.cancels?.find((cancel) =>
      cancel.into.includes(targetMoveId),
    );
    if (window === undefined || self.action.frame >= window.frames.toExclusive) {
      return null;
    }
    const untilOpen = Math.max(0, window.frames.from - self.action.frame);
    const duration = Math.max(base, untilOpen);
    return self.action.frame + duration < window.frames.toExclusive
      ? duration
      : null;
  }

  private cueFor(moveId: string): string {
    return (
      this.loadout.neutral.find((option) => option.moveId === moveId)?.cue
      ?? this.loadout.whiffPunishes.find((option) => option.moveId === moveId)?.cue
      ?? 'combo'
    );
  }
}
