'use client';

import { useEffect, useState } from 'react';
import type { StoryChapter } from '@/src/story/campaign';
import type { StoryLine } from '@/src/story/dialogue';
import type { StoryShot } from '@/src/story/film';
import styles from './StoryFilmCaption.module.css';

/**
 * Everything the shot says.
 *
 * A shot carries dialogue, a slug, a title card — or nothing at all, and a
 * silent shot has to be genuinely silent for the loud ones to land. Text types
 * itself in rather than appearing, which is what keeps a still frame alive while
 * the line is being read.
 */
export function StoryFilmCaption({
  chapter,
  language,
  line,
  shot,
  shotIndex,
}: {
  readonly chapter: StoryChapter;
  readonly language: 'en' | 'ru';
  readonly line: StoryLine | null;
  readonly shot: StoryShot;
  readonly shotIndex: number;
}) {
  if (shot.card === 'chapter') {
    return (
      <div className={styles.card} key={shotIndex} data-kind="chapter">
        <span>YZX // CHAPTER {chapter.number}</span>
        <strong>{chapter.title}</strong>
        <em>{chapter.titleRu}</em>
      </div>
    );
  }

  if (shot.caption !== null) {
    return (
      <p className={styles.slug} key={shotIndex}>
        <Typed key={`${shotIndex}:slug`} seconds={1.1} text={shot.caption[language]} />
      </p>
    );
  }

  if (line === null) return null;

  const primary = language === 'ru' ? line.ru : line.en;
  const secondary = language === 'ru' ? line.en : line.ru;
  return (
    <figure className={styles.subtitle} key={shotIndex} data-expression={line.expression}>
      <figcaption>{language === 'ru' ? line.speakerRu : line.speaker}</figcaption>
      <blockquote aria-live="polite">
        <Typed key={`${shotIndex}:line`} seconds={Math.min(1.5, shot.seconds * 0.4)} text={primary} />
      </blockquote>
      <small>{secondary}</small>
    </figure>
  );
}

/** Types `text` out over `seconds`, then stops. */
function Typed({ seconds, text }: { readonly seconds: number; readonly text: string }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || text.length === 0) {
      setShown(text.length);
      return;
    }
    setShown(0);
    const step = Math.max(14, (seconds * 1_000) / text.length);
    const timer = window.setInterval(() => {
      setShown((count) => {
        if (count >= text.length) window.clearInterval(timer);
        return Math.min(text.length, count + 1);
      });
    }, step);
    return () => { window.clearInterval(timer); };
  }, [seconds, text]);

  return (
    <span className={styles.typed} data-done={shown >= text.length}>
      {text.slice(0, shown)}
    </span>
  );
}
