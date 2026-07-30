import type { HudFighterSnapshot } from '@/src/hud/types';
import styles from './BurstMeter.module.css';

export function BurstMeter({ charges, side }: {
  readonly charges: number;
  readonly side: HudFighterSnapshot['side'];
}) {
  return (
    <div className={styles.burst} data-side={side}>
      <b>Burst</b>
      <span>
        {[0, 1, 2].map((index) => (
          <i data-active={index < charges} key={index} />
        ))}
      </span>
    </div>
  );
}
