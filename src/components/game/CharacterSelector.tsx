import { playerLabels } from '../../game/config/defaultControls';
import type { PlayerId } from '../../game/core/types';
import { circleFighters } from '../../game/data/characters/circleFighters';
import type { CSSProperties } from 'react';

export function CharacterSelector({
  playerId,
  value,
  onChange,
}: {
  playerId: PlayerId;
  value: string;
  onChange: (characterId: string) => void;
}) {
  return (
    <fieldset className="character-picker">
      <legend>{playerLabels[playerId]}</legend>
      <div>
        {circleFighters.map((fighter) => (
          <label
            className={value === fighter.id ? 'fighter-choice fighter-choice--selected' : 'fighter-choice'}
            key={fighter.id}
          >
            <input
              type="radio"
              name={`character-${playerId}`}
              value={fighter.id}
              checked={value === fighter.id}
              onChange={() => onChange(fighter.id)}
            />
            <span
              className={`fighter-choice__portrait fighter-choice__portrait--${fighter.visualKind}`}
              style={{
                '--fighter-color': fighter.cssColor,
                '--fighter-accent': `#${fighter.accentColor.toString(16).padStart(6, '0')}`,
              } as CSSProperties}
              aria-hidden="true"
            />
            <strong>{fighter.name}</strong>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
