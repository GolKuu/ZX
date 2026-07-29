import type { CombatEvent } from '../sim/events.js';
import type { MoveFrameData } from '../sim/frame-data.js';
import type { FighterSnapshot } from '../sim/state.js';
import { ComboPlanner } from './combo-planner.js';
import { createDecision } from './decision.js';
import { TelegraphController } from './telegraph.js';
import type {
  AiDecision,
  AiEvent,
  AiLoadout,
  TelegraphRequest,
} from './types.js';

interface CombatSignals {
  readonly events: AiEvent[];
  readonly interrupted: boolean;
}

export class ActionController {
  private readonly telegraph = new TelegraphController();
  private readonly combo: ComboPlanner;

  public constructor(
    moves: ReadonlyMap<string, MoveFrameData>,
    loadout: AiLoadout,
  ) {
    this.combo = new ComboPlanner(moves, loadout);
  }

  public processCombatEvents(
    frame: number,
    self: FighterSnapshot,
    opponent: FighterSnapshot,
    combatEvents: readonly CombatEvent[],
    comboDepth: number,
  ): CombatSignals {
    const events: AiEvent[] = [];
    const interrupted = combatEvents.some(
      (event) =>
        (event.type === 'hit' || event.type === 'block')
        && event.defenderId === self.id,
    );
    if (interrupted) {
      this.cancel(frame, self.id, 'hit', events);
      this.combo.clear();
      return { events, interrupted: true };
    }
    const landed = combatEvents.find(
      (event) =>
        event.type === 'hit'
        && event.attackerId === self.id
        && event.defenderId === opponent.id,
    );
    if (landed?.type === 'hit') {
      this.combo.recordHit(landed.moveId, comboDepth);
    }
    return { events, interrupted: false };
  }

  public advance(
    frame: number,
    self: FighterSnapshot,
    opponent: FighterSnapshot,
    events: AiEvent[],
  ): AiDecision | null {
    const request = this.telegraph.request();
    if (request === null) return null;
    const progress = this.telegraph.evaluate(frame, self.id, self, opponent);
    events.push(...progress.events);
    if (progress.cancelledReason !== undefined) {
      if (request.intent === 'combo') this.combo.clear();
      return createDecision({}, 'idle', null, events);
    }
    if (progress.committed === null) {
      return createDecision(
        {},
        request.intent,
        this.telegraph.read(),
        events,
      );
    }
    if (progress.committed.consumeCombo) this.combo.consume();
    return createDecision(
      { move: progress.committed.moveId },
      progress.committed.intent,
      null,
      events,
    );
  }

  public planCombo(
    frame: number,
    self: FighterSnapshot,
    opponent: FighterSnapshot,
    telegraphFrames: number,
    events: AiEvent[],
  ): AiDecision | null {
    const request = this.combo.plan(self, opponent, telegraphFrames);
    return request === null ? null : this.begin(frame, self, request, events);
  }

  public begin(
    frame: number,
    self: FighterSnapshot,
    request: TelegraphRequest,
    events: AiEvent[],
  ): AiDecision {
    events.push(this.telegraph.start(frame, self.id, request));
    return createDecision({}, request.intent, this.telegraph.read(), events);
  }

  public reset(): void {
    this.telegraph.reset();
    this.combo.clear();
  }

  private cancel(
    frame: number,
    fighterId: string,
    reason: 'hit' | 'targetRecovered' | 'stateChanged',
    events: AiEvent[],
  ): void {
    const event = this.telegraph.cancel(frame, fighterId, reason);
    if (event !== null) events.push(event);
  }
}
