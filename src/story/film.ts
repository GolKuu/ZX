/**
 * Shot grammar for story cutscenes.
 *
 * A chapter used to be a still two-shot the player clicked through one line at a
 * time. A cutscene is a *film*: a list of shots, each with its own framing,
 * camera move and running time, that plays itself. This module only describes
 * the grammar — `filmScript.ts` writes the shot lists and `StoryFilmStage`
 * renders them.
 */

/** How close the camera sits to the staging. */
export type ShotFraming = 'void' | 'wide' | 'medium' | 'close' | 'macro' | 'low';

/** What the camera does across the shot's running time. */
export type ShotMove =
  | 'hold'
  | 'push'
  | 'pull'
  | 'pan-left'
  | 'pan-right'
  | 'crane'
  | 'handheld'
  | 'snap';

/** What the camera is pointed at, which is what the zoom pivots around. */
export type ShotSubject = 'space' | 'glitch' | 'opposite' | 'both';

/** The one set piece a shot is allowed to run on top of the staging. */
export type ShotEffect =
  | 'none'
  | 'count'
  | 'tear'
  | 'echo-storm'
  | 'possession'
  | 'flash'
  | 'shatter'
  | 'bloom';

/** Cue handed to the procedural score when the shot opens. */
export type ShotCue = 'hush' | 'drone' | 'tick' | 'swell' | 'impact';

/** Full-frame card a shot can carry instead of dialogue. */
export type ShotCard = 'chapter' | 'signoff';

export interface StoryCaption {
  readonly en: string;
  readonly ru: string;
}

export interface StoryShot {
  readonly id: string;
  /** Authored running time in seconds. */
  readonly seconds: number;
  readonly framing: ShotFraming;
  readonly move: ShotMove;
  readonly subject: ShotSubject;
  readonly effect: ShotEffect;
  readonly cue: ShotCue;
  /** Index into the chapter's dialogue, or `null` for a silent shot. */
  readonly line: number | null;
  /** Slug typed over a silent shot. */
  readonly caption: StoryCaption | null;
  readonly card: ShotCard | null;
}

export interface StoryFilm {
  readonly chapterId: string;
  readonly shots: readonly StoryShot[];
}

const DEFAULT_SHOT = {
  framing: 'wide',
  move: 'hold',
  subject: 'space',
  effect: 'none',
  cue: 'hush',
  line: null,
  caption: null,
  card: null,
} as const satisfies Omit<StoryShot, 'id' | 'seconds'>;

/**
 * Authoring helper. Every field has a quiet default so a shot list reads as the
 * handful of decisions that shot actually makes.
 */
export function shot(
  id: string,
  seconds: number,
  overrides: Partial<Omit<StoryShot, 'id' | 'seconds'>> = {},
): StoryShot {
  return { ...DEFAULT_SHOT, id, seconds, ...overrides };
}

export function filmSeconds(film: StoryFilm): number {
  return film.shots.reduce((total, entry) => total + entry.seconds, 0);
}

export function filmShot(film: StoryFilm, index: number): StoryShot {
  const clamped = Math.max(0, Math.min(index, film.shots.length - 1));
  return film.shots[clamped]!;
}

/**
 * Reading time for a line, in seconds.
 *
 * Both languages are on screen at once, so the slower of the two sets the pace —
 * a shot that leaves before the subtitle has been read is a shot the player
 * experiences as a bug.
 */
export function lineSeconds(en: string, ru: string): number {
  const words = Math.max(en.split(/\s+/).length, ru.split(/\s+/).length);
  return Math.min(7.4, Math.max(3.4, 1.6 + words * 0.42));
}
