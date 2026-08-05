import assert from 'node:assert/strict';
import test from 'node:test';
import { STORY_CHAPTERS } from '../.sim-test-build/src/story/campaign.js';
import { STORY_DIALOGUE } from '../.sim-test-build/src/story/dialogue.js';
import { filmSeconds, filmShot } from '../.sim-test-build/src/story/film.js';
import { storyFilm } from '../.sim-test-build/src/story/filmScript.js';
import { PROLOGUE_FILM } from '../.sim-test-build/src/story/prologueFilm.js';
import {
  STORY_FRAME_MS,
  STORY_FRAME_RATE,
  storyRenderFrame,
} from '../.sim-test-build/src/story/frameTimeline.js';

const FRAMINGS = ['void', 'wide', 'medium', 'close', 'macro', 'low'];
const MOVES = ['hold', 'push', 'pull', 'pan-left', 'pan-right', 'crane', 'handheld', 'snap'];
const SUBJECTS = ['space', 'glitch', 'opposite', 'both'];
const EFFECTS = ['none', 'count', 'tear', 'echo-storm', 'possession', 'flash', 'shatter', 'bloom'];
const CUES = ['hush', 'drone', 'tick', 'swell', 'impact'];

const everyFilm = () => STORY_CHAPTERS.map((chapter, index) => [chapter, storyFilm(index), index]);

test('the story director redraws one deterministic picture at 24 FPS', () => {
  assert.equal(STORY_FRAME_RATE, 24);
  assert.equal(storyRenderFrame(0, 1_000).index, 0);
  assert.equal(storyRenderFrame(STORY_FRAME_MS - 0.01, 1_000).index, 0);
  assert.equal(storyRenderFrame(STORY_FRAME_MS, 1_000).index, 1);
  assert.deepEqual(storyRenderFrame(500, 1_000), {
    index: 12,
    timeMs: 500,
    progress: 0.5,
  });
  assert.deepEqual(storyRenderFrame(1_500, 1_000), {
    index: 24,
    timeMs: 1_000,
    progress: 1,
  });
});

test('every chapter is cut as a shot list the renderer can actually stage', () => {
  for (const [chapter, film] of everyFilm()) {
    assert.equal(film.chapterId, chapter.id);
    assert.ok(film.shots.length >= 5, `${chapter.id} is only ${film.shots.length} shots long`);
    const ids = new Set(film.shots.map((shot) => shot.id));
    assert.equal(ids.size, film.shots.length, `${chapter.id} reuses a shot id`);
    for (const shot of film.shots) {
      assert.ok(FRAMINGS.includes(shot.framing), `${shot.id}: ${shot.framing}`);
      assert.ok(MOVES.includes(shot.move), `${shot.id}: ${shot.move}`);
      assert.ok(SUBJECTS.includes(shot.subject), `${shot.id}: ${shot.subject}`);
      assert.ok(EFFECTS.includes(shot.effect), `${shot.id}: ${shot.effect}`);
      assert.ok(CUES.includes(shot.cue), `${shot.id}: ${shot.cue}`);
      assert.ok(shot.seconds >= 1.2 && shot.seconds <= 8, `${shot.id} runs ${shot.seconds}s`);
    }
  }
});

test('no line is left off camera and no shot points at a line that does not exist', () => {
  for (const [chapter, film, index] of everyFilm()) {
    const lines = STORY_DIALOGUE[index];
    const spoken = film.shots.map((shot) => shot.line).filter((line) => line !== null);
    for (const line of spoken) {
      assert.ok(
        Number.isInteger(line) && line >= 0 && line < lines.length,
        `${chapter.id} frames line ${line} of ${lines.length}`,
      );
    }
    assert.deepEqual(
      [...spoken].sort((a, b) => a - b),
      lines.map((_, position) => position),
      `${chapter.id} drops or repeats a line`,
    );
    // Lines play in the order they were written.
    assert.deepEqual(spoken, [...spoken].sort((a, b) => a - b), `${chapter.id} plays its lines out of order`);
  }
});

test('a cutscene runs long enough to be watched and short enough to sit through', () => {
  for (const [chapter, film] of everyFilm()) {
    const seconds = filmSeconds(film);
    assert.ok(seconds >= 18, `${chapter.id} is over in ${seconds.toFixed(1)}s`);
    assert.ok(seconds <= 95, `${chapter.id} runs ${seconds.toFixed(1)}s`);
  }
});

test('every chapter closes on a silent shot, so no line is cut off by the button', () => {
  for (const [chapter, film] of everyFilm()) {
    assert.equal(film.shots.at(-1).line, null, `${chapter.id} ends mid-sentence`);
  }
});

test('a caption is written in both languages or it is not written at all', () => {
  for (const [, film] of everyFilm()) {
    for (const shot of film.shots) {
      if (shot.caption === null) continue;
      assert.ok(shot.caption.en.length > 3, shot.id);
      assert.ok(shot.caption.ru.length > 3, shot.id);
    }
  }
});

test('the prologue is hand-cut, not generated', () => {
  assert.equal(storyFilm(0), PROLOGUE_FILM);
  const lines = STORY_DIALOGUE[0];
  assert.ok(lines.length >= 6, 'the campaign opener is written as a scene, not a caption');
  assert.ok(
    PROLOGUE_FILM.shots.length > lines.length + 4,
    'the opener has more camera in it than it has dialogue',
  );
  // It opens on a slug over black and it ends on the chapter title.
  assert.equal(PROLOGUE_FILM.shots[0].framing, 'void');
  assert.notEqual(PROLOGUE_FILM.shots[0].caption, null);
  assert.equal(PROLOGUE_FILM.shots.at(-1).card, 'chapter');
  const effects = new Set(PROLOGUE_FILM.shots.map((shot) => shot.effect));
  assert.ok(effects.size >= 6, `only ${effects.size} distinct set pieces in the opener`);
  assert.ok(effects.has('count'), 'the miscount the scene is about is never shown');
});

test('a generated chapter still gets an establish, a title card and a beat', () => {
  const film = storyFilm(1);
  assert.notEqual(film, PROLOGUE_FILM);
  assert.equal(film.shots[0].framing, 'void');
  assert.ok(film.shots.some((shot) => shot.card === 'chapter'));
  assert.ok(film.shots.some((shot) => shot.effect === 'flash'));
});

test('the film index is clamped rather than trusted', () => {
  const film = storyFilm(0);
  assert.equal(filmShot(film, -4), film.shots[0]);
  assert.equal(filmShot(film, 999), film.shots.at(-1));
  assert.deepEqual(storyFilm(-3), storyFilm(0));
  assert.deepEqual(storyFilm(99), storyFilm(STORY_CHAPTERS.length - 1));
});
