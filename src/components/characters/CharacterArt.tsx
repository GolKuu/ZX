import type { AnimationStateId } from '../../game/rendering/animation/AnimationCatalog';
import { GraniteCharacterArt } from './GraniteCharacterArt';
import { ShiraCharacterArt } from './ShiraCharacterArt';

export function CharacterArt({
  characterId,
  state = 'idle',
}: {
  characterId: 'granite' | 'shira';
  state?: AnimationStateId;
}) {
  return (
    <svg
      className={`character-art character-art--${characterId}`}
      data-state={state}
      viewBox="0 0 320 360"
      role="img"
      aria-label={`${characterId === 'granite' ? 'Гранит' : 'Шира'}: ${state}`}
    >
      {characterId === 'granite' ? <GraniteCharacterArt /> : <ShiraCharacterArt />}
    </svg>
  );
}
