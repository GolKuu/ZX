export const luckyDefs = `<defs>
  <linearGradient id="jade" x1="0" y1="0" x2="1" y2="1">
    <stop stop-color="#3d9b76"/><stop offset=".42" stop-color="#126044"/>
    <stop offset="1" stop-color="#071f18"/>
  </linearGradient>
  <linearGradient id="jadeDark" x1="0" y1="0" x2="1" y2=".8">
    <stop stop-color="#174f3b"/><stop offset="1" stop-color="#061510"/>
  </linearGradient>
  <linearGradient id="gold" x1="0" y1="0" x2=".8" y2="1">
    <stop stop-color="#fff0a4"/><stop offset=".3" stop-color="#e9bd4d"/>
    <stop offset=".72" stop-color="#9a5917"/><stop offset="1" stop-color="#ffe178"/>
  </linearGradient>
  <linearGradient id="skin" x1=".1" y1="0" x2=".9" y2="1">
    <stop stop-color="#f4c4a7"/><stop offset=".48" stop-color="#bd7563"/>
    <stop offset="1" stop-color="#653e3b"/>
  </linearGradient>
  <linearGradient id="crimson" x1="0" y1="0" x2="1" y2="1">
    <stop stop-color="#d43e56"/><stop offset=".55" stop-color="#85152f"/>
    <stop offset="1" stop-color="#360914"/>
  </linearGradient>
  <radialGradient id="hair" cx=".68" cy=".2" r=".9">
    <stop stop-color="#24332c"/><stop offset=".55" stop-color="#0a100d"/>
    <stop offset="1" stop-color="#020403"/>
  </radialGradient>
  <filter id="rim" x="-30%" y="-30%" width="160%" height="160%">
    <feDropShadow dx="0" dy="1.2" stdDeviation=".8" flood-color="#020504" flood-opacity=".85"/>
  </filter>
</defs>`;

const edge = '#050907';
const stroke = `stroke="${edge}" stroke-width="1.5"`;
const seam = `fill="none" stroke="#79c5a6" stroke-opacity=".45" stroke-width=".8"`;

