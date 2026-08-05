'use client';

import type { StoryCastMember } from '@/src/story/cast';
import { StoryGodModel } from './StoryGodModel';
import styles from './StoryCastFigure.module.css';

/**
 * One antagonist, drawn.
 *
 * The same rig every time — head, torso, two arms, two legs, one signature prop
 * — re-proportioned by `data-build` and coloured from the cast entry. A fighter
 * keeps the palette it fights in, a god does not have legs, and the Fifth is
 * drawn as the hole where a body would be.
 *
 * `corrupted` is the Fifth wearing them: the chapter-05 alliance and the vessel
 * are the same figures with its colour bleeding through.
 */
export function StoryCastFigure({
  corrupted,
  member,
}: {
  readonly corrupted: boolean;
  readonly member: StoryCastMember;
}) {
  if (member.build === 'god') return <StoryGodModel member={member} />;
  return (
    <div
      className={styles.figure}
      data-build={member.build}
      data-corrupted={corrupted}
      data-signature={member.signature}
      style={{
        '--coat': member.coat,
        '--shade': member.shade,
        '--accent': member.accent,
      } as React.CSSProperties}
    >
      <span className={styles.aura} />
      <span className={styles.legRear} />
      <span className={styles.legLead} />
      <span className={styles.armRear} />
      <span className={styles.torso} />
      <span className={styles.armLead} />
      <span className={styles.head}>
        <i className={styles.eye} />
      </span>
      <span className={styles.mark} />
      <span className={styles.contact} />
    </div>
  );
}
