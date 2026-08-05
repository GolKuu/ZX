'use client';

import { storyCast } from '@/src/story/cast';
import type { StoryLine } from '@/src/story/dialogue';
import {
  storyCinematic,
  storyLineFocus,
  storyLineIntensity,
} from '@/src/story/cinematics';
import { StoryCastFigure } from './StoryCastFigure';
import styles from './StoryCinematicStage.module.css';

/**
 * The moving half of a story cutscene.
 *
 * Every layer is CSS keyframes over authored boxes, the same way the super
 * cinematics are built — no video, no sprite sheets, and nothing to load before
 * a chapter can open. `data-beat` selects the staging, `data-focus` swings the
 * two-shot toward whoever is speaking, and `--intensity` scales how hard the
 * whole frame reacts to the line.
 *
 * `lineKey` exists to remount the stage on every line. Restarting the keyframes
 * is what gives the scene a beat per line instead of one loop running behind
 * dialogue that has moved on.
 */
export function StoryCinematicStage({
  chapterIndex,
  line,
  lineKey,
}: {
  readonly chapterIndex: number;
  readonly line: StoryLine;
  readonly lineKey: number;
}) {
  const cinematic = storyCinematic(chapterIndex);
  const cast = storyCast(chapterIndex);
  return (
    <div
      key={lineKey}
      aria-hidden="true"
      className={styles.stage}
      data-beat={cinematic.beat}
      data-focus={storyLineFocus(line)}
      data-side={cinematic.side}
      style={{
        '--intensity': storyLineIntensity(line),
        '--beat-duration': `${cinematic.durationSeconds}s`,
      } as React.CSSProperties}
    >
      <div className={styles.depth}>
        <span className={styles.planeFar} />
        <span className={styles.planeMid} />
        <span className={styles.planeNear} />
      </div>
      <div className={styles.floor} />

      <div className={styles.glitch}>
        <span className={styles.echoLeft} />
        <span className={styles.echoRight} />
        <span className={styles.torso} />
        <span className={styles.head}>
          <i className={styles.visor} />
        </span>
        <span className={styles.armLead} />
        <span className={styles.armRear} />
        <span className={styles.legLead} />
        <span className={styles.legRear} />
        <span className={styles.fracture} />
      </div>

      <div className={styles.opposite} data-count={cast.members.length}>
        {cast.members.map((member) => (
          <StoryCastFigure key={member.id} corrupted={cast.corrupted} member={member} />
        ))}
      </div>

      <div className={styles.coordinates}>
        {COORDINATE_MARKS.map((mark) => (
          <span key={mark} style={{ '--mark': mark } as React.CSSProperties} />
        ))}
      </div>
      <div className={styles.flare} />
      <div className={styles.tear} />
    </div>
  );
}

/**
 * Twelve marks, because the prologue's first line is Glitch counting twelve
 * corners in a room with four.
 */
const COORDINATE_MARKS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
