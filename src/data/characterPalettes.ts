import type { CharacterId } from './characterRoster';

/**
 * Per-character colour identity.
 *
 * Four meshes serve five slots, so the palette is doing most of the work of
 * telling the roster apart on screen. That is a stopgap, but it is the correct
 * stopgap: colour is the fastest read a player has, faster than silhouette at
 * the distance a match is actually played at.
 *
 * One rule governs every row (`ART-CCU-400` §A2, `CHR-CCU-810` §5): the shaded
 * value is a **hue shift**, never a darker version of the lit value. Skin goes
 * plum, near-white goes lilac, dark cloth goes violet or teal. A grey multiply
 * anywhere here is the single most common way this look is lost.
 */
export interface ZonePalette {
  readonly lit: string;
  readonly shade: string;
  readonly rim: number;
  readonly shadow: number;
}

export interface CharacterPalette {
  readonly hair: ZonePalette;
  readonly skin: ZonePalette;
  readonly coat: ZonePalette;
  readonly trousers: ZonePalette;
  readonly boot: ZonePalette;
  readonly eye: ZonePalette;
  readonly body: ZonePalette;
}

function zone(
  lit: string,
  shade: string,
  rim = 0.85,
  shadow = 0.85,
): ZonePalette {
  return { lit, shade, rim, shadow };
}

/** Void Walker — near-black indigo, violet shade, cyan reservation. */
/** MIM — yellow skin and scarf, purple hoodie, clean white sneakers. */
const MIM: CharacterPalette = {
  hair: zone('#ffd52a', '#ee8f2c', 1.0, 0.72),
  skin: zone('#ffd52a', '#ee8f2c', 0.8, 0.72),
  coat: zone('#6f35cf', '#35156f', 1.0, 0.82),
  trousers: zone('#5b2db6', '#2b145f', 0.82, 0.82),
  boot: zone('#faf9ff', '#c8b7eb', 1.0, 0.68),
  eye: zone('#3c176f', '#210c43', 0, 0),
  body: zone('#6f35cf', '#35156f', 1.0, 0.82),
};

/** ECHO — white armour, cyan telemetry and a deep navy undersuit. */
const ECHO: CharacterPalette = {
  hair: zone('#f7fbff', '#8fd7eb', 1.05, 0.72),
  skin: zone('#eef8ff', '#87bfd3', 0.72, 0.68),
  coat: zone('#f4f8fb', '#6fa9c2', 1.1, 0.72),
  trousers: zone('#0d2744', '#155777', 0.82, 0.78),
  boot: zone('#102b49', '#1d6683', 0.95, 0.74),
  eye: zone('#54e7ff', '#1b83a4', 0, 0),
  body: zone('#f4f8fb', '#6fa9c2', 1.1, 0.72),
};

const VOID_WALKER: CharacterPalette = {
  hair: zone('#f2f0fb', '#9b93d6', 1.0, 0.8),
  skin: zone('#e8c3a4', '#9c6a8a', 0.62, 0.7),
  coat: zone('#1c1938', '#4a2b8e'),
  trousers: zone('#161327', '#33265e', 0.7, 0.8),
  boot: zone('#0e0c18', '#2a2140', 1.1, 0.75),
  eye: zone('#f8fbff', '#8f9ac4', 0, 0),
  body: zone('#1c1938', '#4a2b8e'),
};

/** Blade Phantom — deep green and steel, teal shade. */
const BLADE_PHANTOM: CharacterPalette = {
  hair: zone('#4fd08a', '#1c6b57', 1.0, 0.75),
  skin: zone('#d9a077', '#94566c', 0.62, 0.7),
  coat: zone('#1d4a38', '#12506f'),
  trousers: zone('#13201b', '#153048', 0.7, 0.8),
  boot: zone('#0d1512', '#1b3a44', 1.1, 0.75),
  eye: zone('#f7fdfa', '#7fa898', 0, 0),
  body: zone('#1d4a38', '#12506f'),
};

/** Element Sage — saffron and ochre, warm shade running to rust. */
const ELEMENT_SAGE: CharacterPalette = {
  hair: zone('#3b2f2a', '#6b3a4e', 0.9, 0.8),
  skin: zone('#eec6a0', '#a86478', 0.62, 0.7),
  coat: zone('#c97a24', '#8c3a2e'),
  trousers: zone('#7d3f18', '#5a2436', 0.7, 0.8),
  boot: zone('#3a2314', '#4a2130', 1.0, 0.75),
  eye: zone('#fbfaf5', '#a8917f', 0, 0),
  body: zone('#c97a24', '#8c3a2e'),
};

