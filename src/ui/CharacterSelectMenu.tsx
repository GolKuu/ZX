'use client';

import { useCallback, useState } from 'react';
import { CHARACTER_ROSTER, type CharacterId, type CharacterSelection } from '@/src/data/characterRoster';
import { requestCombatReset } from '@/src/game/combatRuntime';
import { useHudStore } from '@/src/store/hudStore';
import { CharacterPanel } from './CharacterPanel';
import { CharacterRoster } from './CharacterRoster';
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
  const focusedCharacter = CHARACTER_ROSTER[menuFocus] ?? CHARACTER_ROSTER[0];
  const preview: CharacterSelection = activeSlot === 0
    ? [focusedCharacter.id, draft[1]] : [draft[0], focusedCharacter.id];

  const chooseCharacter = useCallback((characterId: CharacterId) => {
    const next: CharacterSelection = activeSlot === 0 ? [characterId, draft[1]] : [draft[0], characterId];
    setDraft(next);
    if (activeSlot === 0) {
      setActiveSlot(1);
      setMenuFocus(Math.max(0, CHARACTER_ROSTER.findIndex(({ id }) => id === next[1])));
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
    if (activeSlot === 0) { openModeMenu(); return; }
    setActiveSlot(0);
    setMenuFocus(Math.max(0, CHARACTER_ROSTER.findIndex(({ id }) => id === draft[0])));
  }, [activeSlot, draft, openModeMenu, setMenuFocus]);

  useMenuNavigation({ focus: menuFocus, itemCount: CHARACTER_ROSTER.length, onBack: back, onConfirm: confirm, setFocus: setMenuFocus });
  const opponentTag = mode === 'local' ? 'P2' : 'CPU';

  return (
    <div aria-label="Выбор персонажей" aria-modal="true" className={styles.scrim} role="dialog">
      <header className={styles.brand}>
        <span>YZX//FIGHT</span>
        <small>ВЫБОР ПЕРСОНАЖА · {mode === 'ai' ? 'ПРОТИВ ИИ' : 'ЛОКАЛЬНЫЙ БОЙ'}</small>
      </header>
      <main className={styles.layout}>
        <CharacterPanel active={activeSlot === 0} characterId={preview[0]} confirmed={activeSlot === 1} playerTag="P1" />
        <CharacterRoster activeSlot={activeSlot} focus={menuFocus} focusedCharacter={focusedCharacter} opponentTag={opponentTag} onChoose={chooseCharacter} onFocus={setMenuFocus} />
        <CharacterPanel active={activeSlot === 1} characterId={preview[1]} confirmed={false} playerTag={opponentTag} right />
      </main>
      <footer className={styles.hints}>
        <span><kbd>A</kbd> Подтвердить</span><span><kbd>B</kbd> Назад</span><span><kbd>←→</kbd> Выбрать бойца</span>
      </footer>
    </div>
  );
}
