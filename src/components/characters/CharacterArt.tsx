import type { AnimationStateId } from '../../game/rendering/animation/AnimationCatalog';
import {
  getCharacter,
  type CharacterId,
} from '../../game/data/characters/circleFighters';
import { GraniteCharacterArt } from './GraniteCharacterArt';
import { ShiraCharacterArt } from './ShiraCharacterArt';
import { TemporaryCharacterArt } from './TemporaryCharacterArt';

export function CharacterArt({
  characterId,
  state = 'idle',
}: {
  characterId: CharacterId;
  state?: AnimationStateId;
}) {
  const character = getCharacter(characterId);
  return (
    <svg
      className={`character-art character-art--${characterId}`}
      data-state={state}
      viewBox="0 0 320 360"
      role="img"
      aria-label={`${character.name}: ${state}`}
    >
      {characterId === 'granite' ? (
        <GraniteCharacterArt />
      ) : characterId === 'shira' ? (
        <ShiraCharacterArt />
      ) : (
        <TemporaryCharacterArt character={character} />
      )}
    </svg>
  );
}
