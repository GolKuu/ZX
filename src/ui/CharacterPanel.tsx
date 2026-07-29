import {
  getCharacterDefinition,
  type CharacterId,
} from '@/src/data/characterRoster';
import styles from './CharacterPanel.module.css';

export function CharacterPanel({
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
      className={`${styles.panel} ${right ? styles.panelRight : ''}`}
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
