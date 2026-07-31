import styles from './LuckMeter.module.css';

export function LuckMeter({
  side,
  value,
}: {
  readonly side: 'left' | 'right';
  readonly value: number;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const tier = Math.min(4, Math.floor(clamped / 25));
  const prepared = tier === 4 ? 'JACKPOT' : tier > 0 ? `БОНУС ×${tier}` : 'НАКОПЛЕНИЕ';

  return (
    <div
      aria-label={`Удача ${Math.round(clamped)} процентов, ${prepared}`}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={clamped}
      className={styles.meter}
      data-jackpot={clamped === 100}
      data-side={side}
      role="meter"
    >
      <span className={styles.label}>LUCK {Math.round(clamped)}</span>
      <span className={styles.track}>
        <i style={{ width: `${clamped}%` }} />
        {[25, 50, 75].map((mark) => <b key={mark} style={{ left: `${mark}%` }} />)}
      </span>
      <small>{prepared} · усиление 25+</small>
    </div>
  );
}
