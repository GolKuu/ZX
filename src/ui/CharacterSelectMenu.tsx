'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CHARACTER_ROSTER,
  getCharacterDefinition,
  type CharacterId,
  type CharacterSelection,
} from '@/src/data/characterRoster';
import { requestCombatReset } from '@/src/game/combatRuntime';
import { useHudStore } from '@/src/store/hudStore';
import { useMenuNavigation } from './useMenuNavigation';
import styles from './CharacterSelectMenu.module.css';

type PlayerSlot = 0 | 1;

export function CharacterSelectMenu() {
  const mode = useHudStore((state) => state.mode);
  const savedSelection = useHudStore((state) => state.fighterSelection);
  const menuFocus = useHudStore((state) => state.menuFocus);
  const openModeMenu = useHudStore((state) => state.openModeMenu);
  const setMenuFocus = useHudStore((state) => state.setMenuFocus);
  const startMatch = useHudStore((state) => state.startMatch);
  const [activeSlot, setActiveSlot] = useState<PlayerSlot>(0);
  const [draft, setDraft] = useState<CharacterSelection>(savedSelection);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const focusedCharacter = CHARACTER_ROSTER[menuFocus] ?? CHARACTER_ROSTER[0];
  const preview: CharacterSelection = activeSlot === 0
    ? [focusedCharacter.id, draft[1]]
    : [draft[0], focusedCharacter.id];

  const chooseCharacter = useCallback((characterId: CharacterId) => {
    const next: CharacterSelection = activeSlot === 0
      ? [characterId, draft[1]]
      : [draft[0], characterId];
    setDraft(next);
    if (activeSlot === 0) {
      setActiveSlot(1);
      const nextIndex = CHARACTER_ROSTER.findIndex(({ id }) => id === next[1]);
      setMenuFocus(Math.max(0, nextIndex));
      return;
    }
    requestCombatReset();
    startMatch(next);
  }, [activeSlot, draft, setMenuFocus, startMatch]);

  const confirm = useCallback(() => {
    const character = CHARACTER_ROSTER[useHudStore.getState().menuFocus];
    if (character !== undefined) chooseCharacter(character.id);
  }, [chooseCharacter]);

  const back = useCallback(() => {
    if (activeSlot === 0) {
      openModeMenu();
      return;
    }
    setActiveSlot(0);
    const previousIndex = CHARACTER_ROSTER.findIndex(({ id }) => id === draft[0]);
    setMenuFocus(Math.max(0, previousIndex));
  }, [activeSlot, draft, openModeMenu, setMenuFocus]);

  useMenuNavigation({
    focus: menuFocus,
    itemCount: CHARACTER_ROSTER.length,
    onBack: back,
    onConfirm: confirm,
    setFocus: setMenuFocus,
  });

  useEffect(() => {
    buttonRefs.current[menuFocus]?.focus();
  }, [menuFocus]);

  const opponentTag = mode === 'ai' ? 'CPU' : 'P2';

  return (
    <div
      aria-label="Выбор персонажей"
      aria-modal="true"
      className={styles.scrim}
      role="dialog"
    >
      <header className={styles.brand}>
        <span>CC//ULTIMATE</span>
        <small>ВЫБОР ПЕРСОНАЖА · {mode === 'ai' ? 'ПРОТИВ ИИ' : 'ЛОКАЛЬНЫЙ БОЙ'}</small>
      </header>

      <main className={styles.layout}>
        <CharacterPanel
          active={activeSlot === 0}
          characterId={preview[0]}
          confirmed={activeSlot === 1}
          playerTag="P1"
        />

        <section className={styles.roster}>
          <div className={styles.prompt} aria-live="polite">
            <span>ШАГ {activeSlot + 1} / 2</span>
            <h1>{activeSlot === 0 ? 'P1' : opponentTag} выбирает бойца</h1>
          </div>
          <nav aria-label="Готовые персонажи" className={styles.characterList}>
            {CHARACTER_ROSTER.map((character, index) => (
              <button
                key={character.id}
                ref={(element) => {
                  buttonRefs.current[index] = element;
                }}
                type="button"
                data-character={character.id}
                data-focused={index === menuFocus}
                onClick={() => chooseCharacter(character.id)}
                onFocus={() => setMenuFocus(index)}
                onPointerEnter={() => setMenuFocus(index)}
              >
                <i aria-hidden="true">{character.mark}</i>
                <span>
                  <strong>{character.displayName}</strong>
                  <small>{character.archetype}</small>
                </span>
              </button>
            ))}
          </nav>
          <p className={styles.description}>{focusedCharacter.description}</p>
        </section>

        <CharacterPanel
          active={activeSlot === 1}
          characterId={preview[1]}
          confirmed={false}
          playerTag={opponentTag}
          right
        />
      </main>

      <footer className={styles.hints}>
        <span><kbd>A</kbd> Подтвердить</span>
        <span><kbd>B</kbd> Назад</span>
        <span><kbd>←→</kbd> Выбрать бойца</span>
      </footer>
    </div>
  );
}

function CharacterPanel({
  active,
  characterId,
  confirmed,
  playerTag,
  right = false,
}: {
  readonly active: boolean;
  readonly characterId: CharacterId;
  readonly confirmed: boolean;
  readonly playerTag: string;
  readonly right?: boolean;
}) {
  const character = getCharacterDefinition(characterId);
  return (
    <section
      className={`${styles.fighterPanel} ${right ? styles.fighterPanelRight : ''}`}
      data-active={active}
      data-character={character.id}
    >
      <div className={styles.playerState}>
        <b>{playerTag}</b>
        <span>{confirmed ? 'ГОТОВ' : active ? 'ВЫБИРАЕТ' : 'ОЖИДАНИЕ'}</span>
      </div>
      <div className={styles.portrait} aria-hidden="true">
        <strong>{character.mark}</strong>
        <i />
      </div>
      <div className={styles.identity}>
        <span>{character.archetype}</span>
        <h2>{character.displayName}</h2>
      </div>
    </section>
  );
}
