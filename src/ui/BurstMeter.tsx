import { SUPER_METER_STOCKS } from '@/src/hud/superMeter';
import type { HudFighterSnapshot } from '@/src/hud/types';
import styles from './BurstMeter.module.css';

export function BurstMeter({ charges, side, ultimateReady = false }: {
  readonly charges: number;
  readonly side: HudFighterSnapshot['side'];
  readonly ultimateReady?: boolean;
}) {
  return (
    <div
      className={styles.burst}
      data-side={side}
      data-ultimate={ultimateReady}
    >
      <b>{ultimateReady ? 'Burst · Ult' : 'Burst'}</b>
      <span>
        {Array.from({ length: SUPER_METER_STOCKS }, (_unused, index) => (
          <i data-active={index < charges} key={index} />
        ))}
      </span>
    </div>
  );
}
