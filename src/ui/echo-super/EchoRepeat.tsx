import Image from 'next/image';
import type { CSSProperties } from 'react';
import shell from './EchoSuperShell.module.css';
import figure from './EchoRepeatFigure.module.css';
import styles from './EchoRepeat.module.css';

type CopyStyle = CSSProperties & {
  readonly '--copy-delay': string;
  readonly '--copy-index': number;
};

interface EchoRepeatProps {
  readonly fighterId: 'p1' | 'p2';
  readonly opponentMark: string;
  readonly opponentName: string;
}

export function EchoRepeat({
  fighterId,
  opponentMark,
  opponentName,
}: EchoRepeatProps) {
  return (
    <section
      aria-label={`${fighterId.toUpperCase()} ECHO: Data Overload`}
      aria-live="assertive"
      className={`${shell.scene} ${styles.scene}`}
      data-side={fighterId}
      role="status"
    >
      <div className={styles.scanlines} aria-hidden="true" />
      <header className={shell.header}>
        <span>Q + R // Tactical projection</span>
        <strong>Data Overload</strong>
        <i>Pattern complete // {opponentName}</i>
      </header>
      <div className={figure.mirror} aria-hidden="true">
        <i className={figure.glass} />
        <span>{opponentMark}</span>
      </div>
      <div className={figure.combo} aria-hidden="true">
        {Array.from({ length: 7 }, (_, index) => (
          <FighterCopy
            delay={`${index * 0.11}s`}
            index={index}
            key={index}
          />
        ))}
        <FighterCopy delay="0s" index={7} primary />
      </div>
      <div className={styles.counter} aria-hidden="true">
        <strong>7</strong>
        <span>Adaptive echoes deployed</span>
      </div>
      <div className={styles.finish} aria-hidden="true" />
    </section>
  );
}

function FighterCopy({
  delay,
  index,
  primary = false,
}: {
  readonly delay: string;
  readonly index: number;
  readonly primary?: boolean;
}) {
  return (
    <i
      className={`${figure.copy} ${primary ? figure.primary : ''}`}
      style={{ '--copy-delay': delay, '--copy-index': index } as CopyStyle}
    >
      <span className={figure.head}>
        <Image
          alt=""
          fill
          sizes="8vw"
          src="/sprites/echo-profile/head.png"
          unoptimized
        />
      </span>
      <b />
    </i>
  );
}
