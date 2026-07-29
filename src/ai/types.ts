import type { FighterInput } from '../sim/state.js';

export type AiDifficulty = 'easy' | 'normal' | 'hard';

export type AiIntent =
  | 'idle'
  | 'approach'
  | 'retreat'
  | 'guard'
  | 'attack'
  | 'combo'
  | 'whiffPunish';

export interface AiMoveOption {
  readonly moveId: string;
  readonly minimumDistance: number;
  readonly maximumDistance: number;
  readonly weight: number;
  readonly cue: string;
}

export interface AiComboRoute {
  readonly moves: readonly string[];
}

export interface AiLoadout {
  readonly neutral: readonly AiMoveOption[];
  readonly whiffPunishes: readonly AiMoveOption[];
  readonly combos: readonly AiComboRoute[];
}

export interface AiDifficultyProfile {
  readonly reactionFrames: number;
  readonly decisionInterval: number;
  readonly neutralAttackPercent: number;
  readonly defensePercent: number;
  readonly guardPercent: number;
  readonly whiffPunishPercent: number;
  readonly errorPercent: number;
  readonly telegraphFrames: number;
  readonly comboTelegraphFrames: number;
  readonly punishTelegraphFrames: number;
  readonly comboDepth: number;
  readonly preferredMinimumDistance: number;
  readonly preferredMaximumDistance: number;
  readonly threatMargin: number;
}

export interface AiTelegraph {
  readonly moveId: string;
  readonly intent: 'attack' | 'combo' | 'whiffPunish';
  readonly cue: string;
  readonly startedFrame: number;
  readonly durationFrames: number;
  readonly remainingFrames: number;
}

interface AiEventBase {
  readonly frame: number;
  readonly fighterId: string;
  readonly moveId: string;
  readonly intent: AiTelegraph['intent'];
  readonly cue: string;
}

export interface TelegraphStartedEvent extends AiEventBase {
  readonly type: 'telegraphStarted';
  readonly durationFrames: number;
}

export interface TelegraphCommittedEvent extends AiEventBase {
  readonly type: 'telegraphCommitted';
}

export interface TelegraphCancelledEvent extends AiEventBase {
  readonly type: 'telegraphCancelled';
  readonly reason: 'hit' | 'targetRecovered' | 'stateChanged';
}

export type AiEvent =
  | TelegraphStartedEvent
  | TelegraphCommittedEvent
  | TelegraphCancelledEvent;

export interface AiDecision {
  readonly input: FighterInput;
  readonly intent: AiIntent;
  readonly telegraph: AiTelegraph | null;
  readonly events: readonly AiEvent[];
}
