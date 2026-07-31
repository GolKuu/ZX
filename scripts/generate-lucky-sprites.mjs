import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const out = path.resolve('public/sprites/lucky-profile');
const attacks = path.resolve('public/sprites/lucky-attacks');
await Promise.all([mkdir(out, { recursive: true }), mkdir(attacks, { recursive: true })]);

const C = {
  ink: '#090d0a', green: '#164c36', greenHi: '#247552',
  gold: '#dab34a', red: '#941e35', skin: '#b97963', boot: '#111511',
};

const parts = {
  head: [40, 52, `<path fill="${C.ink}" d="M8 8h22v6h6v22h-7v10H12v-8H6V16h2z"/><path fill="${C.skin}" d="M10 17h21v19H12V31H8V20h2z"/><path fill="${C.gold}" d="M24 22h8v3h-8z"/><path fill="${C.red}" d="M9 37h17v5H9z"/>`],
  torso: [46, 68, `<path fill="${C.ink}" d="M8 3h25l8 15-5 46H9L4 20z"/><path fill="${C.green}" d="M23 5h12l6 14-7 40H21z"/><path fill="${C.greenHi}" d="M26 9h5v31h-5z"/><path fill="${C.gold}" d="M9 13h5v31H9z"/><path fill="${C.red}" d="M7 51h30v6H7z"/>`],
  hips: [38, 34, `<path fill="${C.ink}" d="M4 4h30l2 17-8 10H8L2 20z"/><path fill="${C.green}" d="M19 6h15l-3 20H19z"/><path fill="${C.gold}" d="M4 4h30v5H4z"/>`],
  sash: [20, 82, `<path fill="${C.red}" d="M3 1h13l-2 32 4 16-8 31-7-3 5-29-5-16z"/><path fill="${C.gold}" d="M4 2h12v6H4z"/>`],
  ponytail: [20, 62, `<path fill="${C.ink}" d="M3 2h13l2 13-8 12 5 13-9 20-5-4 6-17-5-14 7-12z"/><path fill="${C.gold}" d="M5 25h9v5H5z"/>`],
  upperArm: [22, 54, `<path fill="${C.green}" d="M5 2h12l3 18-5 31H5L2 19z"/><path fill="${C.gold}" d="M4 8h15v5H4z"/>`],
  forearm: [20, 50, `<path fill="${C.ink}" d="M5 1h11l2 30-5 16H5L2 31z"/><path fill="${C.skin}" d="M5 34h10v13H5z"/><path fill="${C.red}" d="M3 27h14v6H3z"/>`],
  thigh: [26, 58, `<path fill="${C.ink}" d="M5 2h16l3 20-6 33H7L2 21z"/><path fill="${C.green}" d="M14 5h7l1 18-7 25z"/>`],
  shin: [24, 56, `<path fill="${C.ink}" d="M6 1h13l3 34-7 18H5L2 34z"/><path fill="${C.green}" d="M14 5h5l1 27-7 15z"/>`],
  boot: [38, 22, `<path fill="${C.boot}" d="M4 3h15l4 8 13 4-2 5H5L2 14z"/><path fill="${C.gold}" d="M18 10h7v4h-7z"/>`],
};

for (const [name, [width, height, body]] of Object.entries(parts)) {
  await render(path.join(out, `${name}.png`), width, height, body);
}

const poses = {
  lp: pose(`<path fill="${C.skin}" d="M72 72h49v13H72z"/><path fill="${C.gold}" d="M113 69h10v19h-10z"/>`),
  lk: pose(`<path fill="${C.green}" d="M59 93h61v27H59z"/><path fill="${C.red}" d="M92 95h24v8H92z"/>`),
  hp: pose(`<path fill="${C.ink}" d="M49 151h73v16H49z"/><path fill="${C.gold}" d="M110 146h14v25h-14z"/>`, true),
  hk: pose(`<path fill="${C.ink}" d="M53 107l55-51 12 12-54 56z"/><path fill="${C.gold}" d="M105 51l17 14-8 9-17-14z"/>`),
};

for (const [name, body] of Object.entries(poses)) {
  await render(path.join(attacks, `${name}.png`), 128, 240, body);
}

async function render(target, width, height, body) {
  const source = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">${body}</svg>`;
  await sharp(Buffer.from(source))
    .resize(width * 2, height * 2, { kernel: 'nearest' })
    .png({ palette: true, colours: 24 })
    .toFile(target);
}

function pose(extra, low = false) {
  const y = low ? 17 : 18;
  return `<g transform="translate(0 ${y})">
    <path fill="#050806" d="M26 7h31l7 9-10 6H27l-8-7z"/>
    <path fill="${C.ink}" d="M17 47h14l5 59-13 27-9-5 9-28-12-45z"/>
    <path fill="${C.gold}" d="M13 70h16v6H13z"/>
    <path fill="${C.ink}" d="M30 29h31l13 50-12 55H28L17 79z"/>
    <path fill="${C.green}" d="M46 32h16l10 45-18 47H43z"/>
    <path fill="${C.greenHi}" d="M51 38h7l6 34-11 32z"/>
    <path fill="${C.ink}" d="M23 110h18l-8 43-16 24-8-5 13-30z"/>
    <path fill="${C.green}" d="M43 112h22l11 54-14 14-14-38z"/>
    <path fill="${C.skin}" d="M29 4h29v29H29z"/>
    <path fill="${C.gold}" d="M47 12h14v5H47z"/>
    <path fill="#6f433c" d="M30 26h27v7H30z"/>
    <path fill="${C.gold}" d="M28 34h14l8 13-7 5-9-10-8 4z"/>
    <path fill="${C.ink}" d="M31 128h18l-5 80H25zM51 128h17l18 73-18 5z"/>
    <path fill="${C.green}" d="M35 134h8l-5 58h-8zM56 134h8l14 58h-8z"/>
    <path fill="${C.boot}" d="M18 202h29v14H14zM65 199h30v14H66z"/>
    <path fill="${C.red}" d="M25 112h42v7H25z"/>
    <path fill="${C.gold}" d="M38 111h8v9h-8zM54 111h7v9h-7z"/>
    <path fill="${C.red}" d="M57 55h5v23h-5z"/>
    ${extra}
  </g>`;
}

await writeFile(
  path.join(attacks, 'poses.json'),
  `${JSON.stringify({
    displayScale: 1.1,
    facesRight: true,
    textureScale: 2,
    poses: Object.fromEntries(Object.keys(poses).map((name) => [
      name,
      { width: 128, height: 240, ground: 0.92 },
    ])),
  }, null, 2)}\n`,
);
