'use client';

import type { StoryFilm } from '@/src/story/film';
import styles from './StoryFilmControls.module.css';

export interface StoryFilmControlsProps {
  readonly film: StoryFilm;
  readonly shotIndex: number;
  readonly paused: boolean;
  readonly waiting: boolean;
  readonly muted: boolean;
  readonly auto: boolean;
  readonly language: 'en' | 'ru';
  readonly closingLabel: string;
  readonly atEnd: boolean;
  readonly onAdvance: () => void;
  readonly onTogglePause: () => void;
  readonly onToggleAuto: () => void;
  readonly onToggleLanguage: () => void;
  readonly onToggleMute: () => void;
  readonly onToggleHistory: () => void;
  readonly onSkip: () => void;
  readonly historyOpen: boolean;
}

/**
 * The player's side of the cutscene.
 *
 * A timeline of the actual shot list sits above the buttons — each segment is as
 * wide as that shot is long — so the player can see how much film is left rather
 * than guessing whether the scene is two lines or twenty.
 */
export function StoryFilmControls(props: StoryFilmControlsProps) {
  const { film, shotIndex } = props;
  return (
    <nav aria-label="Cutscene controls" className={styles.controls}>
      <div aria-hidden="true" className={styles.timeline}>
        {film.shots.map((shot, index) => (
          <span
            key={shot.id}
            data-state={index < shotIndex ? 'done' : index === shotIndex ? 'live' : 'todo'}
            style={{ flexGrow: shot.seconds }}
          />
        ))}
      </div>
      <div className={styles.buttons}>
        <button type="button" onClick={props.onToggleLanguage}>{props.language.toUpperCase()}</button>
        <button type="button" aria-pressed={props.auto} onClick={props.onToggleAuto}>
          AUTO {props.auto ? 'ON' : 'OFF'}
        </button>
        <button type="button" aria-pressed={props.paused} onClick={props.onTogglePause}>
          {props.paused ? 'RESUME' : 'PAUSE'}
        </button>
        <button type="button" aria-pressed={!props.muted} onClick={props.onToggleMute}>
          SOUND {props.muted ? 'OFF' : 'ON'}
        </button>
        <button type="button" aria-pressed={props.historyOpen} onClick={props.onToggleHistory}>HISTORY</button>
        <button type="button" onClick={props.onSkip}>SKIP</button>
        <button className={styles.advance} type="button" onClick={props.onAdvance} data-waiting={props.waiting}>
          {props.atEnd ? props.closingLabel : props.waiting ? 'CONTINUE ›' : 'NEXT SHOT ›'}
        </button>
      </div>
    </nav>
  );
}
