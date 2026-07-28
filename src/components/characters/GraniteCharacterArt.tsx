export function GraniteCharacterArt() {
  return (
    <>
      <defs>
        <linearGradient id="granite-body" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#929dab" />
          <stop offset="1" stopColor="#485261" />
        </linearGradient>
        <radialGradient id="granite-core">
          <stop stopColor="#fff4c7" />
          <stop offset="1" stopColor="#e6a13f" />
        </radialGradient>
      </defs>
      <ellipse className="art-shadow" cx="160" cy="327" rx="91" ry="15" />
      <g className="art-rig" stroke="#252b38" strokeWidth="7" strokeLinejoin="round">
        <g className="art-leg art-leg--back">
          <circle cx="126" cy="231" r="19" fill="#46505e" />
          <path d="m108 231 37-2 5 62-44 2Z" fill="#4b5564" />
          <circle cx="128" cy="288" r="15" fill="#6f7986" />
          <path d="m108 289 41-1 10 29-55 1Z" fill="#3a424f" />
          <path d="m103 309 57-1 14 18H90Z" fill="#252b38" />
        </g>
        <g className="art-arm art-arm--back">
          <circle cx="92" cy="137" r="24" fill="#424c5a" />
          <path d="m74 143 39-8-1 69-45 8Z" fill="#4b5563" />
          <circle cx="88" cy="205" r="16" fill="#6d7784" />
          <path d="m68 210 42-8 8 56-48 8Z" fill="#414a58" />
          <path d="m63 251 58-6 12 35-61 17-25-20Z" fill="#343c49" />
        </g>
        <path className="art-torso" d="m87 106 46-34 91 12 34 53-10 83-34 43-111-4-37-42-7-74Z" fill="url(#granite-body)" />
        <path d="m93 178 144-6-17 72-109 4Z" fill="#303846" opacity=".42" stroke="none" />
        <path d="m146 130 37-16 31 37-25 47-48-21Z" fill="url(#granite-core)" stroke="#ffe8a1" strokeWidth="5" />
        <path d="m177 123-8 26 13 12-9 29" fill="none" stroke="#fff4c7" strokeWidth="7" />
        <g className="art-leg art-leg--front">
          <circle cx="192" cy="232" r="20" fill="#66717f" />
          <path d="m171 233 43-3 9 61-48 3Z" fill="url(#granite-body)" />
          <circle cx="201" cy="289" r="15" fill="#7d8794" />
          <path d="m181 289 43-1 12 28-54 3Z" fill="#596372" />
          <path d="m180 308 59-2 22 20h-86Z" fill="#303744" />
        </g>
        <g className="art-head">
          <path d="m111 47 43-27 68 14 18 50-30 39-79-5-31-37Z" fill="url(#granite-body)" />
          <path d="m108 61 111-13 12 28-116 15Z" fill="#252b38" stroke="none" />
          <ellipse cx="143" cy="75" rx="8" ry="10" fill="#fff2b4" stroke="none" />
          <ellipse cx="188" cy="70" rx="8" ry="10" fill="#fff2b4" stroke="none" />
        </g>
        <g className="art-arm art-arm--front">
          <circle cx="231" cy="137" r="25" fill="#65707e" />
          <path d="m211 141 43-7 4 68-47 8Z" fill="url(#granite-body)" />
          <circle cx="235" cy="205" r="17" fill="#7c8794" />
          <path d="m213 207 46-8 10 56-50 10Z" fill="#687382" />
          <path d="m215 251 58-8 25 28-20 30-63-17-14-20Z" fill="url(#granite-body)" />
        </g>
      </g>
    </>
  );
}
