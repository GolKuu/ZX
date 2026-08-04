import { STORY_CHAPTERS, type StoryOpponentId } from './campaign.js';
import { GLITCH_CINEMATIC_ASSETS, type StoryLine } from './dialogue.js';

/**
 * The staged beat a chapter's cutscene plays.
 *
 * These are the sequences `GLITCH_CINEMATIC_ASSETS` has always named. Until now
 * nothing consumed them and every chapter drew the same still portrait, so a
 * campaign about a fighter losing hold of his own coordinates had no motion in
 * it at all.
 */
export type StoryCinematicBeat =
  | 'awakening'
  | 'challenge'
  | 'falling'
  | 'resonance'
  | 'guardian'
  | 'lab-escape'
  | 'air-shift'
  | 'final-breach'
  | 'vessel-descent'
  | 'identity-reclaim'
  | 'coordinate-possession'
  | 'living-geometry';

/** Who the stage frames opposite Glitch. */
export type StoryCinematicSide = 'rival' | 'fifth' | 'construct' | 'chorus';

export interface StoryCinematic {
  readonly beat: StoryCinematicBeat;
  readonly side: StoryCinematicSide;
  /** Seconds one authored cycle of the beat runs for. */
  readonly durationSeconds: number;
}

const CINEMATICS: Readonly<Record<StoryOpponentId, StoryCinematic>> = {
  'corrupted-construct': { beat: 'awakening', side: 'construct', durationSeconds: 5.2 },
  mim: { beat: 'lab-escape', side: 'rival', durationSeconds: 4.6 },
  lucky: { beat: 'challenge', side: 'rival', durationSeconds: 4.6 },
  titan: { beat: 'guardian', side: 'rival', durationSeconds: 4.8 },
  vorgh: { beat: 'falling', side: 'rival', durationSeconds: 4.8 },
  'fractured-alliance': { beat: 'air-shift', side: 'chorus', durationSeconds: 5 },
  'memory-engine-guardian': { beat: 'guardian', side: 'construct', durationSeconds: 5 },
  'four-architects': { beat: 'resonance', side: 'chorus', durationSeconds: 5 },
  'corrupted-glitch': { beat: 'vessel-descent', side: 'construct', durationSeconds: 5.6 },
  'the-fifth': { beat: 'coordinate-possession', side: 'fifth', durationSeconds: 5.6 },
  'zero-form': { beat: 'living-geometry', side: 'chorus', durationSeconds: 6.4 },
};

export function storyCinematic(chapterIndex: number): StoryCinematic {
  const chapter = STORY_CHAPTERS[
    Math.max(0, Math.min(chapterIndex, STORY_CHAPTERS.length - 1))
  ]!;
  return CINEMATICS[chapter.opponentId];
}

/**
 * Every beat name must exist in the authored asset list, so a beat cannot be
 * invented here that the art direction never briefed.
 */
export const STORY_CINEMATIC_BEAT_NAMES: readonly string[] = [
  ...GLITCH_CINEMATIC_ASSETS.fullBodyPoses,
  ...GLITCH_CINEMATIC_ASSETS.teleportSequences,
  ...GLITCH_CINEMATIC_ASSETS.internalCoordinateSequences,
  ...GLITCH_CINEMATIC_ASSETS.corruptedTransformation,
  ...GLITCH_CINEMATIC_ASSETS.finalResonance,
];

/**
 * How hard the stage reacts to the line being spoken, from 0 to 1.
 *
 * Glitch's own lines drive the figure; a rival or the Fifth speaking pulls the
 * emphasis to the other side of the frame. The value is authored per expression
 * rather than per chapter so a line reads the same wherever it is reused.
 */
const EXPRESSION_INTENSITY: Readonly<Record<StoryLine['expression'], number>> = {
  normal: 0.25,
  determined: 0.55,
  injured: 0.6,
  frightened: 0.5,
  angry: 0.8,
  unstable: 0.9,
  influenced: 1,
  liberated: 0.7,
  other: 0.35,
  fifth: 0.85,
};

export function storyLineIntensity(line: StoryLine): number {
  return EXPRESSION_INTENSITY[line.expression];
}

/**
 * Which half of the stage the current line belongs to.
 *
 * The cutscene is a two-shot, so something has to say who is being framed. A
 * line from anyone other than Glitch swings the composition across.
 */
export function storyLineFocus(line: StoryLine): 'glitch' | 'opposite' {
  return line.expression === 'other' || line.expression === 'fifth'
    ? 'opposite'
    : 'glitch';
}
