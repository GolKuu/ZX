'use client';

import { CHARACTER_ROSTER } from '@/src/data/characterRoster';
import { useHudStore, type HudScreen } from '@/src/store/hudStore';
import styles from './FeatureHub.module.css';

const LESSONS = [
  'Движение', 'J/K/I/L атаки', 'Блок стоя', 'Блок сидя',
  'Броски', 'Прыжки', 'Рывки', 'Спецприёмы', 'Комбо',
  'Механика бойца', 'Супер', 'Ультимейт',
];

export function FeatureHub({ screen }: { readonly screen: HudScreen }) {
  const back = useHudStore((state) => state.openModeMenu);
  const begin = useHudStore((state) => state.openCharacterSelect);
  if (screen === 'progression') return <ProgressionHub onBack={back} />;
  const tutorial = screen === 'tutorial';

  return (
    <div className={styles.scrim} role="dialog" aria-modal="true">
      <header>
        <span>{tutorial ? 'АКАДЕМИЯ NULL CIRCLE' : 'ИСТОРИЯ · СЕЗОН 01'}</span>
        <h1>{tutorial ? 'НАУЧИТЕСЬ ДРАТЬСЯ' : 'РАЗЛОМ ПРОТОКОЛА'}</h1>
        <p>{tutorial
          ? 'Каждый урок даёт команду, демонстрацию, практическую цель и объяснение ошибки.'
          : 'MIM входит в Null Circle, чтобы найти источник сигнала, стирающего память бойцов.'}</p>
      </header>
      {tutorial ? <LessonGrid /> : <StoryChapters />}
      <footer>
        <button type="button" onClick={back}>Назад</button>
        <button type="button" onClick={begin}>
          {tutorial ? 'Начать первый урок' : 'Играть пролог'}
        </button>
      </footer>
    </div>
  );
}

function LessonGrid() {
  return (
    <ol className={styles.lessons}>
      {LESSONS.map((lesson, index) => (
        <li key={lesson} data-available={index === 0}>
          <b>{String(index + 1).padStart(2, '0')}</b><span>{lesson}</span>
        </li>
      ))}
    </ol>
  );
}

function StoryChapters() {
  return (
    <ol className={styles.chapters}>
      {['Пролог · Сигнал', ...CHARACTER_ROSTER.map((fighter) => `Глава · ${fighter.displayName}`), 'Соперник · Зеркало', 'Финал · Нулевой бог'].map((chapter, index) => (
        <li key={chapter} data-available={index === 0}>
          <span>{index === 0 ? 'ДОСТУПНО' : 'ЗАКРЫТО'}</span><strong>{chapter}</strong>
        </li>
      ))}
    </ol>
  );
}

function ProgressionHub({ onBack }: { readonly onBack: () => void }) {
  return (
    <div className={styles.scrim} role="dialog" aria-modal="true">
      <header><span>PVE · МАСТЕРСТВО</span><h1>ПРОГРЕСС БОЙЦОВ</h1><p>Усиления действуют только в истории, PvE и пользовательской тренировке.</p></header>
      <div className={styles.trees}>
        {CHARACTER_ROSTER.map((fighter) => (
          <article key={fighter.id}>
            <h2>{fighter.displayName}</h2><small>{fighter.archetype}</small>
            <ul><li>Нейтраль</li><li>Давление</li><li>Механика</li></ul>
          </article>
        ))}
      </div>
      <footer><button type="button" onClick={onBack}>Назад</button></footer>
    </div>
  );
}
