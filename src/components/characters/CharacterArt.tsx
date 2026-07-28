import type { AnimationStateId } from '../../game/rendering/animation/AnimationCatalog';
import {
  getCharacter,
  type CharacterId,
} from '../../game/data/characters/circleFighters';
import { CharacterSkinArt } from './CharacterSkinArt';

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
      <CharacterSkinArt character={character} />
    </svg>
  );
}