/** Idol — performance pink, stage gold and clean white. */
const IDOL: CharacterPalette = {
  hair: zone('#f04f91', '#9d3e8d', 1.0, 0.76),
  skin: zone('#efc3aa', '#a76686', 0.62, 0.7),
  coat: zone('#f04f91', '#a73d86'),
  trousers: zone('#fff8f1', '#c48ab1', 0.72, 0.76),
  boot: zone('#fffaf3', '#b77ca8', 1.0, 0.72),
  eye: zone('#fff8d7', '#d6a237', 0, 0),
  body: zone('#f04f91', '#a73d86'),
};

/** Chrono — black coat, cold silver armour and saturated time-blue. */
const CHRONO: CharacterPalette = {
  hair: zone('#e7edf5', '#8296b5', 1.05, 0.78),
  skin: zone('#e2b89d', '#9a677f', 0.62, 0.7),
  coat: zone('#111725', '#1c3156', 1.05, 0.82),
  trousers: zone('#172b48', '#102033', 0.82, 0.8),
  boot: zone('#cbd7e6', '#607898', 1.18, 0.75),
  eye: zone('#42b9ff', '#236d9d', 0, 0),
  body: zone('#111725', '#1c3156'),
};

/** Velocity King — bleached bone and hot magenta, the fastest read. */
const VELOCITY_KING: CharacterPalette = {
  hair: zone('#e8e4dc', '#a06a94', 1.0, 0.78),
  skin: zone('#e6c4a8', '#a05f7e', 0.62, 0.7),
  coat: zone('#2a2130', '#8e2a6a'),
  trousers: zone('#1d1722', '#5c2450', 0.7, 0.8),
  boot: zone('#120e16', '#3d1836', 1.1, 0.75),
  eye: zone('#fff8fc', '#b98aa8', 0, 0),
  body: zone('#2a2130', '#8e2a6a'),
};

/** Elastic Brawler — straw and crimson, the warmest of the five. */
const ELASTIC_BRAWLER: CharacterPalette = {
  hair: zone('#2e2622', '#7a3a3a', 0.9, 0.8),
  skin: zone('#f0c49c', '#b06a6a', 0.62, 0.7),
  coat: zone('#c8362f', '#7a2350'),
  trousers: zone('#2f4d7a', '#243a6b', 0.7, 0.8),
  boot: zone('#e2d7b4', '#9a7a62', 0.9, 0.7),
  eye: zone('#fffaf2', '#b09a80', 0, 0),
  body: zone('#c8362f', '#7a2350'),
};

const PALETTES: Record<CharacterId, CharacterPalette> = {
  mim: MIM,
  echo: ECHO,
  zoro: BLADE_PHANTOM,
  aang: ELEMENT_SAGE,
  idol: IDOL,
  chrono: CHRONO,
  'void-walker': VOID_WALKER,
  'velocity-king': VELOCITY_KING,
  'elastic-brawler': ELASTIC_BRAWLER,
};

export function paletteFor(characterId: CharacterId): CharacterPalette {
  return PALETTES[characterId];
}

/**
 * Where each zone sits up a humanoid, as a fraction of bind-pose height.
 *
 * Every model in `public/models/` ships one or two merged materials, so the
 * keyword pass in `loadFighterModel` resolves a whole character to a single
 * zone and paints it one flat colour — a bare mannequin, or one green blob.
 * Slicing by height recovers boots, trousers, coat, skin and hair from geometry
 * the vendor never separated. Proportions are a standing figure's: feet to
 * mid-calf, calf to waist, waist to collar, collar to brow, brow to crown.
 */
export const ZONE_HEIGHTS = {
  boot: 0.075,
  trousers: 0.5,
  coat: 0.8,
  skin: 0.915,
  hair: 1,
} as const satisfies Readonly<Record<string, number>>;

export interface PaletteBand {
  readonly upTo: number;
  readonly lit: string;
  readonly shade: string;
}

/** The palette read as vertical bands, lowest first. */
export function bandsFor(palette: CharacterPalette): readonly PaletteBand[] {
  return [
    { upTo: ZONE_HEIGHTS.boot, ...pair(palette.boot) },
    { upTo: ZONE_HEIGHTS.trousers, ...pair(palette.trousers) },
    { upTo: ZONE_HEIGHTS.coat, ...pair(palette.coat) },
    { upTo: ZONE_HEIGHTS.skin, ...pair(palette.skin) },
    { upTo: ZONE_HEIGHTS.hair, ...pair(palette.hair) },
  ];
}

function pair({ lit, shade }: ZonePalette): { lit: string; shade: string } {
  return { lit, shade };
}
