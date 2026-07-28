import type { CharacterDefinition } from '../../game/data/characters/circleFighters';
import { CharacterFace, CharacterSkinDetails } from './CharacterSkinDetails';
import { CHARACTER_SKINS } from './characterSkinProfiles';

export function CharacterSkinArt({ character }: { character: CharacterDefinition }) {
  const skin = CHARACTER_SKINS[character.id];
  const gradientId = `${character.id}-skin`;
  const backColor = `#${character.shadowColor.toString(16).padStart(6, '0')}`;

  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={character.accentCss} />
          <stop offset=".58" stopColor={character.cssColor} />
          <stop offset="1" stopColor={backColor} />
        </linearGradient>
      </defs>
      <ellipse className="art-shadow" cx="160" cy="328" rx={skin.shadowWidth} ry="14" />
      <g className="art-rig" stroke="#292441" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round">
        <SkinLegs character={character} front={false} />
        <SkinArm character={character} front={false} />
        <path className="art-torso" d={skin.torso} fill={`url(#${gradientId})`} />
        <CharacterSkinDetails character={character} />
        <SkinLegs character={character} front />
        <g className="art-head">
          <path d={skin.head} fill={`url(#${gradientId})`} />
          <CharacterFace face={skin.face} accent={character.accentCss} />
        </g>
        <SkinArm character={character} front />
      </g>
    </>
  );
}

function SkinArm({
  character,
  front,
}: {
  character: CharacterDefinition;
  front: boolean;
}) {
  const skin = CHARACTER_SKINS[character.id];
  const direction = front ? 1 : -1;
  const x = 160 + skin.shoulders * direction;
  const color = front ? character.accentCss : character.cssColor;
  const handShape = character.id === 'caliber'
    ? `M${x - 18} 217h36v42h-36Z`
    : character.id === 'shira' || character.id === 'origami'
      ? `M${x} 211 ${x + direction * 52} 244 ${x + direction * 6} 258Z`
      : character.id === 'fenr' || character.id === 'ragnar'
        ? `M${x - 17} 225h34l${direction * 16} 31-20-10-12 15-8-18Z`
        : `M${x - 17} 224q17-14 34 0v31q-17 15-34 0Z`;
  return (
    <g className={`art-arm art-arm--${front ? 'front' : 'back'}`} opacity={front ? 1 : .72}>
      <path d={`M${x} 139 Q${x + direction * 12} 179 ${x} 229`} fill="none" stroke={color} strokeWidth={skin.armWidth} />
      <path d={handShape} fill={color} />
    </g>
  );
}

function SkinLegs({
  character,
  front,
}: {
  character: CharacterDefinition;
  front: boolean;
}) {
  const skin = CHARACTER_SKINS[character.id];
  const direction = front ? 1 : -1;
  const x = 160 + skin.hips * direction;
  const color = front ? character.accentCss : character.cssColor;
  if (skin.stance === 'tail' && front) return null;
  if (skin.stance === 'tail') {
    return <path className="art-leg art-leg--back" d="M160 240q-47 36-12 78 27 24 68-2-42 7-44-27-2-25 23-47Z" fill={color} />;
  }
  if (skin.stance === 'float') {
    return (
      <path
        className={`art-leg art-leg--${front ? 'front' : 'back'}`}
        d={`M${x} 239q${direction * 30} 28 ${direction * 7} 76l${direction * 27} 8q${direction * -42} 17 ${direction * -49}-13 22-36 15-71Z`}
        fill={color}
        opacity={front ? 1 : .68}
      />
    );
  }
  return (
    <g className={`art-leg art-leg--${front ? 'front' : 'back'}`} opacity={front ? 1 : .72}>
      <path d={`M${x} 238Q${x + direction * 6} 278 ${x + direction * 10} 316`} fill="none" stroke={color} strokeWidth={skin.legWidth} />
      <path d={`M${x - 16} 311h${direction * 46}l${direction * 12} 18h${direction * -62}Z`} fill={color} />
    </g>
  );
}
