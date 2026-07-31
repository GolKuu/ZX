import { useEffect, useRef } from 'react';
import {
  CHARACTER_ROSTER,
  type CharacterDefinition,
  type CharacterId,
} from '@/src/data/characterRoster';
import styles from './CharacterRoster.module.css';

interface CharacterRosterProps {
  readonly activeSlot: 0 | 1;
  readonly focus: number;
  readonly focusedCharacter: CharacterDefinition;
  readonly opponentTag: string;
  readonly onChoose: (characterId: CharacterId) => void;
  readonly onFocus: (index: number) => void;
}

export function CharacterRoster({
  activeSlot,
  focus,
  focusedCharacter,
  opponentTag,
  onChoose,
  onFocus,
}: CharacterRosterProps) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    buttonRefs.current[focus]?.focus();
  }, [focus]);

  return (
    <section className={styles.roster}>
      <div className={styles.prompt} aria-live="polite">
        <span>ШАГ {activeSlot + 1} / 2 · {CHARACTER_ROSTER.length} БОЙЦОВ</span>
        <h1>{activeSlot === 0 ? 'P1' : opponentTag} выбирает бойца</h1>
      </div>
      <nav aria-label="Доступные персонажи" className={styles.characterList}>
        {CHARACTER_ROSTER.map((character, index) => (
          <button
            key={character.id}
            ref={(element) => {
              buttonRefs.current[index] = element;
            }}
            type="button"
            data-character={character.id}
            data-focused={index === focus}
            data-new={character.isNew === true}
            onClick={() => onChoose(character.id)}
            onFocus={() => onFocus(index)}
            onPointerEnter={() => onFocus(index)}
          >
            <i aria-hidden="true">{character.mark}</i>
            <span>
              <strong>
                {character.displayName}
                {character.isNew === true && <em>NEW</em>}
              </strong>
              <small>{character.archetype}</small>
            </span>
          </button>
        ))}
      </nav>
      <p className={styles.description}>{focusedCharacter.description}</p>
    </section>
  );
}
