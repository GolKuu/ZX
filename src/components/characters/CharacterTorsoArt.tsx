import { CharacterSkinArt } from './CharacterSkinArt';
import { CharacterFace, CharacterSkinDetails } from './CharacterSkinDetails';
import { CHARACTER_SKINS } from './characterSkinProfiles';
import { getCharacter } from '../../game/data/characters/circleFighters';

export function CharacterTorsoArt({ characterId, state = 'idle' }: { characterId: string; state?: string }) {
  const character = getCharacter(characterId);
  const skin = CHARACTER_SKINS[character.id];
  const gradientId = `${character.id}-skin-torso`;
  return (
    <svg viewBox="0 0 320 360" className={`character-art character-art--${character.id}`} data-state={state}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={character.accentCss} />
          <stop offset=".58" stopColor={character.cssColor} />
          <stop offset="1" stopColor={`#${character.shadowColor.toString(16).padStart(6, '0')}`} />
        </linearGradient>
      </defs>
      <g className="art-rig">
        <path className="art-torso" d={skin.torso} fill={`url(#${gradientId})`} />
        <g className="art-head">
          <path d={skin.head} fill={`url(#${gradientId})`} />
          <CharacterFace face={skin.face} accent={character.accentCss} />
        </g>
        <CharacterSkinDetails character={character} />
      </g>
    </svg>
  );
}

export default CharacterTorsoArt;
