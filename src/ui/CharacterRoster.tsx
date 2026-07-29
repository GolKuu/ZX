import { useEffect, useRef } from 'react';
import {
  CHARACTER_ROSTER,
  type CharacterDefinition,
  type CharacterId,
} from '@/src/data/characterRoster';
import styles from './CharacterRoster.module.css';

export function CharacterRoster({
  activeSlot,
  focus,
  focusedCharacter,
  opponentTag,
  onChoose,
  onFocus,
}: {
  readonly activeSlot: 0 | 1;
  readonly focus: number;
  readonly focusedCharacter: CharacterDefinition;
  readonly opponentTag: string;
  readonly onChoose: (characterId: CharacterId) => void;
  readonly onFocus: (index: number) => void;
}) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    buttonRefs.current[focus]?.focus();
  }, [focus]);

  return (
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
            data-focused={index === focus}
            onClick={() => onChoose(character.id)}
            onFocus={() => onFocus(index)}
            onPointerEnter={() => onFocus(index)}
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
  );
}
