import { playerLabels } from '../../game/config/defaultControls';
import type { PlayerId } from '../../game/core/types';
import { circleFighters } from '../../game/data/characters/circleFighters';

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
            <span style={{ background: fighter.cssColor }} aria-hidden="true" />
            <strong>{fighter.name}</strong>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
