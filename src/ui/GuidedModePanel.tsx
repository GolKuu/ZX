'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { readLatestHit, requestCombatReset } from '@/src/game/combatRuntime';
import { useHudStore } from '@/src/store/hudStore';
import {
  lessonProgress,
  TRAINING_LESSONS,
} from '@/src/tutorial/trainingLessons';
import styles from './GuidedModePanel.module.css';

const TUTORIAL_KEYS = ['KeyA', 'KeyD', 'KeyW', 'KeyS'] as const;

export function GuidedModePanel() {
  const mode = useHudStore((state) => state.mode);
  if (mode === 'training') return <TrainingLessonPanel />;
  if (mode === 'tutorial') return <TutorialMovementPanel />;
  return null;
}

function TrainingLessonPanel() {
  const openControls = useHudStore((state) => state.openControls);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [pressed, setPressed] = useState<ReadonlySet<string>>(new Set());
  const [hits, setHits] = useState(0);
  const lastHitSerial = useRef(readLatestHit('p2')?.serial ?? 0);
  const lesson = TRAINING_LESSONS[lessonIndex];
  const finished = lesson === undefined;
  const progress = useMemo(
    () => lesson === undefined
      ? { current: 1, required: 1 }
      : lessonProgress(lesson, pressed, hits),
    [hits, lesson, pressed],
  );
  const complete = progress.current >= progress.required;

  useEffect(() => {
    if (lesson?.kind !== 'keys') return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (lesson.required.includes(event.code)) {
        setPressed((current) => new Set([...current, event.code]));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lesson]);

  useEffect(() => {
    if (lesson?.kind !== 'hits') return;
    lastHitSerial.current = readLatestHit('p2')?.serial ?? lastHitSerial.current;
    let frame = 0;
    const watchHits = () => {
      const latest = readLatestHit('p2');
      if (
        latest !== null
        && latest.serial !== lastHitSerial.current
        && latest.attackerId === 'p1'
      ) {
        lastHitSerial.current = latest.serial;
        setHits((current) => current + 1);
      }
      frame = window.requestAnimationFrame(watchHits);
    };
    frame = window.requestAnimationFrame(watchHits);
    return () => window.cancelAnimationFrame(frame);
  }, [lesson]);

  useEffect(() => {
    if (!complete || finished) return;
    const timer = window.setTimeout(() => {
      setLessonIndex((current) => current + 1);
      setPressed(new Set());
      setHits(0);
    }, 800);
    return () => window.clearTimeout(timer);
  }, [complete, finished]);

  const restart = () => {
    setLessonIndex(0);
    setPressed(new Set());
    setHits(0);
    lastHitSerial.current = readLatestHit('p2')?.serial ?? 0;
    requestCombatReset();
  };

  if (finished) {
    return (
      <aside className={styles.panel} data-complete="true" aria-live="polite">
        <span>ТРЕНИРОВКА · ЗАВЕРШЕНА</span>
        <strong>ВСЕ УРОКИ ПРОЙДЕНЫ</strong>
        <p>Вы освоили движение и нанесли серию ударов по мишени.</p>
        <div>
          <button type="button" onClick={restart}>Пройти ещё раз</button>
          <button type="button" onClick={openControls}>Все приёмы</button>
        </div>
      </aside>
    );
  }

  const percent = Math.round((progress.current / progress.required) * 100);
  return (
    <aside className={styles.panel} data-complete={complete} aria-live="polite">
      <span>
        УРОК {String(lessonIndex + 1).padStart(2, '0')} / {String(TRAINING_LESSONS.length).padStart(2, '0')}
      </span>
      <strong>{complete ? 'УРОК ВЫПОЛНЕН' : lesson.title}</strong>
      <p>{complete ? 'Отлично. Загружаем следующий урок…' : lesson.instruction}</p>
      <div className={styles.progressTrack} aria-label={`Прогресс ${percent}%`}>
        <i style={{ width: `${percent}%` }} />
      </div>
      <small>{progress.current} / {progress.required}</small>
      <div>
        <button type="button" onClick={restart}>Начать заново</button>
        <button type="button" onClick={openControls}>Приёмы</button>
      </div>
    </aside>
  );
}

function TutorialMovementPanel() {
  const [pressed, setPressed] = useState<ReadonlySet<string>>(new Set());
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (TUTORIAL_KEYS.includes(event.code as (typeof TUTORIAL_KEYS)[number])) {
        setPressed((current) => new Set([...current, event.code]));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
  const complete = TUTORIAL_KEYS.every((key) => pressed.has(key));
  return (
    <aside className={styles.panel} data-complete={complete} aria-live="polite">
      <span>УРОК 01 · ДВИЖЕНИЕ</span>
      <strong>{complete ? 'ЗАДАНИЕ ВЫПОЛНЕНО' : 'Нажмите W, A, S и D'}</strong>
      <p>{complete ? 'Вы освоили базовое движение.' : 'Попробуйте все четыре направления.'}</p>
      <div className={styles.keys}>
        {TUTORIAL_KEYS.map((key) => (
          <kbd key={key} data-done={pressed.has(key)}>{key.slice(3)}</kbd>
        ))}
      </div>
    </aside>
  );
}
