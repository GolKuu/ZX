'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AANG_MOVES } from '../moves';
import type { AangMove, AangElement } from '../types';
import { AangStage } from './AangStage';
import { MoveCard } from './MoveCard';
import styles from './AangLab.module.css';

type MoveFilter = Exclude<AangElement, 'avatar'> | 'specials';

const FILTERS: readonly { id: MoveFilter; label: string; detail: string }[] = [
  { id: 'air', label: 'Воздух', detail: 'скорость · контроль' },
  { id: 'fire', label: 'Огонь', detail: 'rushdown · chip' },
  { id: 'earth', label: 'Земля', detail: 'armor · урон' },
  { id: 'water', label: 'Вода', detail: 'mid-range · zoning' },
  { id: 'specials', label: 'Особые', detail: 'specials · supers' },
];

export function AangLab() {
  const [filter, setFilter] = useState<MoveFilter>('air');
  const [selectedId, setSelectedId] = useState('air-lp');
  const [replayToken, setReplayToken] = useState(0);
  const visibleMoves = useMemo(() => movesForFilter(filter), [filter]);
  const selectedMove = findMove(selectedId);

  const selectMove = useCallback((move: AangMove) => {
    setSelectedId(move.id);
    setReplayToken((token) => token + 1);
  }, []);

  const cycle = useCallback((direction: -1 | 1) => {
    const currentIndex = visibleMoves.findIndex((move) => move.id === selectedId);
    const nextIndex = (currentIndex + direction + visibleMoves.length) % visibleMoves.length;
    const nextMove = visibleMoves[nextIndex];
    if (nextMove !== undefined) selectMove(nextMove);
  }, [selectMove, selectedId, visibleMoves]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLButtonElement || event.target instanceof HTMLAnchorElement) return;
      if (event.code === 'ArrowLeft') cycle(-1);
      if (event.code === 'ArrowRight') cycle(1);
      if (event.code === 'Space') {
        event.preventDefault();
        setReplayToken((token) => token + 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cycle]);

  const changeFilter = (nextFilter: MoveFilter) => {
    setFilter(nextFilter);
    const firstMove = movesForFilter(nextFilter)[0];
    if (firstMove !== undefined) selectMove(firstMove);
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/">CC//ULTIMATE</Link>
        <span>ROSTER 07 · ANIMATION LAB</span>
      </header>

      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>АВАТАР · ПОВЕЛИТЕЛЬ ЧЕТЫРЁХ СТИХИЙ</p>
          <h1>Аанг</h1>
        </div>
        <p>
          Мобильный универсал, который меняет свойства всех обычных атак вместе со стихией.
          Выберите карточку: каждый из 22 приёмов запускает собственную позу, VFX и реакцию цели.
        </p>
      </section>

      <nav className={styles.filters} aria-label="Группы приёмов">
        {FILTERS.map((item) => (
          <button
            type="button"
            key={item.id}
            data-active={filter === item.id}
            onClick={() => changeFilter(item.id)}
          >
            <strong>{item.label}</strong>
            <span>{item.detail}</span>
          </button>
        ))}
      </nav>

      <div className={styles.workspace}>
        <aside>
          <AangStage
            move={selectedMove}
            replayToken={replayToken}
            onPrevious={() => cycle(-1)}
            onReplay={() => setReplayToken((token) => token + 1)}
            onNext={() => cycle(1)}
          />
          <p className={styles.hint}>← → сменить приём · пробел повторить</p>
        </aside>

        <section className={styles.moveList} aria-label="Список приёмов">
          <div className={styles.sectionTitle}>
            <span>{String(visibleMoves.length).padStart(2, '0')} анимаций</span>
            <h2>{FILTERS.find((item) => item.id === filter)?.label}</h2>
          </div>
          {visibleMoves.map((move) => (
            <MoveCard
              key={move.id}
              move={move}
              selected={move.id === selectedId}
              onSelect={() => selectMove(move)}
            />
          ))}
        </section>
      </div>
    </main>
  );
}

function movesForFilter(filter: MoveFilter): AangMove[] {
  return AANG_MOVES.filter((move) =>
    filter === 'specials' ? move.category !== 'normal' : move.element === filter,
  );
}

function findMove(id: string): AangMove {
  const move = AANG_MOVES.find((candidate) => candidate.id === id);
  if (move === undefined) throw new Error(`Unknown Aang move: ${id}`);
  return move;
}
