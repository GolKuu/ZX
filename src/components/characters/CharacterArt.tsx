import type { AnimationStateId } from '../../game/rendering/animation/AnimationCatalog';

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
      {characterId === 'granite' ? <GraniteArt /> : <ShiraArt />}
    </svg>
  );
}

function GraniteArt() {
  return (
    <>
      <defs>
        <linearGradient id="granite-body" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#8c96a5" />
          <stop offset="1" stopColor="#3c4555" />
        </linearGradient>
        <radialGradient id="granite-core">
          <stop stopColor="#fff0b4" />
          <stop offset="1" stopColor="#e59634" />
        </radialGradient>
      </defs>
      <ellipse className="art-shadow" cx="160" cy="326" rx="94" ry="16" />
      <g className="art-rig">
        <g className="art-leg art-leg--back">
          <path d="M104 232 140 228 141 314 92 314Z" fill="#394150" />
          <path d="m88 302 55-3 12 25H77Z" fill="#252b38" />
        </g>
        <g className="art-arm art-arm--back">
          <path d="m88 119 41 17-24 119-55-26Z" fill="#444d5c" />
          <path d="m48 218 59 4-5 50-66-7Z" fill="#333b49" />
        </g>
        <path
          className="art-torso"
          d="m91 108 43-35 87 14 37 69-32 103-133-1-38-86Z"
          fill="url(#granite-body)"
        />
        <path d="m102 183 121-9-9 72-105 2Z" fill="#2f3745" opacity=".48" />
        <path d="m148 130 38-14 28 38-29 43-45-25Z" fill="url(#granite-core)" />
        <path d="m177 123-7 26 12 12-8 29" fill="none" stroke="#fff0bd" strokeWidth="7" />
        <g className="art-leg art-leg--front">
          <path d="m166 234 49-2 16 82h-59Z" fill="url(#granite-body)" />
          <path d="m167 301 66-2 21 25h-90Z" fill="#252b38" />
        </g>
        <g className="art-head">
          <path d="m105 45 45-32 78 17 20 57-34 42-89-8-35-44Z" fill="url(#granite-body)" />
          <path d="m104 63 112-15 15 28-119 18Z" fill="#252b38" />
          <ellipse cx="139" cy="75" rx="8" ry="10" fill="#fff0bd" />
          <ellipse cx="190" cy="68" rx="8" ry="10" fill="#fff0bd" />
          <path d="m139 105 45 4" stroke="#252b38" strokeWidth="7" strokeLinecap="round" />
        </g>
        <g className="art-arm art-arm--front">
          <path d="m223 118 47 22-21 112-54-18Z" fill="url(#granite-body)" />
          <path d="m203 222 60-4 26 39-44 36-57-21Z" fill="url(#granite-body)" />
          <path d="m228 142 23 10-14 50-18-4Z" fill="#bac2cd" opacity=".42" />
        </g>
      </g>
    </>
  );
}

function ShiraArt() {
  return (
    <>
      <defs>
        <linearGradient id="shira-suit" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ff7180" />
          <stop offset="1" stopColor="#b52e50" />
        </linearGradient>
        <linearGradient id="shira-blade" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#fff" />
          <stop offset=".55" stopColor="#75e6d8" />
          <stop offset="1" stopColor="#38a99e" />
        </linearGradient>
      </defs>
      <ellipse className="art-shadow" cx="160" cy="326" rx="70" ry="13" />
      <g className="art-rig">
        <g className="art-leg art-leg--back">
          <path d="m112 218 35 2-12 93H91Z" fill="#7e2945" />
          <path d="m90 300 46 1 13 23H72Z" fill="#3f2942" />
        </g>
        <g className="art-arm art-arm--back">
          <path d="m99 116 26 4-9 93-31-2Z" fill="#9f3451" />
          <circle cx="101" cy="220" r="17" fill="#fff7ef" stroke="#3f2942" strokeWidth="8" />
          <path d="m96 221-67 54 75-27Z" fill="url(#shira-blade)" stroke="#3f2942" strokeWidth="5" />
        </g>
        <path className="art-torso" d="m119 106 76-1 31 60-21 93h-93l-24-87Z" fill="url(#shira-suit)" />
        <path d="m142 111 36-3 10 140h-49Z" fill="#3f2942" opacity=".68" />
        <path d="m159 120 9 121" stroke="#5bd6c7" strokeWidth="10" />
        <g className="art-leg art-leg--front">
          <path d="m161 231 43-2 22 85h-49Z" fill="url(#shira-suit)" />
          <path d="m177 301 51-1 29 24h-83Z" fill="#3f2942" />
        </g>
        <g className="art-head">
          <path d="m99 38 53-30 62 24 27 64-40 42-82-5-35-49Z" fill="#3f2942" />
          <path d="m108 57 96-18 24 54-32 42-72-7-27-42Z" fill="#ffd8cb" />
          <path d="m100 53 46-38 68 17-33 38-31-13-25 27Z" fill="url(#shira-suit)" />
          <path d="m103 47-51 3 30 20-44 34 69-10Z" fill="#5bd6c7" stroke="#3f2942" strokeWidth="6" />
          <ellipse cx="142" cy="89" rx="6" ry="9" fill="#3f2942" />
          <ellipse cx="184" cy="85" rx="6" ry="9" fill="#3f2942" />
          <path d="m146 111q20 13 36-4" fill="none" stroke="#3f2942" strokeWidth="5" strokeLinecap="round" />
        </g>
        <g className="art-arm art-arm--front">
          <path d="m206 119 29 8 2 92-33 2Z" fill="url(#shira-suit)" />
          <circle cx="221" cy="226" r="18" fill="#fff7ef" stroke="#3f2942" strokeWidth="8" />
          <path d="m224 224 70-60-35 75Z" fill="url(#shira-blade)" stroke="#3f2942" strokeWidth="5" />
          <path d="m226 232 74 36-83-9Z" fill="url(#shira-blade)" stroke="#3f2942" strokeWidth="5" />
        </g>
      </g>
    </>
  );
}
