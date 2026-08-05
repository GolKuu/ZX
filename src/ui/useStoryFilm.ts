'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { filmShot, type StoryFilm, type StoryShot } from '@/src/story/film';

export interface StoryFilmPlayback {
  readonly shotIndex: number;
  readonly shot: StoryShot;
  readonly paused: boolean;
  /** True while a dialogue shot is finished and waiting to be clicked on. */
  readonly waiting: boolean;
  /**
   * Attach to the scene root: the shot's 0–1 progress is written on it as
   * `--shot-progress`. A callback rather than a ref object, so nothing that
   * renders the scene ever reads a ref while rendering.
   */
  readonly attachRoot: (node: HTMLElement | null) => void;
  readonly next: () => void;
  readonly togglePause: () => void;
}

/**
 * Plays a shot list.
 *
 * The cutscene runs itself — a scene the player has to click through one line at
 * a time is a slideshow, not a cutscene. Progress is written straight onto the
 * scene element as `--shot-progress` every frame instead of being held in state,
 * so the camera, the effects and the timeline bar all read the same clock
 * without re-rendering React sixty times a second.
 *
 * `hold` is the player's subtitle preference inverted: with auto-advance off the
 * film stops at the end of every spoken shot and waits.
 */
export function useStoryFilm(
  film: StoryFilm,
  { hold, onEnd }: { readonly hold: boolean; readonly onEnd: () => void },
): StoryFilmPlayback {
  const [shotIndex, setShotIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const rootRef = useRef<HTMLElement | null>(null);
  const elapsedRef = useRef(0);
  const shot = filmShot(film, shotIndex);
  const isLast = shotIndex >= film.shots.length - 1;

  const advance = useCallback(() => {
    elapsedRef.current = 0;
    setWaiting(false);
    if (isLast) onEnd();
    else setShotIndex((index) => index + 1);
  }, [isLast, onEnd]);

  // A new chapter reuses the mounted scene, so the film has to rewind with it.
  useEffect(() => {
    elapsedRef.current = 0;
    setShotIndex(0);
    setWaiting(false);
  }, [film]);

  useEffect(() => {
    if (paused || waiting) return;
    const current = filmShot(film, shotIndex);
    const total = current.seconds * 1_000;
    let previous = performance.now();
    let frame = requestAnimationFrame(function tick(now: number) {
      elapsedRef.current += now - previous;
      previous = now;
      const progress = Math.min(1, elapsedRef.current / total);
      rootRef.current?.style.setProperty('--shot-progress', progress.toFixed(3));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
        return;
      }
      if (hold && current.line !== null && !isLast) setWaiting(true);
      else advance();
    });
    return () => { cancelAnimationFrame(frame); };
  }, [advance, film, hold, isLast, paused, shotIndex, waiting]);

  const togglePause = useCallback(() => { setPaused((value) => !value); }, []);
  const attachRoot = useCallback((node: HTMLElement | null) => { rootRef.current = node; }, []);

  return { shotIndex, shot, paused, waiting, attachRoot, next: advance, togglePause };
}
