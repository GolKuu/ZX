'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { filmShot, type StoryFilm, type StoryShot } from '@/src/story/film';
import { storyRenderFrame } from '@/src/story/frameTimeline';

export interface StoryFilmPlayback {
  readonly shotIndex: number;
  readonly shot: StoryShot;
  readonly paused: boolean;
  /** True while a dialogue shot is finished and waiting to be clicked on. */
  readonly waiting: boolean;
  /**
   * Attach to the scene root: the shot's 0–1 progress is written on it as
   * `--shot-progress`, together with the current 24 FPS drawing. A callback
   * rather than a ref object, so nothing that
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
 * scene element at a fixed 24 FPS instead of being held in state. Every CSS
 * animation in the picture is paused and redrawn at that exact film-frame time,
 * so the camera, actors and effects share one clock without re-rendering React.
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
  const renderedFrameRef = useRef(-1);
  const animationStateRef = useRef<FrameAnimationState>({
    picture: null,
    animations: [],
  });
  const shot = filmShot(film, shotIndex);
  const isLast = shotIndex >= film.shots.length - 1;

  const advance = useCallback(() => {
    elapsedRef.current = 0;
    renderedFrameRef.current = -1;
    setWaiting(false);
    if (isLast) onEnd();
    else setShotIndex((index) => index + 1);
  }, [isLast, onEnd]);

  // A new chapter reuses the mounted scene, so the film has to rewind with it.
  useEffect(() => {
    elapsedRef.current = 0;
    renderedFrameRef.current = -1;
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
      const drawing = storyRenderFrame(elapsedRef.current, total);
      if (drawing.index !== renderedFrameRef.current) {
        renderedFrameRef.current = drawing.index;
        paintStoryFrame(rootRef.current, drawing, animationStateRef.current);
      }
      if (drawing.progress < 1) {
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

interface FrameAnimationState {
  picture: Element | null;
  animations: Animation[];
}

/** Redraw the complete picture at one exact 24 FPS timeline position. */
function paintStoryFrame(
  root: HTMLElement | null,
  drawing: ReturnType<typeof storyRenderFrame>,
  animationState: FrameAnimationState,
): void {
  if (root === null) return;
  root.style.setProperty('--shot-progress', drawing.progress.toFixed(4));
  root.style.setProperty('--story-frame', String(drawing.index));
  root.dataset.storyFrame = String(drawing.index);
  root.dataset.storyFps = '24';

  const picture = root.querySelector('[data-story-frame-root="true"]');
  if (picture !== animationState.picture) {
    animationState.picture = picture;
    animationState.animations = picture?.getAnimations({ subtree: true }) ?? [];
    for (const animation of animationState.animations) animation.pause();
  }
  for (const animation of animationState.animations) {
    animation.currentTime = drawing.timeMs;
  }
}
