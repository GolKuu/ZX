'use client';

import { storySetDesign } from '@/src/story/setDesign';
import styles from './StorySetExtension.module.css';

const TOWERS = [0, 1, 2, 3, 4, 5, 6] as const;
const PANELS = [0, 1, 2, 3, 4] as const;

export function StorySetExtension({ chapterIndex }: { readonly chapterIndex: number }) {
  const set = storySetDesign(chapterIndex);
  return (
    <div className={styles.set} data-set={set}>
      <div className={styles.sky} />
      <div className={styles.celClouds}><i /><i /><i /></div>
      <div className={styles.orbits}><i /><i /></div>
      <div className={styles.skyline}>
        {TOWERS.map((tower) => (
          <i key={tower} style={{ '--tower': tower } as React.CSSProperties} />
        ))}
      </div>
      <div className={styles.architecture}>
        {PANELS.map((panel) => (
          <i key={panel} style={{ '--panel': panel } as React.CSSProperties} />
        ))}
      </div>
      <div className={styles.horizon} />
      <div className={styles.foreground}><i /><i /></div>
    </div>
  );
}
