import type { AangMove } from '../types';
import styles from './MoveCard.module.css';

interface MoveCardProps {
  readonly move: AangMove;
  readonly selected: boolean;
  readonly onSelect: () => void;
}

export function MoveCard({ move, selected, onSelect }: MoveCardProps) {
  return (
    <button
      type="button"
      className={styles.card}
      data-selected={selected}
      data-element={move.element}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <span className={styles.heading}>
        <span>
          <small>{move.input}</small>
          <strong>{move.name}</strong>
        </span>
        <span className={styles.play} aria-hidden="true">▶</span>
      </span>

      <span className={styles.description}>{move.description}</span>

      <span className={styles.properties}>
        {move.properties.map((property) => (
          <span key={property}>{property}</span>
        ))}
      </span>

      <span className={styles.beats}>
        {move.beats.map((beat, index) => (
          <span key={beat}>
            <i>0{index + 1}</i>
            {beat}
          </span>
        ))}
      </span>
    </button>
  );
}
