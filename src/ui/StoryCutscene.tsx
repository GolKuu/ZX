'use client';

import { useEffect, useState } from 'react';
import { STORY_CHAPTERS, storyChapterHasBattle } from '@/src/story/campaign';
import { STORY_DIALOGUE } from '@/src/story/dialogue';
import { useHudStore } from '@/src/store/hudStore';
import { StoryCinematicStage } from './StoryCinematicStage';
import styles from './StoryCutscene.module.css';

export function StoryCutscene() {
  const save = useHudStore((state) => state.storySave);
  const lineIndex = useHudStore((state) => state.storyLine);
  const setLine = useHudStore((state) => state.setStoryLine);
  const startBattle = useHudStore((state) => state.startStoryBattle);
  const completeChapter = useHudStore((state) => state.completeStoryChapter);
  const setSubtitles = useHudStore((state) => state.setStorySubtitles);
  const [paused, setPaused] = useState(false);
  const [history, setHistory] = useState(false);
  const chapterIndex = save?.chapterIndex ?? 0;
  const chapter = STORY_CHAPTERS[chapterIndex]!;
  const lines = STORY_DIALOGUE[chapterIndex]!;
  const line = lines[Math.min(lineIndex, lines.length - 1)]!;
  const language = save?.subtitleSettings.language ?? 'en';
  const auto = save?.subtitleSettings.autoAdvance ?? false;
  const atEnd = lineIndex >= lines.length - 1;
  // A chapter whose antagonist is Glitch himself has no battle to enter: its
  // last line closes the chapter and moves the campaign on.
  const hasBattle = storyChapterHasBattle(chapterIndex);
  const finish = hasBattle ? startBattle : completeChapter;

  useEffect(() => {
    if (!auto || paused || history) return;
    const timer = window.setTimeout(() => atEnd ? finish() : setLine(lineIndex + 1), 3600);
    return () => window.clearTimeout(timer);
  }, [atEnd, auto, finish, history, lineIndex, paused, setLine]);

  const advance = () => atEnd ? finish() : setLine(lineIndex + 1);
  const closingLabel = hasBattle ? 'ENTER BATTLE' : 'CLOSE CHAPTER';

  return (
    <section className={styles.scene} data-expression={line.expression} aria-label={`${chapter.title} cutscene`}>
      <StoryCinematicStage chapterIndex={chapterIndex} line={line} lineKey={lineIndex} />
      <div className={styles.scanlines} aria-hidden="true" />
      <header><span>YZX // {chapter.number}</span><h1>{chapter.title}</h1><p>{chapter.titleRu}</p></header>
      <div className={styles.subtitle} aria-live="polite">
        <strong>{language === 'ru' ? line.speakerRu : line.speaker}</strong>
        <p>{language === 'ru' ? line.ru : line.en}</p>
        <small>{language === 'ru' ? line.en : line.ru}</small>
      </div>
      <nav aria-label="Cutscene controls">
        <button type="button" onClick={() => setSubtitles(language === 'en' ? 'ru' : 'en', auto)}>{language.toUpperCase()}</button>
        <button type="button" aria-pressed={auto} onClick={() => setSubtitles(language, !auto)}>AUTO {auto ? 'ON' : 'OFF'}</button>
        <button type="button" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? 'RESUME' : 'PAUSE'}</button>
        <button type="button" aria-pressed={history} onClick={() => setHistory(!history)}>HISTORY</button>
        <button type="button" onClick={finish}>SKIP</button>
        <button className={styles.advance} type="button" onClick={advance}>{atEnd ? closingLabel : 'NEXT ›'}</button>
      </nav>
      {history && <aside className={styles.history}><h2>DIALOGUE HISTORY</h2>{lines.slice(0, lineIndex + 1).map((entry, index) => <p key={`${entry.speaker}-${index}`}><b>{language === 'ru' ? entry.speakerRu : entry.speaker}</b>{language === 'ru' ? entry.ru : entry.en}</p>)}</aside>}
      <footer>
        <span>{hasBattle ? 'TUTORIAL FOCUS' : 'CINEMATIC CHAPTER'}</span>
        <b>{chapter.focus}</b>
        <i>PLAYER // GLITCH</i>
      </footer>
    </section>
  );
}
