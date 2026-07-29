'use client';

import { useEffect } from 'react';
import { getCharacterDefinition } from '@/src/data/characterRoster';
import { useHudStore } from '@/src/store/hudStore';
import styles from './VersusScreen.module.css';

const INTRO_DURATION_MS = 3200;

export function VersusScreen() {
  const mode = useHudStore((state) => state.mode);
  const selection = useHudStore((state) => state.fighterSelection);
  const enterFight = useHudStore((state) => state.enterFight);
  const left = getCharacterDefinition(selection[0]);
  const right = getCharacterDefinition(selection[1]);

  useEffect(() => {
    const timeout = window.setTimeout(enterFight, INTRO_DURATION_MS);
    const skip = (event: KeyboardEvent) => {
      if (event.code === 'Enter' || event.code === 'Space') {
        event.preventDefault();
        enterFight();
      }
    };
    window.addEventListener('keydown', skip);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('keydown', skip);
    };
  }, [enterFight]);

  return (
    <section
      aria-label="Представление бойцов"
      aria-modal="true"
      className={styles.screen}
      role="dialog"
      onClick={enterFight}
    >
      <header className={styles.header}>
        <strong>CC//ULTIMATE</strong>
        <span>ПРЕДСТОЯЩИЙ БОЙ</span>
        <small>{mode === 'ai' ? 'ОДИН ИГРОК · ПРОТИВ ИИ' : 'ЛОКАЛЬНЫЙ БОЙ · 2 ИГРОКА'}</small>
      </header>

      <div className={styles.fighters}>
        <FighterCard side="left" player="P1" character={left} />
        <div className={styles.versus} aria-hidden="true">
          <span>ROUND 01</span>
          <strong>VS</strong>
          <i />
        </div>
        <FighterCard
          side="right"
          player={mode === 'ai' ? 'CPU' : 'P2'}
          character={right}
        />
      </div>

      <footer className={styles.footer}>
        <span>АРЕНА <b>NULL CIRCLE</b></span>
        <i aria-hidden="true" />
        <small>ENTER · ПРОПУСТИТЬ</small>
      </footer>
    </section>
  );
}

function FighterCard({
  character,
  player,
  side,
}: {
  readonly character: ReturnType<typeof getCharacterDefinition>;
  readonly player: string;
  readonly side: 'left' | 'right';
}) {
  return (
    <article className={styles.card} data-character={character.id} data-side={side}>
      <div className={styles.portrait} aria-hidden="true">
        <b>{character.mark}</b>
        <i />
      </div>
      <div className={styles.identity}>
        <span>{player} · {character.archetype}</span>
        <h1>{character.displayName}</h1>
      </div>
    </article>
  );
}