export const luckyParts = {
  head: { width: 40, height: 52, art: `<g filter="url(#rim)">
    <path fill="url(#hair)" ${stroke} d="M7 13Q9 3 22 3q13 1 15 13l-3 18-9 12H12L6 35z"/>
    <path fill="url(#skin)" ${stroke} d="M11 16q8-7 21 0l1 13-5 3-3 9H13l-4-9z"/>
    <path fill="#17110d" d="M9 14q12-14 26 1-11-3-23 5z"/>
    <path fill="url(#gold)" ${stroke} d="M9 14q13-6 27 1l-2 5q-13-5-24 0z"/>
    <path fill="#e9d07c" d="M25 23h6v2h-6z"/><path fill="#26100f" d="M27 24h2v2h-2z"/>
    <path ${seam} d="M15 32q6 4 11 0"/><path fill="url(#crimson)" d="M11 40h17l-3 6H14z"/>
  </g>` },
  torso: { width: 46, height: 68, art: `<g filter="url(#rim)">
    <path fill="url(#jadeDark)" ${stroke} d="M10 3h24l9 16-5 45H8L3 20z"/>
    <path fill="url(#jade)" d="M24 5h10l7 15-7 39H22z"/>
    <path fill="#07100c" d="M10 5l13 16-8 13L7 18z"/>
    <path fill="url(#gold)" ${stroke} d="M9 8l15 13-5 6L7 17z"/>
    <path fill="url(#crimson)" ${stroke} d="M7 51h32l-1 8H8z"/>
    <path ${seam} d="M29 10l-3 39M13 34l2 13M32 29l5 4"/>
    <path fill="url(#gold)" d="M29 31l3 3-3 3-3-3z"/>
  </g>` },
  hips: { width: 38, height: 34, art: `<g filter="url(#rim)">
    <path fill="url(#jadeDark)" ${stroke} d="M4 4h30l2 17-8 10H8L2 20z"/>
    <path fill="url(#jade)" d="M20 7h13l-2 18-9 4z"/>
    <path fill="url(#gold)" ${stroke} d="M3 4h32v6H3z"/>
    <path ${seam} d="M9 14l4 12M29 13l-4 13"/>
  </g>` },
  sash: { width: 20, height: 82, art: `<g filter="url(#rim)">
    <path fill="url(#crimson)" ${stroke} d="M3 2h13l-2 31 4 16-8 31-7-4 5-28-5-16z"/>
    <path fill="url(#gold)" d="M3 2h13v7H3z"/>
    <path ${seam} d="M9 13L9 43l4 8-6 22"/>
  </g>` },
  ponytail: { width: 20, height: 62, art: `<g filter="url(#rim)">
    <path fill="url(#hair)" ${stroke} d="M4 2h11l3 12-8 13 6 12-9 21-6-4 6-17-5-14 7-12z"/>
    <path fill="url(#gold)" ${stroke} d="M4 24h11v7H4z"/>
    <path ${seam} d="M9 33l3 8-7 14"/>
  </g>` },
  upperArm: { width: 22, height: 54, art: `<g filter="url(#rim)">
    <path fill="url(#jade)" ${stroke} d="M5 2h12l3 17-5 32H5L2 19z"/>
    <path fill="url(#gold)" d="M3 8h16v6H3z"/><path ${seam} d="M15 17l-4 28"/>
  </g>` },
  forearm: { width: 20, height: 50, art: `<g filter="url(#rim)">
    <path fill="url(#jadeDark)" ${stroke} d="M5 1h11l2 30-5 16H5L2 31z"/>
    <path fill="url(#skin)" ${stroke} d="M5 34h10v13H5z"/>
    <path fill="url(#crimson)" d="M3 26h14v8H3z"/><path fill="url(#gold)" d="M4 26h13v3H4z"/>
  </g>` },
  thigh: { width: 26, height: 58, art: `<g filter="url(#rim)">
    <path fill="url(#jadeDark)" ${stroke} d="M5 2h16l3 20-6 33H7L2 21z"/>
    <path fill="url(#jade)" d="M14 5h7l1 18-7 25z"/><path ${seam} d="M8 18l7 5-4 23"/>
  </g>` },
  shin: { width: 24, height: 56, art: `<g filter="url(#rim)">
    <path fill="url(#jadeDark)" ${stroke} d="M6 1h13l3 34-7 18H5L2 34z"/>
    <path fill="url(#jade)" d="M14 5h5l1 27-7 15z"/><path fill="url(#gold)" d="M3 33h18v5H3z"/>
  </g>` },
  boot: { width: 38, height: 22, art: `<g filter="url(#rim)">
    <path fill="url(#hair)" ${stroke} d="M4 3h15l5 8 12 4-2 5H5L2 14z"/>
    <path fill="url(#gold)" d="M18 9h8v5h-8z"/><path stroke="#315746" stroke-width="1" d="M7 17h25"/>
  </g>` },
};

const face = `<path fill="url(#hair)" ${stroke} d="M58 24q4-18 22-18 20 2 23 23L98 51H65L55 39z"/>
  <path fill="url(#skin)" ${stroke} d="M64 25q13-9 31 1l1 17-8 3-4 10H69l-7-12z"/>
  <path fill="url(#gold)" ${stroke} d="M62 22q17-8 36 2l-2 7q-18-7-32 0z"/>
  <path fill="#f6df8b" d="M85 34h8v2h-8z"/><path fill="#1c100e" d="M88 34h2v3h-2z"/>`;
