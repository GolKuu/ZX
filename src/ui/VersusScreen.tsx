'use client';

import { useEffect, useState } from 'react';
import { getCharacterDefinition } from '@/src/data/characterRoster';
import { getArenaDefinition } from '@/src/data/arenas';
import { useHudStore } from '@/src/store/hudStore';
import styles from './VersusScreen.module.css';

export function VersusScreen() {
  const mode = useHudStore((state) => state.mode);
  const selection = useHudStore((state) => state.fighterSelection);
  const enterFight = useHudStore((state) => state.enterFight);
  const openStageSelect = useHudStore((state) => state.openStageSelect);
  const arena = getArenaDefinition(useHudStore((state) => state.arenaId));
  const left = getCharacterDefinition(selection[0]);
  const right = getCharacterDefinition(selection[1]);
  const [p1Ready, setP1Ready] = useState(false);
  const [p2Ready, setP2Ready] = useState(mode !== 'local');
  const canStart = p1Ready && p2Ready;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Enter' || event.code === 'Space') {
        event.preventDefault();
        if (mode !== 'local' && p1Ready) enterFight();
        else setP1Ready(true);
      } else if (event.code === 'NumpadEnter' && mode === 'local') {
        event.preventDefault();
        setP2Ready(true);
      } else if (event.code === 'Escape' || event.code === 'Backspace') {
        event.preventDefault();
        openStageSelect();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enterFight, mode, openStageSelect, p1Ready]);

  return (
    <section
      aria-label="Представление бойцов"
      aria-modal="true"
      className={styles.screen}
      role="dialog"
    >
      <header className={styles.header}>
        <strong>YZX//FIGHT</strong>
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
          player={mode === 'local' ? 'P2' : 'CPU'}
          character={right}
        />
      </div>

      <div className={styles.controlsPreview}>
        <span><b>P1</b> WASD · J K I L · Shift блок · Ctrl рывок</span>
        <span><b>{mode === 'local' ? 'P2' : 'CPU'}</b> {mode === 'local' ? 'Стрелки · Num 1 2 4 5 · Num 0 блок · Num Enter рывок' : 'Управляется игрой'}</span>
      </div>

      <footer className={styles.footer}>
        <span>АРЕНА <b>{arena.name}</b></span>
        <i aria-hidden="true" />
        <button type="button" onClick={openStageSelect}>НАЗАД</button>
        <button type="button" data-ready={p1Ready} onClick={() => setP1Ready(true)}>P1 {p1Ready ? 'ГОТОВ' : 'ENTER'}</button>
        {mode === 'local' && <button type="button" data-ready={p2Ready} onClick={() => setP2Ready(true)}>P2 {p2Ready ? 'ГОТОВ' : 'NUM ENTER'}</button>}
        <button type="button" disabled={!canStart} onClick={enterFight}>НАЧАТЬ БОЙ</button>
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
