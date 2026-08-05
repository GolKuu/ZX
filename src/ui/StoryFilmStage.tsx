'use client';

import type { StoryLine } from '@/src/story/dialogue';
import type { StoryShot } from '@/src/story/film';
import { StoryCinematicStage } from './StoryCinematicStage';
import styles from './StoryFilmStage.module.css';

/**
 * One shot, on screen.
 *
 * The staging underneath is the same authored `StoryCinematicStage` every
 * chapter has always drawn. What this adds is a camera in front of it — framing,
 * a move, a subject to pivot on — plus the one set piece the shot is allowed to
 * run, and the lens dirt (grain, aberration, vignette) that makes the result
 * read as film rather than as a web page.
 *
 * `shotIndex` remounts the frame so every keyframe restarts on the cut.
 */
export function StoryFilmStage({
  chapterIndex,
  line,
  shot,
  shotIndex,
}: {
  readonly chapterIndex: number;
  readonly line: StoryLine;
  readonly shot: StoryShot;
  readonly shotIndex: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={styles.film}
      data-effect={shot.effect}
      data-framing={shot.framing}
      data-move={shot.move}
      data-subject={shot.subject}
    >
      <div
        key={shotIndex}
        className={styles.frame}
        style={{ '--shot-seconds': `${String(shot.seconds)}s` } as React.CSSProperties}
      >
        <div className={styles.camera}>
          <StoryCinematicStage chapterIndex={chapterIndex} line={line} lineKey={shotIndex} />
          <div className={styles.haze} />
          <div className={styles.shaft} />
          <div className={styles.rift} />
          <div className={styles.echoes}>
            {ECHO_DRIFTS.map(([dx, dy], index) => (
              <span
                key={`${String(dx)}:${String(dy)}`}
                style={{ '--echo': index, '--dx': dx, '--dy': dy } as React.CSSProperties}
              />
            ))}
          </div>
          <div className={styles.marks}>
            {COUNT_MARKS.map((mark) => (
              <span key={mark} style={{ '--mark': mark } as React.CSSProperties}>
                {String(mark + 1).padStart(2, '0')}
              </span>
            ))}
          </div>
          <div className={styles.cracks}>
            {CRACK_ANGLES.map((angle, index) => (
              <span
                key={angle}
                style={{ '--crack': index, '--rot': `${String(angle)}deg` } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
        <div className={styles.wash} />
        <div className={styles.flash} />
      </div>
      <div className={styles.aberration} />
      <div className={styles.grain} />
      <div className={styles.vignette} />
    </div>
  );
}

/**
 * Twelve, because the prologue's first line is Glitch counting twelve corners in
 * a room with four. The first four are drawn as the room's; the other eight are
 * the ones only he can see.
 */
const COUNT_MARKS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

/** Where each afterimage leaves for, in container units. */
const ECHO_DRIFTS = [[-9, -3], [8, -5], [-6, 5], [11, 2], [-13, -7]] as const;

const CRACK_ANGLES = [-38, -14, 8, 27, 49] as const;
