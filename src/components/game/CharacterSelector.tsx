import { playerLabels } from '../../game/config/defaultControls';
import type { PlayerId } from '../../game/core/types';
import { circleFighters } from '../../game/data/characters/circleFighters';
import { CharacterPortrait } from '../characters/CharacterPortrait';
import { CharacterDetails } from './CharacterDetails';

export function CharacterSelector({
  playerId,
  value,
  opponentCharacterId,
  onChange,
  label,
}: {
  playerId: PlayerId;
  value: string;
  opponentCharacterId: string;
  onChange: (characterId: string) => void;
  label?: string;
}) {
  return (
    <fieldset className="character-picker">
      <legend>{label ?? playerLabels[playerId]}</legend>
      <div className="character-picker__roster">
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
            <CharacterPortrait character={fighter} />
            <strong>{fighter.name}</strong>
            <small>{fighter.force}</small>
          </label>
        ))}
      </div>
      <CharacterDetails
        characterId={value}
        opponentCharacterId={opponentCharacterId}
      />
    </fieldset>
  );
}
