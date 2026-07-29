import type {
  AiTelegraph,
  TelegraphProgress,
  TelegraphRequest,
  TelegraphCancelledEvent,
  TelegraphCommittedEvent,
  TelegraphStartedEvent,
} from './types.js';
import type { FighterSnapshot } from '../sim/state.js';
import { telegraphSourceChanged } from './telegraph-rules.js';

export class TelegraphController {
  private pending: (TelegraphRequest & {
    startedFrame: number;
    remainingFrames: number;
  }) | null = null;

  public start(
    frame: number,
    fighterId: string,
    request: TelegraphRequest,
  ): TelegraphStartedEvent {
    if (this.pending !== null) {
      throw new Error('Cannot start a telegraph while another is active');
    }
    if (!Number.isSafeInteger(request.durationFrames) || request.durationFrames <= 0) {
      throw new Error('Telegraph duration must be a positive integer');
    }
    this.pending = {
      ...request,
      startedFrame: frame,
      remainingFrames: request.durationFrames,
    };
    return {
      type: 'telegraphStarted',
      frame,
      fighterId,
      moveId: request.moveId,
      intent: request.intent,
      cue: request.cue,
      durationFrames: request.durationFrames,
    };
  }

  public advance(
    frame: number,
    fighterId: string,
    frozen: boolean,
  ): TelegraphProgress {
    if (this.pending === null || frozen) {
      return { committed: null, events: [] };
    }
    if (this.pending.remainingFrames > 1) {
      this.pending.remainingFrames -= 1;
      return { committed: null, events: [] };
    }

    const committed = this.pending;
    this.pending = null;
    const event: TelegraphCommittedEvent = {
      type: 'telegraphCommitted',
      frame,
      fighterId,
      moveId: committed.moveId,
      intent: committed.intent,
      cue: committed.cue,
    };
    return { committed, events: [event] };
  }

  public evaluate(
    frame: number,
    fighterId: string,
    self: FighterSnapshot,
    opponent: FighterSnapshot,
  ): TelegraphProgress {
    const request = this.pending;
    if (request === null) {
      return { committed: null, events: [] };
    }
    const reason =
      self.hitstun > 0 || self.health === 0
        ? 'hit'
        : request.intent === 'combo' && opponent.hitstun === 0
          ? 'targetRecovered'
          : telegraphSourceChanged(self, request)
            ? 'stateChanged'
            : null;
    if (reason !== null) {
      const event = this.cancel(frame, fighterId, reason);
      return {
        committed: null,
        events: event === null ? [] : [event],
        cancelledReason: reason,
      };
    }
    return this.advance(frame, fighterId, self.hitstop > 0);
  }

  public cancel(
    frame: number,
    fighterId: string,
    reason: TelegraphCancelledEvent['reason'],
  ): TelegraphCancelledEvent | null {
    if (this.pending === null) {
      return null;
    }
    const cancelled = this.pending;
    this.pending = null;
    return {
      type: 'telegraphCancelled',
      frame,
      fighterId,
      moveId: cancelled.moveId,
      intent: cancelled.intent,
      cue: cancelled.cue,
      reason,
    };
  }

  public read(): AiTelegraph | null {
    return this.pending === null
      ? null
      : {
          moveId: this.pending.moveId,
          intent: this.pending.intent,
          cue: this.pending.cue,
          startedFrame: this.pending.startedFrame,
          durationFrames: this.pending.durationFrames,
          remainingFrames: this.pending.remainingFrames,
        };
  }

  public request(): TelegraphRequest | null {
    return this.pending;
  }

  public reset(): void {
    this.pending = null;
  }
}
