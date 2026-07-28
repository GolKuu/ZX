export function ShiraCharacterArt() {
  return (
    <>
      <defs>
        <linearGradient id="shira-shell" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#b99cf1" />
          <stop offset="1" stopColor="#7951c4" />
        </linearGradient>
        <linearGradient id="shira-blade" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#ffffff" />
          <stop offset=".58" stopColor="#9af0e4" />
          <stop offset="1" stopColor="#55cbbb" />
        </linearGradient>
      </defs>
      <ellipse className="art-shadow" cx="160" cy="321" rx="67" ry="12" />
      <g className="art-rig" stroke="#292441" strokeWidth="6" strokeLinejoin="round">
        <g className="art-leg art-leg--back">
          <circle cx="134" cy="244" r="13" fill="#6652a0" />
          <ellipse cx="120" cy="277" rx="17" ry="34" fill="none" stroke="#6f60ad" strokeWidth="12" />
          <path d="m105 303 30-7 7 23-28 13-18-13Z" fill="#6652a0" />
        </g>
        <g className="art-arm art-arm--back">
          <ellipse cx="93" cy="167" rx="24" ry="34" fill="#6652a0" />
          <ellipse cx="93" cy="167" rx="9" ry="17" fill="#fffdf9" stroke="none" />
          <circle cx="99" cy="132" r="18" fill="#fffdf9" />
          <path d="m96 137-68 73 78-38Z" fill="url(#shira-blade)" />
          <path d="m101 140 17 79 17-82Z" fill="#f8fbfa" />
        </g>
        <path className="art-torso" d="m160 101 45 28 7 72-24 51-28 18-30-18-23-51 7-72Z" fill="url(#shira-shell)" />
        <ellipse cx="160" cy="185" rx="28" ry="40" fill="#cfc1f3" stroke="none" opacity=".68" />
        <circle cx="160" cy="187" r="20" fill="#fffdf9" />
        <path d="m160 175 5 8 10 4-10 5-5 10-5-10-10-5 10-4Z" fill="#62d8c7" stroke="none" />
        <g className="art-leg art-leg--front">
          <circle cx="187" cy="244" r="13" fill="#62d8c7" />
          <ellipse cx="199" cy="277" rx="17" ry="34" fill="none" stroke="#62d8c7" strokeWidth="12" />
          <path d="m184 303 30-7 11 20-24 16-22-12Z" fill="#62d8c7" />
        </g>
        <g className="art-head">
          <path d="m123 78-34-31 9 47-23 19 49 4Z" fill="#62d8c7" />
          <path d="m197 78 34-31-9 47 23 19-49 4Z" fill="#62d8c7" />
          <ellipse cx="160" cy="95" rx="48" ry="38" fill="url(#shira-shell)" />
          <ellipse cx="160" cy="99" rx="31" ry="17" fill="#292441" stroke="none" />
          <ellipse cx="148" cy="98" rx="6" ry="9" fill="#cafff7" stroke="none" />
          <ellipse cx="173" cy="98" rx="6" ry="9" fill="#cafff7" stroke="none" />
          <circle cx="146" cy="95" r="2.5" fill="#fff" stroke="none" />
        </g>
        <g className="art-arm art-arm--front">
          <ellipse cx="227" cy="167" rx="24" ry="34" fill="#9b73e6" />
          <ellipse cx="227" cy="167" rx="9" ry="17" fill="#fffdf9" stroke="none" />
          <circle cx="220" cy="132" r="18" fill="#fffdf9" />
          <path d="m222 137 71 71-80-36Z" fill="url(#shira-blade)" />
          <path d="m217 140-16 79-18-82Z" fill="#f8fbfa" />
        </g>
      </g>
    </>
  );
}
