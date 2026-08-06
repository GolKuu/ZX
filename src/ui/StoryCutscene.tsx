'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CutsceneScore } from '@/src/audio/CutsceneScore';
import { STORY_CHAPTERS, storyChapterHasBattle } from '@/src/story/campaign';
import { STORY_DIALOGUE } from '@/src/story/dialogue';
import { filmShot } from '@/src/story/film';
import { storyFilm } from '@/src/story/filmScript';
import { useHudStore } from '@/src/store/hudStore';
import { StoryFilmCaption } from './StoryFilmCaption';
import { StoryFilmControls } from './StoryFilmControls';
import { StoryFilmStage } from './StoryFilmStage';
import { useStoryFilm } from './useStoryFilm';
import styles from './StoryCutscene.module.css';

/**
 * A chapter's cutscene, played as a film.
 *
 * The scene owns three things and delegates the rest: the shot list for this
 * chapter (`storyFilm`), the clock that plays it (`useStoryFilm`) and the score
 * that runs under it. The picture is `StoryFilmStage`, the words are
 * `StoryFilmCaption`, the player's controls are `StoryFilmControls`.
 */
export function StoryCutscene() {
  const save = useHudStore((state) => state.storySave);
  const setLine = useHudStore((state) => state.setStoryLine);
  const startBattle = useHudStore((state) => state.startStoryBattle);
  const completeChapter = useHudStore((state) => state.completeStoryChapter);
  const setSubtitles = useHudStore((state) => state.setStorySubtitles);
  const [history, setHistory] = useState(false);
  const [muted, setMuted] = useState(false);
  const scoreRef = useRef<CutsceneScore | null>(null);

  const chapterIndex = save?.chapterIndex ?? 0;
  const chapter = STORY_CHAPTERS[chapterIndex]!;
  const lines = STORY_DIALOGUE[chapterIndex]!;
  const language = save?.subtitleSettings.language ?? 'en';
  const auto = save?.subtitleSettings.autoAdvance ?? true;
  // A chapter whose antagonist is Glitch himself has no battle to enter: its
  // last shot closes the chapter and moves the campaign on.
  const hasBattle = storyChapterHasBattle(chapterIndex);
  const finish = hasBattle ? startBattle : completeChapter;
  const film = useMemo(() => storyFilm(chapterIndex), [chapterIndex]);
  const { attachRoot, next, paused, shot, shotIndex, togglePause, waiting } =
    useStoryFilm(film, { hold: !auto, onEnd: finish });
  const line = shot.line === null ? null : lines[shot.line] ?? null;
  // Everything said so far, including during the silent shots that follow a line.
  const spoken = lines.slice(0, film.shots
    .slice(0, shotIndex + 1)
    .reduce((count, entry) => entry.line === null ? count : Math.max(count, entry.line + 1), 0));

  useEffect(() => {
    scoreRef.current ??= new CutsceneScore();
    const score = scoreRef.current;
    return () => { score.stop(); scoreRef.current = null; };
  }, []);

  useEffect(() => { scoreRef.current?.setMuted(muted); }, [muted]);

  useEffect(() => {
    scoreRef.current?.cue(filmShot(film, shotIndex).cue);
  }, [film, shotIndex]);

  // The store still tracks the spoken line, so the dialogue history and any
  // checkpoint written mid-chapter agree with what is on screen.
  useEffect(() => {
    if (shot.line !== null) setLine(shot.line);
  }, [setLine, shot.line]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault();
        next();
      } else if (event.code === 'Escape') {
        event.preventDefault();
        finish();
      } else if (event.code === 'KeyP') togglePause();
      else if (event.code === 'KeyH') setHistory((open) => !open);
      else if (event.code === 'KeyM') setMuted((value) => !value);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => { window.removeEventListener('keydown', onKeyDown); };
  }, [finish, next, togglePause]);

  return (
    <section
      ref={attachRoot}
      aria-label={`${chapter.title} cutscene`}
      className={styles.scene}
      data-paused={paused}
    >
      <StoryFilmStage
        chapterIndex={chapterIndex}
        line={line ?? lines[0]!}
        shot={shot}
        shotIndex={shotIndex}
        preBattle={hasBattle && shotIndex >= film.shots.length - 1}
      />
      <div className={styles.scanlines} aria-hidden="true" />
      <div className={styles.barTop} aria-hidden="true" />
      <div className={styles.barBottom} aria-hidden="true" />

      <header className={styles.slate}>
        <i aria-hidden="true" />
        <span>YZX // CH {chapter.number}</span>
        <small>{chapter.focus}</small>
      </header>

      <StoryFilmCaption
        chapter={chapter}
        language={language}
        line={line}
        shot={shot}
        shotIndex={shotIndex}
      />

      {paused && <p className={styles.paused}>PAUSED</p>}

      <StoryFilmControls
        atEnd={shotIndex >= film.shots.length - 1}
        auto={auto}
        closingLabel={hasBattle ? 'ENTER BATTLE' : 'CLOSE CHAPTER'}
        film={film}
        historyOpen={history}
        language={language}
        muted={muted}
        onAdvance={next}
        onSkip={finish}
        onToggleAuto={() => { setSubtitles(language, !auto); }}
        onToggleHistory={() => { setHistory((open) => !open); }}
        onToggleLanguage={() => { setSubtitles(language === 'en' ? 'ru' : 'en', auto); }}
        onToggleMute={() => { setMuted((value) => !value); }}
        onTogglePause={togglePause}
        paused={paused}
        shotIndex={shotIndex}
        waiting={waiting}
      />

      {history && (
        <aside className={styles.history}>
          <h2>DIALOGUE HISTORY · {chapter.title}</h2>
          {spoken.map((entry, index) => (
            <p key={`${entry.speaker}-${String(index)}`}>
              <b>{language === 'ru' ? entry.speakerRu : entry.speaker}</b>
              {language === 'ru' ? entry.ru : entry.en}
            </p>
          ))}
        </aside>
      )}
    </section>
  );
}
