import type { CharacterDefinition } from '../../game/data/characters/circleFighters';

export function CharacterSkinDetails({ character }: { character: CharacterDefinition }) {
  const accent = character.accentCss;
  switch (character.id) {
    case 'granite':
      return <><path d="m129 151 25-30 31 12 12 37-25 39-39-14Z" fill="#ffdc62" /><path d="m158 132-7 24 13 12-6 23" className="skin-line" /></>;
    case 'caliber':
      return <><rect x="113" y="138" width="95" height="22" rx="8" fill={accent} /><circle cx="137" cy="149" r="7" /><circle cx="160" cy="149" r="7" /><circle cx="183" cy="149" r="7" /></>;
    case 'volt':
      return <path d="m155 121 18 29-13 10 15 18-27 40 9-40-15-13 17-15Z" fill={accent} />;
    case 'nocturne':
      return <><circle cx="160" cy="172" r="31" fill="#2a2149" opacity=".54" /><path d="M160 143a30 30 0 1 0 28 40 24 24 0 1 1-28-40Z" fill={accent} /></>;
    case 'ragnar':
      return <><path d="m105 139 31 17-18 19-32-10Zm110 0-31 17 18 19 32-10Z" fill="#fff3d1" /><path d="m139 126 21 61 22-61" className="skin-line" /></>;
    case 'marina':
      return <><path d="M160 119c31 40 24 76 0 99-25-23-31-59 0-99Z" fill={accent} /><circle cx="160" cy="170" r="12" fill="#eaffff" opacity=".7" /></>;
    case 'zephyr':
      return <><path d="M122 153c24-21 51-13 60 4 13-11 29-7 38 4-14 10-28 13-45 8-13 17-37 14-53-16Z" fill="#fff" opacity=".62" /><path d="m129 205 67-25" className="skin-line" /></>;
    case 'origami':
      return <><path d="m101 149 59 26-27 23Zm118 0-59 26 27 23Z" fill="#fff" opacity=".66" /><path d="m160 109-13 69 13 53 14-53Z" fill={accent} /></>;
    case 'poro':
      return <><circle cx="130" cy="167" r="8" opacity=".2" /><circle cx="189" cy="189" r="12" opacity=".18" /><circle cx="152" cy="224" r="6" opacity=".22" /><path d="M124 149q36 24 72 0" className="skin-line" /></>;
    case 'fenr':
      return <><path d="m118 130 42 34 42-34-18 57-24 30-25-31Z" fill={accent} opacity=".65" /><path d="m123 206 22-15m52 15-22-15" className="skin-line" /></>;
    case 'sylvan':
      return <><path d="m160 104-20 54 18 29-17 52m20-84 28-24m-28 57 25 33" className="skin-line" /><circle cx="189" cy="131" r="10" fill={accent} /></>;
    case 'adamant':
      return <><path d="m160 111 42 27-11 72-31 38-32-38-10-72Z" fill={accent} opacity=".54" /><path d="m160 122v107m-34-78h68" className="skin-line" /></>;
    case 'vassa':
      return <><path d="M126 139q68 18 37 63t18 55" className="skin-line" /><path d="m145 151 18 12-17 13" fill="none" stroke={accent} strokeWidth="8" /></>;
    case 'shira':
      return <><path d="m128 138-64 29 61 12m68-41 64 29-61 12" fill="none" stroke="#eaffff" strokeWidth="16" /><circle cx="160" cy="171" r="24" fill={accent} opacity=".62" /></>;
    case 'pyron':
      return <><path d="M160 111c31 42 18 82 0 108-25-24-34-67 0-108Z" fill="#ffdc62" /><path d="M160 145c13 21 9 39 0 52-10-13-15-32 0-52Z" fill="#fff7d1" /></>;
  }
}

export function CharacterFace({
  face,
  accent,
}: {
  face: 'visor' | 'eyes' | 'single' | 'mask';
  accent: string;
}) {
  if (face === 'single') {
    return <><circle cx="160" cy="79" r="16" fill="#292441" /><circle cx="160" cy="79" r="8" fill={accent} /><circle cx="156" cy="75" r="3" fill="white" /></>;
  }
  if (face === 'mask') {
    return <><path d="m126 70 34-14 35 14-14 28h-42Z" fill="#292441" /><path d="m139 75 13 5m29-5-13 5" className="skin-line" /></>;
  }
  if (face === 'eyes') {
    return <><path d="m126 73 25 8m43-8-25 8" className="skin-line" /><circle cx="146" cy="79" r="5" fill="white" /><circle cx="176" cy="79" r="5" fill="white" /></>;
  }
  return <><path d="M123 68q37-18 74 0l-7 25q-30 15-61 0Z" fill="#292441" /><path d="m139 80 14 2m29-2-14 2" stroke={accent} strokeWidth="7" strokeLinecap="round" /></>;
}
