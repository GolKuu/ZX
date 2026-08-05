'use client';

import { useCallback, useEffect, useRef } from 'react';
import { getCharacterDefinition } from '@/src/data/characterRoster';
import { victoryCinematicFor } from '@/src/data/victoryCinematics';
import { useHudStore } from '@/src/store/hudStore';
import styles from './VictoryCutscene.module.css';

const CUTSCENE_DURATION_MS = 6_200;
const REDUCED_MOTION_DURATION_MS = 1_200;

export function VictoryCutscene() {
  const result = useHudStore((state) => state.result);
  const selection = useHudStore((state) => state.fighterSelection);
  const openResult = useHudStore((state) => state.openResult);
  const finished = useRef(false);
  const winnerIndex = result.winner.startsWith('P2') ? 1 : 0;
  const characterId = selection[winnerIndex];
  const defeatedId = selection[winnerIndex === 0 ? 1 : 0];
  const character = getCharacterDefinition(characterId);
  const cinematic = victoryCinematicFor(characterId);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    openResult(result);
  }, [openResult, result]);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(
      finish,
      reducedMotion ? REDUCED_MOTION_DURATION_MS : CUTSCENE_DURATION_MS,
    );
    const skip = (event: KeyboardEvent) => {
      if (event.code !== 'Enter' && event.code !== 'Space' && event.code !== 'Escape') return;
      event.preventDefault();
      finish();
    };
    window.addEventListener('keydown', skip);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', skip);
    };
  }, [finish]);

  return (
    <section
      aria-label={`${character.displayName} victory cutscene`}
      className={styles.cutscene}
      data-character={characterId}
      style={{
        '--victory-accent': cinematic.accent,
        '--victory-soft': cinematic.accentSoft,
      } as React.CSSProperties}
    >
      <div className={styles.flash} aria-hidden="true" />
      <div className={styles.backdrop} aria-hidden="true" />
      <div className={styles.defeatedFrame} aria-hidden="true">
        <div
          className={styles.defeated}
          style={{ backgroundImage: `url('/sprites/reference-fighters/${defeatedId}-atlas.webp')` }}
        />
      </div>
      <div className={styles.fighterFrame} aria-hidden="true">
        <div className={styles.floorShadow} />
        <div
          className={styles.fighter}
          style={{ backgroundImage: `url('/sprites/reference-fighters/${characterId}-atlas.webp')` }}
        />
      </div>
      <div className={styles.dust} aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => <i key={index} />)}
      </div>
      <div className={styles.copy}>
        <span className={styles.eyebrow}>{winnerIndex === 0 ? 'PLAYER 1' : 'PLAYER 2'} // WINNER</span>
        <h1>{character.displayName}</h1>
        <p>{cinematic.title}</p>
      </div>
      <button className={styles.skip} type="button" onClick={finish}>
        ПРОПУСТИТЬ <kbd>Enter</kbd>
      </button>
      <div className={styles.letterboxTop} aria-hidden="true" />
      <div className={styles.letterboxBottom} aria-hidden="true" />
    </section>
  );
}
