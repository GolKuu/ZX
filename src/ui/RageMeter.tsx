import styles from './RageMeter.module.css';

export function RageMeter({
  side,
  value,
}: {
  readonly side: 'left' | 'right';
  readonly value: number;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const tier = clamped >= 100
    ? 'berserk'
    : clamped >= 75
      ? 'high'
      : clamped >= 25
        ? 'medium'
        : 'low';
  return (
    <div
      aria-label={`Rage ${Math.round(clamped)} процентов, ${tier}`}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={Math.round(clamped)}
      className={styles.rage}
      data-side={side}
      data-tier={tier}
      role="meter"
    >
      <b>RAGE</b>
      <span><i style={{ width: `${clamped}%` }} /></span>
      <em>{Math.round(clamped)}</em>
    </div>
  );
}
