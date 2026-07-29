'use client';

import { useRef } from 'react';
import { useAangAnimation } from '../animation/useAangAnimation';
import type { AangMove } from '../types';
import { AangFigure } from './AangFigure';
import { ElementEffects } from './ElementEffects';
import { OpponentDummy } from './OpponentDummy';
import styles from './AangStage.module.css';

interface AangStageProps {
  readonly move: AangMove;
  readonly replayToken: number;
  readonly onPrevious: () => void;
  readonly onReplay: () => void;
  readonly onNext: () => void;
}

export function AangStage({
  move,
  replayToken,
  onPrevious,
  onReplay,
  onNext,
}: AangStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  useAangAnimation(stageRef, move, replayToken);

  return (
    <section
      ref={stageRef}
      className={styles.stage}
      data-element={move.element}
      aria-label={`Демонстрация приёма ${move.name}`}
    >
      <div className={styles.topline}>
        <span>{move.input}</span>
        <span>{move.category === 'normal' ? 'NORMAL' : move.category.toUpperCase()}</span>
      </div>

      <svg className={styles.scene} viewBox="0 0 420 260" role="img">
        <title>{`Анимация: ${move.name}`}</title>
        <defs>
          <linearGradient id="robeGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#d64f2d" />
            <stop offset="1" stopColor="#8d261d" />
          </linearGradient>
          <linearGradient id="pantsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f2c86d" />
            <stop offset="1" stopColor="#b67a2b" />
          </linearGradient>
        </defs>
        <path className={styles.floor} d="M16 231H404" />
        <AangFigure />
        <ElementEffects />
        <OpponentDummy />
      </svg>

      <div className={styles.timeline}>
        <span data-progress />
      </div>

      <div className={styles.caption}>
        <div>
          <small>Сейчас играет</small>
          <strong>{move.name}</strong>
        </div>
        <div className={styles.controls}>
          <button type="button" onClick={onPrevious} aria-label="Предыдущий приём">←</button>
          <button type="button" onClick={onReplay}>Повторить</button>
          <button type="button" onClick={onNext} aria-label="Следующий приём">→</button>
        </div>
      </div>
    </section>
  );
}
