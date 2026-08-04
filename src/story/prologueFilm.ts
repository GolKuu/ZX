import { STORY_DIALOGUE } from './dialogue.js';
import { lineSeconds, shot, type StoryFilm, type StoryShot } from './film.js';

/**
 * The campaign's opening cinema, cut by hand.
 *
 * Chapter 00 is the one scene every player sees, so it is directed shot by shot
 * instead of generated: black, an empty room, the miscount, the voice, the
 * decision, and only then the chapter title. Every other chapter is assembled by
 * `filmScript.ts` from the same grammar.
 */

const PROLOGUE_LINES = STORY_DIALOGUE[0] ?? [];

/** A dialogue shot, timed to whichever subtitle takes longer to read. */
function say(
  index: number,
  overrides: Partial<Omit<StoryShot, 'id' | 'seconds' | 'line'>>,
): StoryShot {
  const line = PROLOGUE_LINES[index];
  const seconds = line === undefined ? 4 : lineSeconds(line.en, line.ru);
  return shot(`prologue-line-${String(index)}`, seconds, { ...overrides, line: index });
}

export const PROLOGUE_FILM: StoryFilm = {
  chapterId: 'prologue',
  shots: [
    // Nothing but the archive slug and a rising drone: the player is looking at
    // a recording before they are looking at a character.
    shot('prologue-black', 2.2, {
      framing: 'void',
      cue: 'drone',
      caption: {
        en: 'COORDINATE ARCHIVE // FRAGMENT 00',
        ru: 'АРХИВ КООРДИНАТ // ФРАГМЕНТ 00',
      },
    }),
    shot('prologue-room', 2.8, { framing: 'wide', move: 'push' }),
    // The miscount is shown before it is spoken.
    shot('prologue-count', 3.4, {
      framing: 'wide',
      move: 'pan-right',
      effect: 'count',
      cue: 'tick',
    }),
    shot('prologue-body', 2.6, { framing: 'medium', move: 'crane', subject: 'glitch' }),

    say(0, { framing: 'close', move: 'push', subject: 'glitch', effect: 'echo-storm', cue: 'swell' }),
    // Twelve marks reflected in a visor built to hold four.
    shot('prologue-visor', 2.4, {
      framing: 'macro',
      move: 'handheld',
      subject: 'glitch',
      effect: 'count',
      cue: 'tick',
    }),

    say(1, { framing: 'void', move: 'pull', effect: 'tear', cue: 'swell' }),
    say(2, { framing: 'medium', move: 'snap', subject: 'glitch', cue: 'tick' }),
    shot('prologue-scatter', 2, {
      framing: 'wide',
      move: 'handheld',
      subject: 'both',
      effect: 'echo-storm',
      cue: 'tick',
    }),

    say(3, { framing: 'close', move: 'push', subject: 'opposite', effect: 'possession', cue: 'swell' }),
    say(4, { framing: 'close', move: 'handheld', subject: 'glitch', effect: 'shatter', cue: 'impact' }),
    say(5, { framing: 'void', move: 'hold', effect: 'possession', cue: 'drone' }),

    // He stands up out of the frame's own perspective, then answers.
    shot('prologue-rise', 2.4, { framing: 'low', move: 'crane', subject: 'glitch', cue: 'tick' }),
    say(6, { framing: 'close', move: 'push', subject: 'glitch', effect: 'bloom', cue: 'swell' }),
    shot('prologue-break', 1.4, {
      framing: 'wide',
      move: 'snap',
      subject: 'both',
      effect: 'flash',
      cue: 'impact',
    }),

    shot('prologue-title', 3.6, { framing: 'void', move: 'pull', card: 'chapter', cue: 'drone' }),
  ],
};
