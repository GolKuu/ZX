import type { CharacterDefinition } from '../../game/data/characters/circleFighters';

export function TemporaryCharacterArt({
  character,
}: {
  character: CharacterDefinition;
}) {
  const gradientId = `${character.id}-placeholder-body`;
  const isHeavy = character.visualModel.silhouette === 'heavy';
  const isAgile = character.visualModel.silhouette === 'agile';
  const torsoWidth = isHeavy ? 126 : isAgile ? 76 : 98;
  const torsoX = 160 - torsoWidth / 2;
  const headPath = isHeavy
    ? 'm116 78 22-43 47 3 22 40-17 38h-58Z'
    : isAgile
      ? 'm120 75 20-34 42-3 22 37-16 40h-51Z'
      : 'm119 77 16-39 51-1 17 40-17 39h-50Z';

  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={character.accentCss} />
          <stop offset="1" stopColor={character.cssColor} />
        </linearGradient>
      </defs>
      <ellipse className="art-shadow" cx="160" cy="326" rx={isHeavy ? 82 : 64} ry="13" />
      <g className="art-rig" stroke="#292441" strokeWidth="7" strokeLinejoin="round">
        <g className="art-leg art-leg--back">
          <path d="m132 231-11 84" fill="none" stroke={character.cssColor} strokeWidth={isAgile ? 15 : 23} />
          <path d="m102 318 43-5 10 15H96Z" fill={character.cssColor} />
        </g>
        <g className="art-arm art-arm--back">
          <path d="m116 143-46 94" fill="none" stroke={character.cssColor} strokeWidth={isHeavy ? 28 : 18} />
          <circle cx="112" cy="150" r={isHeavy ? 18 : 14} fill="#fffaf3" />
          <circle cx="68" cy="242" r={isHeavy ? 18 : 13} fill={character.accentCss} />
        </g>
        <path
          className="art-torso"
          d={`M${torsoX} 112 Q160 78 ${torsoX + torsoWidth} 112 L${torsoX + torsoWidth - 8} 238 Q160 275 ${torsoX + 8} 238Z`}
          fill={`url(#${gradientId})`}
        />
        <circle cx="160" cy="181" r={isHeavy ? 34 : 27} fill="#ffffff3d" stroke={character.accentCss} />
        <text
          x="160"
          y="194"
          textAnchor="middle"
          fill="#fff"
          stroke="none"
          fontSize={isHeavy ? 42 : 35}
          fontWeight="900"
        >
          {character.visualModel.symbol}
        </text>
        <g className="art-leg art-leg--front">
          <path d="m187 231 15 84" fill="none" stroke={character.accentCss} strokeWidth={isAgile ? 15 : 23} />
          <path d="m184 314 43 4 9 13h-56Z" fill={character.accentCss} />
        </g>
        <g className="art-head">
          {isAgile && (
            <>
              <path d="m126 75-32-32 9 43-22 18 45 5Z" fill={character.accentCss} />
              <path d="m194 75 32-32-9 43 22 18-45 5Z" fill={character.accentCss} />
            </>
          )}
          <path d={headPath} fill={`url(#${gradientId})`} />
          <path d="m137 82h47" fill="none" stroke="#292441" strokeWidth="18" />
          <circle cx="148" cy="81" r="5" fill="#fff" stroke="none" />
          <circle cx="174" cy="81" r="5" fill="#fff" stroke="none" />
        </g>
        <g className="art-arm art-arm--front">
          <path d="m204 142 48 92" fill="none" stroke={character.accentCss} strokeWidth={isHeavy ? 28 : 18} />
          <circle cx="207" cy="149" r={isHeavy ? 18 : 14} fill="#fffaf3" />
          <circle cx="255" cy="240" r={isHeavy ? 18 : 13} fill={character.cssColor} />
        </g>
      </g>
    </>
  );
}
