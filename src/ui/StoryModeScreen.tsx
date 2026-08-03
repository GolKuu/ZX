'use client';

import { useEffect } from 'react';
import { STORY_CHAPTERS } from '@/src/story/campaign';
import { useHudStore } from '@/src/store/hudStore';
import styles from './StoryModeScreen.module.css';

export function StoryModeScreen() {
  const save = useHudStore((state) => state.storySave);
  const startStory = useHudStore((state) => state.startStory);
  const continueStory = useHudStore((state) => state.continueStory);
  const back = useHudStore((state) => state.openModeMenu);
  const chapter = STORY_CHAPTERS[save?.chapterIndex ?? 0]!;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape') back();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [back]);

  return (
    <section className={styles.screen} aria-label="YZX Story Mode">
      <div className={styles.coordinates} aria-hidden="true" />
      <div className={styles.hero}>
        <span className={styles.eyebrow}>YZX // STORY CAMPAIGN</span>
        <h1>FRACTURE OF<br /><i>ZERO GEOMETRY</i></h1>
        <p>
          One fighter. Many coordinates. Follow Glitch into the experiment that
          may be keeping the world alive—or keeping it imprisoned.
        </p>
        <dl>
          <div><dt>PLAYABLE FIGHTER</dt><dd>GLITCH // LOCKED</dd></div>
          <div><dt>CAMPAIGN</dt><dd>11 BATTLES · 3 ENDINGS</dd></div>
          <div><dt>LAST SIGNAL</dt><dd>{save === null ? 'NO CHECKPOINT' : `${chapter.number} · ${chapter.title}`}</dd></div>
        </dl>
      </div>
      <div className={styles.glitchFigure} aria-hidden="true">
        <span className={styles.head} /><span className={styles.body} />
        <span className={styles.echoA} /><span className={styles.echoB} />
      </div>
      <nav className={styles.actions} aria-label="Story actions">
        <button type="button" onClick={startStory}>
          <small>NEW COORDINATE</small><strong>START STORY</strong><span>НАЧАТЬ СЮЖЕТ</span>
        </button>
        <button type="button" onClick={continueStory} disabled={save === null}>
          <small>{save === null ? 'CHECKPOINT REQUIRED' : `CHECKPOINT ${chapter.number}`}</small>
          <strong>CONTINUE STORY</strong><span>ПРОДОЛЖИТЬ СЮЖЕТ</span>
        </button>
      </nav>
      <footer><span>ESC · BACK</span><b>PLAYER CHARACTER ID: GLITCH</b></footer>
    </section>
  );
}
