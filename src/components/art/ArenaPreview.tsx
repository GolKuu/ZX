import type { ArenaId } from '../../game/data/arenas/arenaCatalog';

export function ArenaPreview({ arenaId }: { arenaId: ArenaId }) {
  return (
    <svg
      className={`arena-preview arena-preview--${arenaId}`}
      viewBox="0 0 960 540"
      role="img"
      aria-label={arenaLabel(arenaId)}
    >
      <defs>
        <linearGradient id={`${arenaId}-sky`} x2="0" y2="1">
          <stop stopColor={arenaId === 'moon-nursery' ? '#293a58' : '#a9d2df'} />
          <stop offset="1" stopColor={arenaId === 'paper-harbor' ? '#f4d9cf' : '#f7dfb9'} />
        </linearGradient>
      </defs>
      <rect width="960" height="540" rx="32" fill={`url(#${arenaId}-sky)`} />
      {arenaId === 'quiet-canopy' && <QuietCanopy />}
      {arenaId === 'moon-nursery' && <MoonNursery />}
      {arenaId === 'paper-harbor' && <PaperHarbor />}
      <path d="M0 433 Q240 414 480 432 T960 424 V540 H0Z" fill="#424b59" />
      <path d="M0 433 Q240 414 480 432 T960 424" fill="none" stroke={accent(arenaId)} strokeWidth="10" />
      <ellipse cx="480" cy="460" rx="292" ry="22" fill="#171b24" opacity=".18" />
    </svg>
  );
}

function QuietCanopy() {
  return (
    <>
      <circle cx="770" cy="96" r="54" fill="#ffd56f" opacity=".9" />
      <circle cx="770" cy="96" r="78" fill="none" stroke="#fff" strokeWidth="16" opacity=".2" />
      <path d="M0 414 218 220 420 414ZM286 414 570 255 820 414Z" fill="#789889" opacity=".72" />
      <g fill="#fff" opacity=".55">
        <ellipse cx="145" cy="115" rx="102" ry="36" />
        <ellipse cx="445" cy="160" rx="74" ry="27" />
      </g>
      <g fill="#eaf4d8" opacity=".75">
        <circle cx="110" cy="376" r="54" /><circle cx="176" cy="374" r="72" />
        <circle cx="850" cy="380" r="76" /><circle cx="914" cy="369" r="52" />
      </g>
    </>
  );
}

function MoonNursery() {
  return (
    <>
      <circle cx="180" cy="92" r="48" fill="#e8fff9" opacity=".76" />
      <circle cx="180" cy="92" r="70" fill="none" stroke="#91e4d3" strokeWidth="4" opacity=".45" />
      <path d="M70 0 104 140M230 0 260 174M390 0 420 126M550 0 580 160M710 0 740 128M870 0 900 170" stroke="#a7ded3" strokeWidth="6" opacity=".28" />
      <g fill="#9af2dc">
        <circle cx="104" cy="140" r="12" /><circle cx="260" cy="174" r="12" />
        <circle cx="420" cy="126" r="12" /><circle cx="580" cy="160" r="12" />
        <circle cx="740" cy="128" r="12" /><circle cx="900" cy="170" r="12" />
      </g>
      <path d="M0 420 Q55 270 112 420T224 420T336 420T448 420T560 420T672 420T784 420T896 420T1008 420" fill="#315d57" opacity=".78" />
      <rect x="40" y="42" width="880" height="350" rx="175" fill="none" stroke="#8bdacb" strokeWidth="5" opacity=".3" />
    </>
  );
}

function PaperHarbor() {
  return (
    <>
      <path d="M130 92 238 139 160 184Z M690 78 828 126 750 194Z" fill="#fff" opacity=".64" />
      <path d="M160 184 150 410M750 194 765 410" stroke="#4f5776" strokeWidth="5" opacity=".35" />
      <path d="M376 150 530 210 420 294Z" fill="#ff7185" opacity=".68" />
      <path d="M0 326 Q125 292 250 326T500 326T750 326T1000 326V434H0Z" fill="#7478c6" opacity=".44" />
      <g fill="#fff" opacity=".28">
        <path d="M30 356 68 320 102 358Z" /><path d="M240 375 282 333 326 378Z" />
        <path d="M560 350 608 310 650 353Z" /><path d="M812 375 858 328 902 377Z" />
      </g>
    </>
  );
}

function accent(arenaId: ArenaId) {
  if (arenaId === 'moon-nursery') return '#75e0ce';
  if (arenaId === 'paper-harbor') return '#ff7185';
  return '#ffb95a';
}

function arenaLabel(arenaId: ArenaId) {
  if (arenaId === 'moon-nursery') return 'Лунный питомник: ночная оранжерея';
  if (arenaId === 'paper-harbor') return 'Бумажная гавань со складными парусами';
  return 'Тихая крона: сад над облаками';
}
