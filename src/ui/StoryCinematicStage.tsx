'use client';

import { isRosterCastMember, storyCast } from '@/src/story/cast';
import type { StoryLine } from '@/src/story/dialogue';
import {
  storyCinematic,
  storyLineFocus,
  storyLineIntensity,
} from '@/src/story/cinematics';
import { StoryCastFigure } from './StoryCastFigure';
import { StoryFighterSprite } from './StoryFighterSprite';
import { StorySetExtension } from './StorySetExtension';
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
  preBattle = false,
}: {
  readonly chapterIndex: number;
  readonly line: StoryLine;
  readonly lineKey: number;
  readonly preBattle?: boolean;
}) {
  const cinematic = storyCinematic(chapterIndex);
  const cast = storyCast(chapterIndex);
  const focus = storyLineFocus(line);
  return (
    <div
      key={lineKey}
      aria-hidden="true"
      className={styles.stage}
      data-beat={cinematic.beat}
      data-focus={focus}
      data-side={cinematic.side}
      data-ritual={preBattle ? 'pre-battle' : 'none'}
      style={{
        '--intensity': storyLineIntensity(line),
        '--beat-duration': `${cinematic.durationSeconds}s`,
      } as React.CSSProperties}
    >
      <StorySetExtension chapterIndex={chapterIndex} />
      <div className={styles.depth}>
        <span className={styles.planeFar} />
        <span className={styles.planeMid} />
        <span className={styles.planeNear} />
      </div>
      <div className={styles.floor} />

      <div className={styles.glitch}>
        <StoryFighterSprite
          characterId="glitch"
          expression={focus === 'glitch' ? line.expression : 'normal'}
          facing="right"
          speaking={focus === 'glitch'}
        />
      </div>

      <div className={styles.opposite} data-count={cast.members.length}>
        {cast.members.map((member) => isRosterCastMember(member) ? (
          <StoryFighterSprite
            key={member.id}
            characterId={member.id}
            corrupted={cast.corrupted}
            expression={focus === 'opposite' ? line.expression : 'normal'}
            facing="left"
            speaking={focus === 'opposite'}
          />
        ) : (
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
      {preBattle && <BattleRitual />}
    </div>
  );
}

function BattleRitual() {
  return (
    <div className={styles.ritual} aria-hidden="true">
      <span className={styles.ritualHalo} />
      <span className={styles.ritualRing} />
      <span className={styles.ritualRing} />
      <span className={styles.ritualOrbit} />
      <span className={styles.ritualShard} />
      <span className={styles.ritualShard} />
      <span className={styles.ritualShard} />
      <b className={styles.ritualLock}>LOCK // ENGAGE</b>
    </div>
  );
}

/**
 * Twelve marks, because the prologue's first line is Glitch counting twelve
 * corners in a room with four.
 */
const COORDINATE_MARKS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
