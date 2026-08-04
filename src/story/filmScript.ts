import { storyChapter } from './campaign.js';
import { storyCinematic, storyLineFocus, storyLineIntensity } from './cinematics.js';
import { STORY_DIALOGUE, type StoryLine } from './dialogue.js';
import {
  lineSeconds,
  shot,
  type ShotEffect,
  type ShotFraming,
  type ShotMove,
  type StoryFilm,
  type StoryShot,
} from './film.js';
import { PROLOGUE_FILM } from './prologueFilm.js';

/**
 * Every chapter's cutscene, as a shot list.
 *
 * The prologue is directed by hand. The other ten are cut from the same grammar
 * out of what the chapter already declares — its beat, its side and the
 * expression on each line — so a chapter cannot ship with dialogue the camera
 * ignores.
 */

const LINE_EFFECT: Readonly<Record<StoryLine['expression'], ShotEffect>> = {
  normal: 'none',
  determined: 'none',
  injured: 'shatter',
  frightened: 'tear',
  angry: 'tear',
  unstable: 'echo-storm',
  influenced: 'possession',
  liberated: 'bloom',
  other: 'none',
  fifth: 'possession',
};

/** Whatever the chapter's antagonist is decides how its last shot looks. */
const CLOSING_EFFECT: Readonly<Record<string, ShotEffect>> = {
  rival: 'none',
  construct: 'tear',
  fifth: 'possession',
  chorus: 'echo-storm',
};

const CYCLED_MOVES: readonly ShotMove[] = ['push', 'pan-right', 'pull', 'pan-left'];

const framingFor = (intensity: number): ShotFraming =>
  intensity >= 0.7 ? 'close' : intensity >= 0.45 ? 'medium' : 'wide';

const moveFor = (intensity: number, index: number): ShotMove =>
  intensity >= 0.85 ? 'snap'
    : intensity >= 0.6 ? 'handheld'
      : CYCLED_MOVES[index % CYCLED_MOVES.length]!;

function lineShot(chapterId: string, index: number, line: StoryLine): StoryShot {
  const intensity = storyLineIntensity(line);
  return shot(`${chapterId}-line-${String(index)}`, lineSeconds(line.en, line.ru), {
    framing: framingFor(intensity),
    move: moveFor(intensity, index),
    subject: storyLineFocus(line) === 'glitch' ? 'glitch' : 'opposite',
    effect: LINE_EFFECT[line.expression],
    cue: intensity >= 0.8 ? 'swell' : 'tick',
    line: index,
  });
}

/** Index of the line the chapter turns on, which earns the one cut-to-black. */
function loudestLine(lines: readonly StoryLine[]): number {
  let best = 0;
  for (let index = 1; index < lines.length; index += 1) {
    if (storyLineIntensity(lines[index]!) > storyLineIntensity(lines[best]!)) best = index;
  }
  return best;
}

function generatedFilm(chapterIndex: number): StoryFilm {
  const chapter = storyChapter(chapterIndex);
  const lines = STORY_DIALOGUE[chapterIndex] ?? [];
  const cinematic = storyCinematic(chapterIndex);
  const turn = loudestLine(lines);
  const opening: StoryShot[] = [
    shot(`${chapter.id}-establish`, 2.8, { framing: 'void', move: 'push', cue: 'drone' }),
    shot(`${chapter.id}-card`, 2.6, { framing: 'wide', move: 'pull', card: 'chapter', cue: 'tick' }),
    shot(`${chapter.id}-approach`, 2.2, {
      framing: 'medium',
      move: 'crane',
      subject: lines[0] !== undefined && storyLineFocus(lines[0]) === 'glitch' ? 'glitch' : 'opposite',
    }),
  ];
  const spoken = lines.flatMap((line, index) => {
    const entry = lineShot(chapter.id, index, line);
    // One hard beat, straight after the line the chapter turns on.
    return index === turn && lines.length > 1
      ? [entry, shot(`${chapter.id}-beat`, 1.4, {
        framing: 'wide',
        move: 'snap',
        subject: 'both',
        effect: 'flash',
        cue: 'impact',
      })]
      : [entry];
  });
  return {
    chapterId: chapter.id,
    shots: [
      ...opening,
      ...spoken,
      shot(`${chapter.id}-close`, 2.6, {
        framing: 'low',
        move: 'pull',
        subject: 'both',
        effect: CLOSING_EFFECT[cinematic.side] ?? 'none',
        cue: 'drone',
      }),
    ],
  };
}

export function storyFilm(chapterIndex: number): StoryFilm {
  return storyChapter(chapterIndex).id === PROLOGUE_FILM.chapterId
    ? PROLOGUE_FILM
    : generatedFilm(chapterIndex);
}
