/**
 * The Tutorial data model.
 *
 * Lessons are *data*, not code. A step names an objective, a dummy script and a
 * set of localization keys; the runner in `runner/` is the only thing that knows
 * how to execute one. This is what keeps 15 courses out of a single controller
 * and lets `tests/tutorial-data.test.mjs` validate every lesson without a
 * browser or a renderer.
 */

import type { CharacterId } from '../data/characterRoster.js';
import type { ObjectiveSpec } from './objectives/types.js';
import type { DummyScript } from './dummy/types.js';
import type { TextKey } from './i18n/keys.js';

export type CourseId = string;
export type ChapterId = string;
export type LessonId = string;
export type StepId = string;

export type TutorialDifficulty =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'mastery';

/**
 * How thoroughly a lesson was finished.
 *
 * `assisted` exists so that turning on help never silently claims mastery —
 * the brief's "Assistance must not silently mark the full challenge as
 * mastered" is enforced by this being a distinct value the save round-trips.
 */
export type CompletionState =
  | 'notStarted'
  | 'completed'
  | 'completedWithAssistance'
  | 'mastered';

/** Rewards may never grant a competitive advantage — see `rewards.ts`. */
export type TutorialRewardKind =
  | 'palette'
  | 'title'
  | 'emblem'
  | 'trainingPreset'
  | 'glossaryEntry'
  | 'masteryBadge';

export interface TutorialReward {
  readonly id: string;
  readonly kind: TutorialRewardKind;
  readonly labelKey: TextKey;
}

/** Inputs a step may disable, named semantically rather than by physical key. */
export type InputChannel =
  | 'move'
  | 'crouch'
  | 'jump'
  | 'dash'
  | 'guard'
  | 'attackJ'
  | 'attackK'
  | 'attackI'
  | 'attackL'
  | 'super'
  | 'ultimate';

export interface TutorialHint {
  /** Failures required before this hint appears. 0 shows it immediately. */
  readonly afterFailures: number;
  readonly textKey: TextKey;
  /** Slow the demonstration to this percent of real speed while showing it. */
  readonly demonstrationSpeedPercent?: number;
  /** Offer the simplified variant of the step. Marks the lesson `assisted`. */
  readonly offersAssistance?: boolean;
}

export interface TutorialDemonstration {
  /**
   * Scripted inputs replayed through the real `InputSampler`, so a demo can
   * only show something the player could actually do.
   */
  readonly script: DummyScript;
  readonly speedPercent?: number;
  readonly captionKey?: TextKey;
}

export interface TutorialStep {
  readonly id: StepId;
  readonly courseId: CourseId;
  readonly chapterId: ChapterId;
  readonly lessonId: LessonId;
  readonly titleKey: TextKey;
  readonly instructionKey: TextKey;
  readonly detailKey?: TextKey;
  readonly voiceLineId?: string;
  readonly demonstration?: TutorialDemonstration;
  /** Omitted means "everything is allowed". */
  readonly allowedInputs?: readonly InputChannel[];
  readonly disabledInputs?: readonly InputChannel[];
  readonly objective: ObjectiveSpec;
  readonly dummy: DummyScript;
  readonly hints: readonly TutorialHint[];
  /** Frames before the step gives up and resets. 0 means never. */
  readonly timeoutFrames?: number;
  readonly reward?: TutorialReward;
  readonly analyticsId: string;
}

export interface TutorialLesson {
  readonly id: LessonId;
  readonly courseId: CourseId;
  readonly chapterId: ChapterId;
  readonly titleKey: TextKey;
  readonly summaryKey: TextKey;
  readonly difficulty: TutorialDifficulty;
  /** Locks the lesson to one fighter. Character courses set this. */
  readonly requiresCharacter?: CharacterId;
  readonly steps: readonly TutorialStep[];
  readonly reward?: TutorialReward;
  /** Lessons that must be completed first. Validated acyclic. */
  readonly requires?: readonly LessonId[];
  /** Extra bar for `mastered`: finish with no failures and no assistance. */
  readonly masteryRequiresFlawless?: boolean;
}

export interface TutorialChapter {
  readonly id: ChapterId;
  readonly courseId: CourseId;
  readonly titleKey: TextKey;
  readonly lessons: readonly TutorialLesson[];
}

export interface TutorialCourse {
  readonly id: CourseId;
  readonly titleKey: TextKey;
  readonly summaryKey: TextKey;
  readonly difficulty: TutorialDifficulty;
  readonly order: number;
  readonly requiresCharacter?: CharacterId;
  readonly chapters: readonly TutorialChapter[];
  readonly reward?: TutorialReward;
  readonly requires?: readonly CourseId[];
}
