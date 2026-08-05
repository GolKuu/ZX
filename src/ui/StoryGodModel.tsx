'use client';

import type { StoryCastMember } from '@/src/story/cast';
import { isGodCastId, storyGodModel } from '@/src/story/godModels';
import styles from './StoryGodModel.module.css';

const MOTES = [
  [6, 18], [18, 72], [31, 38], [45, 84],
  [58, 14], [70, 64], [84, 32], [94, 78],
] as const;

export function StoryGodModel({ member }: { readonly member: StoryCastMember }) {
  if (!isGodCastId(member.id)) return null;
  const model = storyGodModel(member.id);
  return (
    <div
      className={styles.god}
      data-god={member.id}
      data-motion={model.motion}
      data-silhouette={model.silhouette}
      style={{
        '--coat': member.coat,
        '--shade': member.shade,
        '--accent': member.accent,
      } as React.CSSProperties}
    >
      <span className={styles.aura} />
      <span className={styles.haloRear} />
      <span className={styles.haloFront} />
      <span className={styles.mantleRear} />
      <span className={styles.legRear} />
      <span className={styles.legLead} />
      <span className={styles.torso}>
        <i className={styles.core} />
        <i className={styles.runes} />
      </span>
      <span className={styles.shoulderRear} />
      <span className={styles.shoulderLead} />
      <span className={styles.armRear} />
      <span className={styles.armLead} />
      <span className={styles.head}>
        <i className={styles.face} />
        <i className={styles.crown} />
      </span>
      <span className={styles.weapon} />
      <span className={styles.contact} />
      <span className={styles.motes}>
        {MOTES.map(([x, y], mote) => (
          <i key={`${x}:${y}`} style={{
            '--mote': mote,
            '--mote-x': `${x}%`,
            '--mote-y': `${y}%`,
          } as React.CSSProperties} />
        ))}
      </span>
    </div>
  );
}
