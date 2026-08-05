'use client';

import type { ShotEffect, ShotFraming } from '@/src/story/film';
import styles from './CinematicAtmosphere.module.css';

const DUST = [
  [8, 18, 0.7, 11], [15, 62, 1.1, 15], [23, 34, 0.55, 13], [31, 78, 0.9, 18],
  [39, 22, 0.65, 12], [47, 55, 1.2, 17], [54, 12, 0.5, 14], [61, 72, 0.8, 19],
  [68, 39, 1.05, 16], [74, 84, 0.6, 12], [81, 27, 0.9, 15], [88, 64, 0.7, 18],
  [94, 45, 1.15, 14], [4, 88, 0.75, 16], [28, 9, 0.5, 17], [57, 91, 0.95, 13],
] as const;

const DEBRIS = [
  [4, 76, -18, 1.2], [17, 91, 12, 0.8], [72, 88, -9, 1.05],
  [86, 70, 21, 0.7], [94, 93, -27, 1.35],
] as const;

export function CinematicAtmosphere({
  effect,
  framing,
}: {
  readonly effect: ShotEffect;
  readonly framing: ShotFraming;
}) {
  return (
    <div className={styles.atmosphere} data-effect={effect} data-framing={framing}>
      <div className={styles.backlight} />
      <div className={styles.volumes}><i /><i /><i /></div>
      <div className={styles.dust}>
        {DUST.map(([left, top, size, seconds], index) => (
          <i key={`${String(left)}:${String(top)}`} style={{
            '--delay': `${String(index * -0.47)}s`,
            '--left': `${String(left)}%`,
            '--size': `${String(size)}px`,
            '--speed': `${String(seconds)}s`,
            '--top': `${String(top)}%`,
          } as React.CSSProperties} />
        ))}
      </div>
      <div className={styles.debris}>
        {DEBRIS.map(([left, top, rotate, scale], index) => (
          <i key={`${String(left)}:${String(top)}`} style={{
            '--debris': index,
            '--left': `${String(left)}%`,
            '--rotate': `${String(rotate)}deg`,
            '--scale': scale,
            '--top': `${String(top)}%`,
          } as React.CSSProperties} />
        ))}
      </div>
      <div className={styles.lensFlare}><i /><i /><i /></div>
      <div className={styles.cut} />
    </div>
  );
}