const body = `<path fill="url(#jadeDark)" ${stroke} d="M49 56q23-10 49 1l16 57-13 72H47l-14-71z"/>
  <path fill="url(#jade)" d="M74 58h23l14 57-18 63H72z"/>
  <path fill="#07100c" d="M49 57l25 28-13 22-26-20z"/>
  <path fill="url(#gold)" ${stroke} d="M46 59l28 25-7 9-28-22z"/>
  <path fill="url(#crimson)" ${stroke} d="M45 169h59l-2 13H47z"/>
  <path ${seam} d="M82 66l-4 93M60 111l6 36M91 108l12 7"/>
  <path fill="url(#gold)" d="M85 112l6 6-6 6-6-6z"/>`;
const backArm = `<path fill="url(#jadeDark)" ${stroke} d="M49 65q-18 4-23 25l-7 54 15 3 15-47 15-29z"/>
  <path fill="url(#crimson)" d="M20 132h16l-2 13H19z"/><path fill="url(#skin)" ${stroke} d="M19 144h16l-3 21-13 2-6-10z"/>`;
const baseLegs = `<path fill="url(#jadeDark)" ${stroke} d="M50 178h26l-8 71-17 48H29l18-56z"/>
  <path fill="url(#jade)" ${stroke} d="M76 178h27l19 62-1 55H99l-8-47-18-41z"/>
  <path fill="url(#gold)" d="M37 268h30l-5 8H35zM99 267h23v8h-22z"/>
  <path fill="url(#hair)" ${stroke} d="M27 290h36l6 17H20zM98 289h29l17 17H98z"/>`;

export function attackPose(kind) {
  const move = {
    lp: `<path fill="url(#jade)" ${stroke} d="M96 65q20 3 27 20l38 7-1 17-50-4-20-23z"/>
      <path fill="url(#crimson)" d="M142 91h19v19h-19z"/><path fill="url(#skin)" ${stroke} d="M159 92h16l4 8-8 11-12-3z"/>`,
    lk: `<path fill="url(#jade)" ${stroke} d="M94 64q27 0 39 23l30 18-9 17-42-18-25-24z"/>
      <path fill="url(#gold)" d="M123 84l13 7-8 14-13-7z"/><path fill="url(#skin)" ${stroke} d="M153 104l18 8-2 13-19-3z"/>`,
    hp: `<path fill="url(#jade)" ${stroke} d="M89 69q30 4 43 24l31 38-14 12-40-32-25-28z"/>
      <path fill="url(#crimson)" d="M145 126l16 16-10 10-17-16z"/><path fill="url(#skin)" ${stroke} d="M155 135l18 14-5 14-21-13z"/>
      <path fill="url(#jadeDark)" ${stroke} d="M53 184l68 23 47 25-8 18-55-15-61-18z"/>
      <path fill="url(#hair)" ${stroke} d="M151 226l27 10-5 20-30-9z"/>`,
    hk: `<path fill="url(#jade)" ${stroke} d="M93 68q25 2 35 23l25 25-13 14-38-28-17-25z"/>
      <path fill="url(#crimson)" d="M137 111l17 15-10 11-17-16z"/>
      <path fill="url(#jadeDark)" ${stroke} d="M72 181l34-54 35-61 19 10-24 67-38 58z"/>
      <path fill="url(#gold)" d="M136 66l24 10-5 10-24-11z"/><path fill="url(#hair)" ${stroke} d="M148 45l27 20-12 22-25-16z"/>`,
  }[kind];
  const legs = kind === 'hp' || kind === 'hk' ? baseLegs.replace('M76 178h27', 'M75 181h25') : baseLegs;
  const transform = kind === 'hp' ? 'translate(-10 10) rotate(-10 76 170)' : '';
  return `<g transform="${transform}" filter="url(#rim)">${backArm}${legs}${body}${face}${move}
    <path fill="url(#crimson)" ${stroke} d="M88 178h17l17 51-9 38-10-34-12-29z"/>
    <path fill="url(#gold)" d="M94 181h10l5 13H97z"/>
  </g>`;
}
