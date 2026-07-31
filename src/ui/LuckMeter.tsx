import { useEffect, useRef, useState } from 'react';
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
  const prepared = preparedBonus(tier);
  const previous = useRef(clamped);
  const [result, setResult] = useState('READY');

  useEffect(() => {
    const delta = clamped - previous.current;
    previous.current = clamped;
    if (delta === 0) return undefined;
    setResult(delta > 0 ? `+${delta} CONFIRMED` : `${delta} SPENT`);
    const timeout = window.setTimeout(() => setResult('READY'), 900);
    return () => window.clearTimeout(timeout);
  }, [clamped]);

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
      <small>{prepared} · {result}</small>
    </div>
  );
}

function preparedBonus(tier: number): string {
  if (tier >= 4) return 'JACKPOT · ALL ROUTES';
  if (tier === 3) return 'RUSH 75 · BREAK 50';
  if (tier === 2) return 'FORTUNE BREAK 50';
  if (tier === 1) return 'STEP · STRIKE · SHIFT 25';
  return 'NEXT ENHANCED AT 25';
}
